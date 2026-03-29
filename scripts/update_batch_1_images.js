import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePosts() {
    const updates = [
        {
            slug: 'emergency-at-home-guide',
            image: '/images/blog/generated/emergency-home-kit.webp',
            alt: 'Professional Home Emergency Kit with Emergency Tradesmen Branding',
            caption: 'Preparation is key: A well-stocked home emergency kit can save precious time during a crisis.'
        },
        {
            slug: 'what-to-do-in-home-emergency-before-help-arrives',
            images: [
                { url: '/images/blog/generated/water-shut-off.webp', alt: 'Main Water Shut-Off Valve with Emergency Tag', caption: 'Knowing exactly where your stopcock is located is the first step in stopping a flood.' },
                { url: '/images/blog/generated/fuse-box.webp', alt: 'Modern Electrical Fuse Box with Main Breaker Highlighted', caption: 'Always isolate the power at the main breaker if you suspect an electrical fault or see water near outlets.' },
                { url: '/images/blog/generated/gas-isolation.webp', alt: 'Gas Meter with Isolation Valve Hand Access', caption: 'In a gas emergency, immediate isolation is critical before exiting the property.' }
            ]
        },
        {
            slug: 'frozen-condensate-pipe-fix',
            images: [
                { url: '/images/blog/generated/frozen-pipe.webp', alt: 'Frozen White PVC Condensate Pipe with Ice Buildup', caption: 'A frozen condensate pipe often manifests during sudden cold snaps, causing your boiler to shut down.' },
                { url: '/images/blog/generated/pouring-warm-water.webp', alt: 'Pouring Warm Water from a Kettle onto a Lagged Pipe', caption: 'Using warm (not boiling) water is the safest way to slowly thaw the blockage.' },
                { url: '/images/blog/generated/boiler-safety-diagram.webp', alt: '3D Diagram of Boiler Condensate Pipe Flow', caption: 'Understanding how your system drains can help you prevent future freeze-ups with proper lagging.' }
            ]
        },
        {
            slug: 'sewage-smell-in-house-p-trap-us',
            images: [
                { url: '/images/blog/generated/bathroom-drain.webp', alt: 'Modern Bathroom Sink Drain Close-up', caption: 'That persistent "sewer" smell often starts right here at the source.' },
                { url: '/images/blog/generated/p-trap-diagram.webp', alt: '3D Cutaway Diagram of a P-Trap Water Seal', caption: 'A dry P-trap is the most common cause of sewer gas entering your home.' },
                { url: '/images/blog/generated/plumber-inspecting-drain.webp', alt: 'Professional Plumber Inspecting Luxury Floor Drain', caption: 'Our technicians use specialized equipment to verify trap integrity and venting.' }
            ]
        },
        {
            slug: 'ac-blowing-warm-air-capacitor-leak-us',
            image: '/images/blog/generated/ac-capacitor.webp',
            alt: 'Bulging AC Capacitor Next to Professional Multimeter Probes',
            caption: 'A bulging top on your AC capacitor is a definitive sign of failure requiring professional replacement.'
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

        if (update.slug === 'emergency-at-home-guide' || update.slug === 'ac-blowing-warm-air-capacitor-leak-us') {
            newContent += `\n\n![${update.alt}](${update.image})\n*${update.caption}*`;
        } else {
            // Distribute images for those needing 3
            const sections = newContent.split('\n## ');
            if (sections.length >= 3) {
                sections[0] += `\n\n![${update.images[0].alt}](${update.images[0].url})\n*${update.images[0].caption}*`;
                sections[1] = `${sections[1]}\n\n![${update.images[1].alt}](${update.images[1].url})\n*${update.images[1].caption}*`;
                sections[2] = `${sections[2]}\n\n![${update.images[2].alt}](${update.images[2].url})\n*${update.images[2].caption}*`;
                newContent = sections.join('\n## ');
            } else {
                update.images.forEach(img => {
                    newContent += `\n\n![${img.alt}](${img.url})\n*${img.caption}*`;
                });
            }
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
