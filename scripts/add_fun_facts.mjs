import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

const funFacts = {
    general: [
        "Did you know? Most home emergencies can be prevented with annual maintenance checks.",
        "Pro tip: Always keep emergency contact numbers saved for quick access."
    ],
    electrical: [
        "Did you know? Electricity is the #1 cause of house fires in the UK and US.",
        "Fact: RCD protection can detect faults in just 30 milliseconds."
    ],
    plumbing: [
        "Did you know? A leaking tap can waste up to 3,000 gallons of water per year.",
        "Fact: Frozen pipes can expand with enough force to burst entire walls."
    ],
    gas: [
        "Did you know? Carbon monoxide is called the 'silent killer' because it's odorless and colorless.",
        "Fact: Faulty gas appliances cause over 1,000 incidents per year in the UK alone."
    ],
    security: [
        "Did you know? Most burglars enter through the front door, not windows.",
        "Fact: A certified lock can delay a burglar by up to 15 minutes."
    ],
    water: [
        "Did you know? Water damage is the #2 most common insurance claim in the US.",
        "Fact: Mold can start growing within 24-48 hours after water damage."
    ],
    heating: [
        "Did you know? Heat pumps are now required in all new UK homes under 2025 regulations.",
        "Fact: A properly maintained boiler can last 15+ years."
    ],
    pest: [
        "Did you know? Rodents can squeeze through gaps as small as a pencil.",
        "Fact: A single rat can produce 25,000 droppings per year."
    ],
    roof: [
        "Did you know? A small roof leak can cause £10,000+ in structural damage if ignored.",
        "Fact: Flat roofs have a 30-year average lifespan with proper maintenance."
    ],
    drainage: [
        "Did you know? Fatbergs the size of a bus have been found in UK sewers.",
        "Fact: Pouring grease down the drain is one of the worst things you can do."
    ]
};

function getRelevantFunFacts(content) {
    const text = content.toLowerCase();
    let category = 'general';
    
    if (text.includes('electric') || text.includes('ev charger') || text.includes('power') || text.includes('voltage')) {
        category = 'electrical';
    } else if (text.includes('gas') || text.includes('boiler') || text.includes('heat pump')) {
        category = 'gas';
    } else if (text.includes('plumb') || text.includes('pipe') || text.includes('leak') || text.includes('water') || text.includes('drain') || text.includes('sewer')) {
        category = 'plumbing';
    } else if (text.includes('security') || text.includes('lock') || text.includes('door') || text.includes('alarm')) {
        category = 'security';
    } else if (text.includes('mould') || text.includes('flood') || text.includes('water damage')) {
        category = 'water';
    } else if (text.includes('heating') || text.includes('hvac') || text.includes('air con')) {
        category = 'heating';
    } else if (text.includes('pest') || text.includes('rodent') || text.includes('infestation')) {
        category = 'pest';
    } else if (text.includes('roof') || text.includes('gutter')) {
        category = 'roof';
    }
    
    const facts = funFacts[category] || funFacts.general;
    return facts.slice(0, 2);
}

function addFunFacts(content) {
    const facts = getRelevantFunFacts(content);
    
    const funFactBox = `<div class="fun-fact-box">
<p><strong>💡 Did you know?</strong> ${facts[0]}</p>
</div>
<div class="fun-fact-box">
<p><strong>💡 Pro Tip:</strong> ${facts[1]}</p>
</div>`;
    
    const insertAfterToc = content.replace(
        /(<div class="toc-box"[^>]*>[\s\S]*?<\/div>)/,
        '$1' + funFactBox
    );
    
    return insertAfterToc;
}

async function addFunFactsToAll() {
    const { data: posts } = await supabase
        .from('posts')
        .select('id, slug, content')
        .eq('published', true);

    let fixed = 0;
    
    for (const p of posts) {
        if (!p.content.includes('fun-fact-box')) {
            const newContent = addFunFacts(p.content);
            await supabase.from('posts').update({ content: newContent }).eq('id', p.id);
            console.log('Added fun facts:', p.slug);
            fixed++;
        }
    }
    
    console.log('\nDone! Added fun facts to', fixed, 'blogs');
}

addFunFactsToAll();
