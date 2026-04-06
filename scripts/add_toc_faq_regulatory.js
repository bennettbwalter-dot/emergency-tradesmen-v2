import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

function extractHeadings(content) {
    const h2Matches = content.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = content.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    return {
        h2: h2Matches.map(m => m.replace(/<[^>]+>/g, '').trim()),
        h3: h3Matches.map(m => m.replace(/<[^>]+>/g, '').trim())
    };
}

function generateTOC(headings) {
    if (!headings.h2 || headings.h2.length === 0) return '';
    
    const items = headings.h2.map((h, i) => {
        const anchor = h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<li><a href="#${anchor}">${h}</a></li>`;
    }).join('\n');
    
    return `<div class="toc-box" id="in-this-article">
<p>In This Article</p>
<ul>${items}</ul>
</div>`;
}

function addAnchorsToHeadings(content) {
    let result = content;
    
    result = result.replace(/<h2>/g, (match) => {
        return match;
    });
    
    const h2Regex = /<h2>([^<]+)<\/h2>/gi;
    result = result.replace(h2Regex, (match, title) => {
        const anchor = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return `<h2 id="${anchor}">${title}</h2>`;
    });
    
    return result;
}

function generateFAQ(headings, content) {
    const faqQuestions = [];
    const text = content.toLowerCase();
    
    if (text.includes('warning') || text.includes('danger') || text.includes('safety')) {
        faqQuestions.push({
            q: 'What should I do in case of an emergency?',
            a: 'The most important first step is to ensure safety - isolate the affected area and avoid DIY repairs on regulated systems. Contact a certified professional immediately.'
        });
    }
    
    if (text.includes('regulation') || text.includes('standard') || text.includes('code')) {
        faqQuestions.push({
            q: 'What regulations apply to this work?',
            a: 'All work should comply with relevant UK/US standards. Always ensure your contractor is fully certified and ask to see their credentials.'
        });
    }
    
    if (text.includes('diy') || text.includes('professional')) {
        faqQuestions.push({
            q: 'Is it safe to attempt DIY fixes?',
            a: 'For most regulated systems (gas, electrics, structural), DIY work is illegal without proper certification and can invalidate your home insurance. Always use a licensed professional.'
        });
    }
    
    if (text.includes('cost') || text.includes('price') || text.includes('expensive')) {
        faqQuestions.push({
            q: 'How much does this service cost?',
            a: 'Costs vary based on the severity of the issue and your location. Contact us for a no-obligation quote from verified local professionals.'
        });
    }
    
    if (text.includes('insurance') || text.includes('claim')) {
        faqQuestions.push({
            q: 'Will insurance cover this work?',
            a: 'Most comprehensive home insurance policies cover emergency repairs. Always document the damage and work with certified professionals for compliant documentation.'
        });
    }
    
    if (text.includes('certif') || text.includes('registered')) {
        faqQuestions.push({
            q: 'How do I verify a contractor\'s credentials?',
            a: 'Ask to see their registration with relevant bodies (NICEIC, NAPIT, Gas Safe, etc.). All our verified contractors are fully certified.'
        });
    }
    
    if (faqQuestions.length === 0) {
        faqQuestions.push({
            q: 'What should I do in an emergency?',
            a: 'Ensure your safety first by isolating the affected area. Contact a certified professional immediately for safe, compliant repairs.'
        });
        faqQuestions.push({
            q: 'How do I choose a reliable contractor?',
            a: 'Always verify credentials, check reviews, and ensure they are registered with relevant regulatory bodies.'
        });
    }
    
    const isUK = content.includes('en-GB') || content.includes('UK');
    const faqHtml = `\n<h2>Frequently Asked Questions</h2>\n` + 
        faqQuestions.slice(0, 6).map((faq, i) => 
            `<h3>${faq.q}</h3>\n<p>${faq.a}</p>`
        ).join('\n');
    
    return faqHtml;
}

function addRegulatoryBacklinks(content) {
    const isUK = content.includes('en-GB') || content.includes('UK');
    const isUS = content.includes('en-US') || content.includes('US');
    
    let backlinks = '';
    
    if (isUK) {
        backlinks = `\n<div class="regulatory-citation">
<span class="citation-title">REGULATORY AUTHORITIES & TECHNICAL STANDARDS</span>
<div class="citation-grid">
<a href="https://www.niceic.com/" target="blank">NICEIC: Electrical Standards</a>
<a href="https://www.gassaferegister.co.uk/" target="blank">Gas Safe Register</a>
<a href="https://www.electricalsafetyfirst.org.uk/" target="blank">Electrical Safety First</a>
<a href="https://www.gov.uk/government/organisations/health-and-safety-executive" target="blank">HSE: Health & Safety</a>
<a href="https://www.theiet.org/" target="blank">IET Wiring Regulations</a>
</div>
</div>`;
    } else if (isUS) {
        backlinks = `\n<div class="regulatory-citation">
<span class="citation-title">REGULATORY AUTHORITIES & TECHNICAL STANDARDS</span>
<div class="citation-grid">
<a href="https://www.osha.gov/" target="blank">OSHA: Occupational Safety</a>
<a href="https://www.epa.gov/" target="blank">EPA: Environmental Protection</a>
<a href="https://www.nfpa.org/" target="blank">NFPA: Fire Safety</a>
<a href="https://www.ichrc.org/" target="blank">IICRC: Restoration Standards</a>
</div>
</div>`;
    }
    
    return content + backlinks;
}

async function processAllBlogs() {
    console.log('Fetching posts...');
    const { data: posts, error } = await supabase
        .from('posts')
        .select('id, title, slug, content')
        .eq('published', true);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${posts.length} posts`);
    
    let updated = 0;

    for (const post of posts) {
        try {
            let content = post.content;
            
            const headings = extractHeadings(content);
            
            content = addAnchorsToHeadings(content);
            
            const newHeadings = extractHeadings(content);
            const toc = generateTOC(newHeadings);
            
            const hasTOC = content.includes('id="in-this-article"');
            if (!hasTOC && newHeadings.h2.length > 0) {
                const introEndMatch = content.match(/<\/p>\s*<h2/);
                if (introEndMatch) {
                    content = content.replace(/<\/p>\s*<h2/, `</p>${toc}<h2`);
                } else if (content.includes('<main>')) {
                    content = content.replace(/<main>/, `<main>${toc}`);
                }
            }
            
            const hasFAQ = content.includes('Frequently Asked Questions');
            if (!hasFAQ) {
                const faq = generateFAQ(headings, content);
                const ctaMatch = content.match(/<div class="sticky-cta-container">/);
                if (ctaMatch) {
                    content = content.replace(/<div class="sticky-cta-container">/, `${faq}\n<div class="sticky-cta-container">`);
                } else {
                    content = content + faq;
                }
            }
            
            const hasRegulatory = content.includes('regulatory-citation');
            if (!hasRegulatory) {
                content = addRegulatoryBacklinks(content);
            }
            
            await supabase
                .from('posts')
                .update({ content })
                .eq('id', post.id);
            
            updated++;
            console.log(`Updated: ${post.slug}`);
        } catch (err) {
            console.error(`Error ${post.slug}:`, err.message);
        }
    }

    console.log(`\nDone! Updated ${updated} blogs`);
}

processAllBlogs();
