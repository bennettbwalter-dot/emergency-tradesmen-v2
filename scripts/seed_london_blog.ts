
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const londonPost = {
    title: 'Emergency Plumber London: 5 Safety Checks Before You Call',
    slug: 'emergency-plumber-london-guide',
    excerpt: 'Living in London? Don’t get ripped off during a plumbing emergency. Here is our essential safety checklist for hiring a plumber in the capital.',
    cover_image: 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop', // Big City Plumbing Vibe
    content: `Living in **London** comes with its own unique set of plumbing challenges. From Victorian pipework in **Kensington** to modern high-pressure systems in **Canary Wharf**, the capital's infrastructure is a mix of the old and the new.

When you're standing ankle-deep in water at 2 AM, it's easy to panic. But rushing can lead to hiring rogue traders. As London's leading [emergency tradesmen network](https://emergencytradesmen.net), we've seen it all.

Here are the 5 things you must check before letting a plumber into your London home.

### 1. Check for "London-Specific" Call-Out Charges

In the capital, you expect to pay more. That's a fact of life. But you shouldn't be paying hidden "Congestion Charge" fees or "Parking" fees unless they were agreed upon upfront.

*   **Zone 1-2 Premium**: Expect a slightly higher rate if you are in Central London due to travel difficulty.
*   **The Trap**: Some plumbers add £50+ just for crossing the river.
*   **The Fix**: Ask for a **fixed total price** including travel before they set off.

> **Need a quote?** Check our [London Emergency Plumber Rates](https://emergencytradesmen.net/emergency-plumber/london) for a transparent breakdown.

### 2. Verify Their "Gas Safe" ID (Even for Water Leaks)

In many London flats, boilers and pipes are cramped together in tight cupboards. A plumber fixing a leak might accidentally knock a gas pipe.

*   Always ask to see their **Gas Safe ID card** if they are going anywhere near your boiler.
*   Check the back of the card to see if they are qualified for *Pipework*.

### 3. Ask About Their "Local Area" Knowledge

London traffic is brutal. A plumber coming from **Croydon** to fix a leak in **Camden** during rush hour will take 2 hours. You need someone local.

When you call, ask: *"Where are you travelling from right now?"*

At Emergency Tradesmen, we automatically route your call to engineers in your specific borough:
*   [Plumbers in North London](https://emergencytradesmen.net/emergency-plumber/london)
*   [Plumbers in South London](https://emergencytradesmen.net/emergency-plumber/london)
*   [Plumbers in East London](https://emergencytradesmen.net/emergency-plumber/london)
*   [Plumbers in West London](https://emergencytradesmen.net/emergency-plumber/london)

### 4. The "Victorian Plumbing" Factor

If you live in a period property (common in **Islington**, **Notting Hill**, or **Fulham**), you likely have lead pipes or non-standard fittings.
*   **The Risk**: A modern "fast-fix" plumber might not have the imperial-sized fittings needed for 19th-century pipes.
*   **The Tip**: Tell the plumber your building's age *before* they arrive.

### 5. Get a Receipt with a Physical London Address

Rogue traders often use PO Boxes. If the repair fails next week, you need to know where to find them.
Ensure their invoice includes a registered UK office address.

### Conclusion: Don't risk it.

London is full of great skilled tradespeople, but it attracts opportunists too. By following these 5 checks, you ensure your home is safe.

**Need help now?**
We have verified emergency plumbers across all 32 London Boroughs available 24/7.
👉 **[Find an Emergency Plumber in London Now](https://emergencytradesmen.net/emergency-plumber/london)**
`,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString()
};

async function seedPost() {
    console.log('Seeding London Blog Post...');

    // Check if exists
    const { data: existing } = await supabase
        .from('posts')
        .select('id')
        .eq('slug', londonPost.slug)
        .single();

    if (existing) {
        console.log('Post already exists, updating...');
        const { error } = await supabase
            .from('posts')
            .update(londonPost)
            .eq('id', existing.id);

        if (error) console.error('Error updating:', error);
        else console.log('Success: Post updated.');
    } else {
        console.log('Creating new post...');
        const { error } = await supabase
            .from('posts')
            .insert([londonPost]);

        if (error) console.error('Error inserting:', error);
        else console.log('Success: Post created.');
    }
}

seedPost();
