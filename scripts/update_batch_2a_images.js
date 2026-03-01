import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePosts() {
    const updates = [
        {
            slug: 'car-wont-start-flat-battery-alternator-gb',
            images: [
                { url: '/blog/generated/car-battery-frosty.webp', alt: 'Car in Frosty UK Driveway with Jump Starter', caption: 'Cold mornings are the ultimate test for your car battery; being prepared with a jump starter is essential.' },
                { url: '/blog/generated/battery-check.webp', alt: 'Professional Multimeter testing Car Battery', caption: 'A simple voltage check can determine if your issue is a flat battery or a failing alternator.' },
                { url: '/blog/generated/jump-cables.webp', alt: 'Heavy Duty Jump Cables connected to Battery', caption: 'If using cables, ensure they are connected in the correct sequence to protect your vehicle electronics.' }
            ]
        },
        {
            slug: 'emergency-boarding-up-glazing-gb',
            images: [
                { url: '/blog/generated/broken-window-boarding.webp', alt: 'Smashed Shop Window being boarded up at night', caption: 'Immediate boarding is crucial for security and public safety after a break-in or accident.' },
                { url: '/blog/generated/plywood-install.webp', alt: 'Plywood Sheet being installed with high-quality screws', caption: 'Professional boarding uses subframe attachments to prevent damage to your existing window frames.' },
                { url: '/blog/generated/glazing-replacement.webp', alt: 'Professional Glazier installing Large Glass Sheet', caption: 'Our 24/7 glazing service ensures your property is restored to its original state as quickly as possible.' }
            ]
        }
    ];

    for (const update of updates) {
        console.log(`Processing ${update.slug}...`);
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('content')
            .eq('slug', update.slug)
            .single();

        if (fetchError || !post) {
            console.error(`Error fetching ${update.slug}:`, fetchError);
            continue;
        }

        let newContent = post.content;
        const sections = newContent.split('\n## ');

        if (sections.length >= 3) {
            sections[0] += `\n\n![${update.images[0].alt}](${update.images[0].url})\n*${update.images[0].caption}*`;
            sections[1] = `${sections[1]}\n\n![${update.images[1].alt}](${update.images[1].url})\n*${update.images[1].caption}*`;
            // Add third image towards the end or in the 3rd section
            if (sections.length > 2) {
                sections[2] = `${sections[2]}\n\n![${update.images[2].alt}](${update.images[2].url})\n*${update.images[2].caption}*`;
            }
            newContent = sections.join('\n## ');
        } else {
            update.images.forEach(img => {
                newContent += `\n\n![${img.alt}](${img.url})\n*${img.caption}*`;
            });
        }

        const { error: updateError } = await supabase
            .from('posts')
            .update({ content: newContent })
            .eq('slug', update.slug);

        if (updateError) {
            console.error(`Error updating ${update.slug}:`, updateError);
        } else {
            console.log(`Successfully updated ${update.slug}`);
        }
    }
}

updatePosts();
