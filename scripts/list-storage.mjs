import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listCarouselImages() {
    console.log("Listing files in business-assets bucket...");
    const { data, error } = await supabase.storage
        .from('business-assets')
        .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    console.log(`Found ${data.length} files:`);
    data.forEach((file, idx) => {
        console.log(`${idx + 1}. ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });
    
    // Look for carousel-specific images
    const carouselFiles = data.filter(f => f.name.includes('carousel') || f.name.includes('slider'));
    if (carouselFiles.length > 0) {
        console.log(`\nFound ${carouselFiles.length} carousel/slider images:`);
        carouselFiles.forEach(f => console.log(`  - ${f.name}`));
    }
}

listCarouselImages();