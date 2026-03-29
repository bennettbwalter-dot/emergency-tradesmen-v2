import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const publicDir = path.resolve(__dirname, '..', 'public');

// Download a URL to a local file
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(dest);
        protocol.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            response.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { fs.unlink(dest, () => { }); reject(err); });
    });
}

async function convertToWebp(inputPath) {
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    if (fs.existsSync(outputPath)) {
        return outputPath;
    }
    try {
        await sharp(inputPath)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);
        return outputPath;
    } catch (err) {
        console.error(`  ❌ Failed to convert ${inputPath}:`, err.message);
        return null;
    }
}

async function run() {
    // Get all posts
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, slug, cover_image, content')
        .order('published_at', { ascending: false });

    if (error) { console.error(error); return; }

    let updatedCovers = 0;
    let updatedContent = 0;
    let failedPosts = [];

    for (const post of posts) {
        let newCoverImage = post.cover_image;
        let newContent = post.content;
        let needsUpdate = false;

        // --- COVER IMAGE ---
        if (post.cover_image && !post.cover_image.endsWith('.webp')) {
            // Handle external URLs (Unsplash etc)
            if (post.cover_image.startsWith('http')) {
                console.log(`⬇️  Downloading external image for: ${post.slug}`);
                const localDir = path.join(publicDir, 'images', 'blog', 'external');
                fs.mkdirSync(localDir, { recursive: true });
                const localFile = path.join(localDir, `${post.slug}.jpg`);
                try {
                    await downloadFile(post.cover_image, localFile);
                    const webpPath = await convertToWebp(localFile);
                    if (webpPath) {
                        newCoverImage = `/images/blog/external/${post.slug}.webp`;
                        needsUpdate = true;
                        updatedCovers++;
                        console.log(`  ✅ Cover: ${post.slug}`);
                    }
                } catch (err) {
                    console.error(`  ❌ Download failed for ${post.slug}:`, err.message);
                    failedPosts.push(post.slug);
                }
            } else {
                // Local path - try to find and convert
                // Paths may start with /blog/ or /images/blog/
                let localPath;
                if (post.cover_image.startsWith('/images/')) {
                    localPath = path.join(publicDir, post.cover_image);
                } else if (post.cover_image.startsWith('/blog/')) {
                    localPath = path.join(publicDir, post.cover_image);
                } else {
                    localPath = path.join(publicDir, post.cover_image);
                }

                if (fs.existsSync(localPath)) {
                    const webpPath = await convertToWebp(localPath);
                    if (webpPath) {
                        newCoverImage = post.cover_image.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                        needsUpdate = true;
                        updatedCovers++;
                        console.log(`  ✅ Cover: ${post.slug}`);
                    }
                } else {
                    console.log(`  ⚠️  Cover file not found: ${localPath} (${post.slug})`);
                    failedPosts.push(post.slug);
                }
            }
        }

        // --- INLINE CONTENT IMAGES ---
        if (post.content) {
            const imgRegex = /!\[([^\]]*)\]\(([^)]+\.(jpg|jpeg|png))\)/gi;
            let match;
            let contentChanged = false;

            while ((match = imgRegex.exec(post.content)) !== null) {
                const fullMatch = match[0];
                const alt = match[1];
                const imgPath = match[2];

                if (imgPath.startsWith('http')) continue; // Skip external URLs in content

                let localImgPath;
                if (imgPath.startsWith('/images/')) {
                    localImgPath = path.join(publicDir, imgPath);
                } else {
                    localImgPath = path.join(publicDir, imgPath);
                }

                if (fs.existsSync(localImgPath)) {
                    const webpResult = await convertToWebp(localImgPath);
                    if (webpResult) {
                        const newImgPath = imgPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                        newContent = newContent.replace(fullMatch, `![${alt}](${newImgPath})`);
                        contentChanged = true;
                    }
                }
            }

            if (contentChanged) {
                needsUpdate = true;
                updatedContent++;
            }
        }

        // --- UPDATE DB ---
        if (needsUpdate) {
            const updatePayload = {};
            if (newCoverImage !== post.cover_image) updatePayload.cover_image = newCoverImage;
            if (newContent !== post.content) updatePayload.content = newContent;

            if (Object.keys(updatePayload).length > 0) {
                const { error: updateError } = await supabase
                    .from('posts')
                    .update(updatePayload)
                    .eq('id', post.id);

                if (updateError) {
                    console.error(`  ❌ DB update failed for ${post.slug}:`, updateError.message);
                    failedPosts.push(post.slug);
                }
            }
        }
    }

    console.log(`\n=== PHASE 1 COMPLETE ===`);
    console.log(`Cover images converted: ${updatedCovers}`);
    console.log(`Posts with inline images updated: ${updatedContent}`);
    if (failedPosts.length > 0) {
        console.log(`\nFailed posts (${failedPosts.length}):`);
        failedPosts.forEach(s => console.log(`  - ${s}`));
    }
}

run();
