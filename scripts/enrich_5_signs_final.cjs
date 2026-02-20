
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function enrich5Signs() {
    console.log('--- Starting Enrichment & Cleanup (5 Signs Plumbing) ---');

    // 1. DEDUPLICATION
    const slugsToDelete = [
        '5-signs-you-need-emergency-plumber-gb',
        '5-signs-you-need-emergency-plumber-us',
        '5-signs-you-need-emergency-plumber'
    ];
    console.log('Deleting duplicate slugs:', slugsToDelete);
    await supabase.from('posts').delete().in('slug', slugsToDelete);

    // 2. FETCH UK CONTENT (Best version is 5-signs-emergency-plumber-needed-gb)
    const { data: gbPost } = await supabase.from('posts').select('*').eq('slug', '5-signs-emergency-plumber-needed-gb').single();
    if (gbPost) {
        let content = gbPost.content;

        // Add Authority Links
        content = content.replace('Internal "Heat Exchanger."', 'Internal [Heat Exchanger](https://www.gassaferegister.co.uk/).');
        content = content.replace('reveals a shiny, silver-coloured metal, it is lead.', 'reveals a shiny, silver-coloured metal, it is lead. See the [HSE guide on lead in water](https://www.hse.gov.uk/water/lead.htm) for health impacts.');
        content = content.replace('Water Company owns the pipe in the street.', 'Water Company owns the pipe in the street. [Thames Water](https://www.thameswater.co.uk/help/water-quality/lead-pipes) and other boards offer replacement schemes.');

        // Add Internal Links
        content = content.replace('fixed using the filling loop', 'fixed using the [filling loop](/blog/boiler-pressure-dropping-filling-loop-gb)');
        content = content.replace('Living room ceiling below the bathroom', 'Living room ceiling below the bathroom (See our [Ceiling Leak Guide](/blog/water-leaking-through-the-ceiling-first-steps-gb))');
        content = content.replace('showing an \'EA\' or \'F1\' error code?', 'showing an \'EA\' or \'F1\' error code? This often indicates a [frozen condensate pipe](/blog/frozen-condensate-pipe-fix-gb).');

        await supabase.from('posts').update({ content }).eq('slug', '5-signs-emergency-plumber-needed-gb');
        console.log('Updated GB Post with links.');
    }

    // 3. FETCH US CONTENT (Best version is 5-signs-emergency-plumber-needed-us)
    const { data: usPost } = await supabase.from('posts').select('*').eq('slug', '5-signs-emergency-plumber-needed-us').single();
    if (usPost) {
        let content = usPost.content;

        // Add Authority Links
        content = content.replace('Contains feces and bacteria.', 'Contains feces and bacteria. The [CDC](https://www.cdc.gov/healthywater/emergency/drinking/cleaning-up-after-a-flood.html) warns that this category of water is highly bio-hazardous.');
        content = content.replace('PEX', '[PEX](https://www.epa.gov/ground-water-and-drinking-water/basic-information-about-lead-drinking-water)');
        content = content.replace('Natural gas is odorless.', 'Natural gas is odorless. According to the [NFPA](https://www.nfpa.org/Public-Education/Fire-causes-and-risks/Gas-hazards), immediate evacuation is the only safe protocol.');

        // Add Internal Links
        content = content.replace('Dumping gallons of water and insulation', 'Dumping gallons of water and insulation (Follow our [Ceiling Leak Crisis Protocol](/blog/water-leaking-from-ceiling-first-steps-us))');
        content = content.replace('Stopcock', '[Shut-off Valve](/blog/home-emergency-shut-off-protocol-us)');

        await supabase.from('posts').update({ content }).eq('slug', '5-signs-emergency-plumber-needed-us');
        console.log('Updated US Post with links.');
    }

    console.log('--- Enrichment & Cleanup Complete ---');
}

enrich5Signs();
