
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndDelete() {
    const titles = [
        "Beyond the Deadbolt: 7 Structural Door Upgrades Burglars Hope You Ignore",
        "Securing the \"First Line\": How to Burglar-Proof Your Front Door in 2026"
    ];

    console.log('Searching for posts...');
    const { data: posts, error: findError } = await supabase
        .from('posts')
        .select('id, title, slug')
        .or(`title.eq."${titles[0]}",title.eq."${titles[1]}"`);

    if (findError) {
        console.error('Error finding posts:', findError);
        return;
    }

    if (!posts || posts.length === 0) {
        console.log('No matching posts found by exact title. Searching by partial title...');
        const { data: partialPosts, error: partialError } = await supabase
            .from('posts')
            .select('id, title, slug')
            .or('title.ilike.%Beyond the Deadbolt%,title.ilike.%Securing the%');

        if (partialError) {
            console.error('Error finding partial posts:', partialError);
            return;
        }
        console.log('Found posts:', partialPosts);

        if (partialPosts && partialPosts.length > 0) {
            const ids = partialPosts.map(p => p.id);
            console.log(`Deleting posts with IDs: ${ids.join(', ')}`);
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .in('id', ids);

            if (deleteError) console.error('Error deleting posts:', deleteError);
            else console.log('Successfully deleted posts.');
        }
    } else {
        console.log('Found posts:', posts);
        const ids = posts.map(p => p.id);
        console.log(`Deleting posts with IDs: ${ids.join(', ')}`);
        const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .in('id', ids);

        if (deleteError) console.error('Error deleting posts:', deleteError);
        else console.log('Successfully deleted posts.');
    }
}

findAndDelete();
