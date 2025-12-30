import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const content = `There is a special kind of silence that falls over a house during a power cut. At first, it’s almost peaceful—until the temperature starts to drop. Then, the questions start racing through your mind. Is the food in the fridge going to survive? Why has the boiler stopped working? And the big one: Is it actually safe to stay here tonight?

Whether you’re a tenant worried about your rights or a homeowner trying to stop your pipes from bursting, we’ve broken down the panic questions about frozen pipes, food safety, and the rules of the dark.

## The Legal Bit: Can You Stay?
First, let’s look at where you stand legally. In the UK, a home without electricity, heating, or hot water can quickly become classified as "unfit for human habitation."

This isn’t just an opinion; it’s backed by the **Homes (Fitness for Human Habitation) Act 2018**. Under this act, landlords have a legal duty to ensure that a property is safe and healthy to live in. If a lack of power leads to "excess cold" or prevents you from preparing food or maintaining hygiene, the property may fail to meet these standards.

Furthermore, the [Landlord and Tenant Act 1985 (Section 11)](https://www.legislation.gov.uk/ukpga/1985/70/section/11) specifically states that landlords must keep the installations for the supply of water, gas, and electricity in proper working order. While they aren't responsible for a national grid outage (sorry, they can't fix the power lines in the street!), they are responsible if the outage is caused by faulty internal wiring or a broken fuse box.

## The Safety Bit: Should You Stay?
Just because you can stay doesn't mean you should. When the heating goes off, a house changes from a shelter to a hazard surprisingly quickly.

### The Temperature Drop
Health risks increase significantly when indoor temperatures fall below **18°C (64°F)**. For the elderly or young children, this can lead to hypothermia much faster than you might expect.

### The Silent Killer
If you get desperate and try to use a camping stove, outdoor grill, or petrol generator indoors—**don't**. Carbon Monoxide (CO) is colourless, odourless, and deadly. Never burn fuel indoors without proper ventilation.

![Electrical Safety Check](/blog/electrical-safety-check.png)

If you are unsure if your home is habitable, it might be time to call in the pros. Platforms like [Emergency Tradesmen](https://emergencytradesmen.net/) can help you quickly find emergency electricians or gas engineers to assess if an internal fault has made your home dangerous.

## Answering the "Panic Questions"
When the lights go out, the panic sets in. Here are the answers to the three most common freak-outs.

### 1. "My boiler is making a gurgling noise and won't start!"
If it’s freezing outside and your heating won't turn on (even if you have power back), you might have a frozen condensate pipe. This is a white plastic pipe that runs from your boiler to the drain outside. If it freezes, the boiler thinks it’s blocked and shuts down for safety.

![Frozen Boiler Pipe](/blog/boiler-frozen.png)

**The Fix**: You don't always need a plumber for this. Locate the frozen white pipe outside and pour warm (not boiling!) water over it to melt the ice. Then reset your boiler.

### 2. "Will my pipes burst?"
Water expands when it freezes, which can split copper and plastic pipes. This usually happens in unheated areas like lofts or basements.

**The Fix**: If the heating is off, open your loft hatch to let warmer air circulate up there. If you have to leave the house, turn off the water at the main stopcock and open the taps to drain the system. Insulation (lagging) is your best friend here.

### 3. "Is the food in the fridge safe?"
You’re staring at a fridge full of groceries and wondering if you have to bin the lot.

**The Rule**: Keep the door closed! A fridge will keep food safe for about 4 hours without power. A full freezer acts like an igloo and can keep food frozen for up to 48 hours. If the food is still cold to the touch (below 8°C), it’s generally okay to cook and eat immediately, but if in doubt, throw it out—food poisoning is the last thing you need during a power cut.

## Staying Human in the Dark
Finally, remember that staying safe is also about mental well-being. A dark, cold house can be stressful. Build a "fort" in the living room with blankets to share body heat (it’s fun for the kids and practical for warmth), break out the board games, and try to keep a routine. It turns a crisis into a memory.

Stay warm, stay safe, and know your rights.
`;

async function addPost() {
    console.log('🚨 Adding new blog post...');

    const { data, error } = await supabase
        .from('posts')
        .upsert({
            title: "Can You Legally and Safely Stay in a Home Without Electricity? We Answer the Panic Questions",
            slug: 'can-you-legally-stay-in-home-without-electricity',
            content: content,
            excerpt: "A power cut turns your home from a sanctuary to a hazard. We explain your legal rights, safety risks, and answer the panic questions about frozen pipes and food.",
            cover_image: '/blog/no-electricity-cover.png',
            published: true,
            published_at: new Date().toISOString()
        }, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('❌ Error adding post:', error.message);
    } else {
        console.log('✅ Successfully added post:', data[0]?.title);
    }
}

addPost();
