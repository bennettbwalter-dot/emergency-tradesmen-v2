const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const updates = [
    {
        id: '62463d4e-26cc-4f3e-861d-225d2d1edd09', // US
        slug: 'ac-heatwave-preparation-signs-repair-us-2026',
        images: {
            thermostat: '/blog/ac-heatwave-preparation-signs-repair-us-2026/thermostat-85f.jpg',
            filter: '/blog/ac-heatwave-preparation-signs-repair-us-2026/dirty-filter.jpg',
            infographic: '/blog/ac-heatwave-preparation-signs-repair-us-2026/short-cycling-infographic.png'
        }
    },
    {
        id: '9d31fb1c-8e5d-4c07-b139-c53bf87b7e79', // UK
        slug: 'ac-heatwave-preparation-signs-repair-uk-2026',
        images: {
            thermostat: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/thermostat-85f.jpg',
            filter: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/dirty-filter.jpg',
            infographic: '/blog/ac-heatwave-preparation-signs-repair-uk-2026/short-cycling-infographic.png'
        }
    }
];

async function updatePosts() {
    for (const update of updates) {
        console.log(`Updating post ${update.id} (${update.slug})...`);
        
        const { data, error: fetchError } = await supabase
            .from('posts')
            .select('content')
            .eq('id', update.id)
            .single();
            
        if (fetchError) {
            console.error(`Error fetching post ${update.id}:`, fetchError);
            continue;
        }
        
        let content = data.content;
        
        // Image 1: After Intro paragraph
        if (!content.includes('thermostat-85f.jpg')) {
            content = content.replace(
                'unless you know the warning signs early.\n\nIn this guide',
                `unless you know the warning signs early.\n\n![Indoor temperatures hitting dangerous levels during the early March heatwave](${update.images.thermostat})\n\nIn this guide`
            );
        }
        
        // Image 2: Under 3. Weak Airflow
        if (!content.includes('dirty-filter.jpg')) {
            content = content.replace(
                '### 3. Weak Airflow: Is Your System Choking?\nWeak airflow',
                `### 3. Weak Airflow: Is Your System Choking?\n![A heavily clogged AC filter is the #1 cause of airflow failure and system strain](${update.images.filter})\n\nWeak airflow`
            );
        }
        
        // Image 3: Under 4. Short-Cycling
        if (!content.includes('short-cycling-infographic.png')) {
            content = content.replace(
                'Every 5-10 minutes? This is known as short-cycling.',
                `Every 5-10 minutes? This is known as short-cycling.\n\n![Short-cycling infographic: Why the 5-10 minute cycle causes system damage](${update.images.infographic})`
            );
        }
        
        const { error: updateError } = await supabase
            .from('posts')
            .update({ content })
            .eq('id', update.id);
            
        if (updateError) {
            console.error(`Error updating post ${update.id}:`, updateError);
        } else {
            console.log(`Successfully updated post ${update.id}`);
        }
    }
}

updatePosts();
