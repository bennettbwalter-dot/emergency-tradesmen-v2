const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const ukPostSlug = 'ac-heatwave-preparation-signs-repair-uk-2026';
const ukImages = {
    thermostat: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/thermostat-85f.jpg',
    filter: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/dirty-filter.jpg',
    infographic: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/short-cycling-infographic.png'
};

async function fixUKPost() {
    console.log(`Fixing UK post: ${ukPostSlug}...`);
    
    const { data, error: fetchError } = await supabase
        .from('posts')
        .select('id, content')
        .eq('slug', ukPostSlug)
        .single();
        
    if (fetchError) {
        console.error(`Error fetching UK post:`, fetchError);
        return;
    }
    
    let content = data.content;
    
    // Image 1: After Intro paragraph (flex matching)
    if (!content.includes('thermostat-85f.jpg')) {
        const introRegex = /unless you know the warning signs early\.[\r\n\s]+In this guide/i;
        if (introRegex.test(content)) {
            content = content.replace(
                introRegex,
                `unless you know the warning signs early.\n\n![Indoor temperatures hitting dangerous levels during the early March heatwave](${ukImages.thermostat})\n\nIn this guide`
            );
            console.log("Injected Thermostat image.");
        } else {
            console.log("Could not find intro injection point (exact). Trying broad match...");
            content = content.replace(
                /unless you know the warning signs early\./i,
                `unless you know the warning signs early.\n\n![Indoor temperatures hitting dangerous levels during the early March heatwave](${ukImages.thermostat})`
            );
        }
    }
    
    // Image 2: Under 3. Weak Airflow
    if (!content.includes('dirty-filter.jpg')) {
        const airflowRegex = /### 3\. Weak Airflow: Is Your System Choking\?[\r\n\s]+/i;
        if (airflowRegex.test(content)) {
            content = content.replace(
                airflowRegex,
                `### 3. Weak Airflow: Is Your System Choking?\n![A heavily clogged AC filter is the #1 cause of airflow failure and system strain](${ukImages.filter})\n\n`
            );
            console.log("Injected Filter image.");
        }
    }
    
    // Image 3: Under 4. Short-Cycling
    if (!content.includes('short-cycling-infographic.png')) {
        const shortCycleRegex = /Every 5-10 minutes\? This is known as short-cycling\./i;
        if (shortCycleRegex.test(content)) {
            content = content.replace(
                shortCycleRegex,
                `Every 5-10 minutes? This is known as short-cycling.\n\n![Short-cycling infographic: Why the 5-10 minute cycle causes system damage](${ukImages.infographic})`
            );
            console.log("Injected Infographic image.");
        }
    }
    
    const { error: updateError } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', data.id);
        
    if (updateError) {
        console.error(`Error updating UK post:`, updateError);
    } else {
        console.log(`Successfully updated UK post!`);
    }
}

fixUKPost();
