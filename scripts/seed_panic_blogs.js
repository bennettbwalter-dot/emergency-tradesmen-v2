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

const panicPosts = [
    {
        title: 'What To Do If Your Electrics Suddenly Go Off',
        slug: 'what-to-do-if-electrics-go-off',
        excerpt: 'Complete power loss? Don\'t panic. Follow this 3-step safety check before calling an emergency electrician. Includes National Grid advice.',
        cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop',
        content: `Sudden darkness can be scary, but it’s often a simple fix. Before you panic, follow this safety checklist.

### 1. Check Your Fuse Box (Consumer Unit)
Go to your fuse box (usually under the stairs or in the hall).
*   **Trip Switch Down?**: If one switch is down, try flicking it back up. If it trips again immediately, you have a faulty appliance or wiring circuit.
*   **Main Switch Off?**: This suggests a major system fault. **Do not force it.**

### 2. Is It Just You?
Look out the window. Are the streetlights on? Do the neighbours have power?
*   **Yes, just me**: The issue is in your home. You likely need an [Emergency Electrician](/emergency-electrician).
*   **No, everyone is out**: This is a power cut. Call **105** (National Grid) for free to report it.

### 3. Safety First
*   Turn off sensitive electronics (TVs, computers) to stop surge damage when power returns.
*   Keep the fridge door closed. Food stays cold for up to 4 hours.

> **Regulatory Note**: Never attempt DIY on your fuse box. Electricity kills. Always use a registered electrician.
> *   [Electrical Safety First: Guidance on Power Cuts](https://www.electricalsafetyfirst.org.uk/guidance/safety-around-the-home/power-cuts/)
> *   [NICEIC: Why use a certified contractor?](https://www.niceic.com/find-a-contractor/why-choose-niceic)

---
**Need an electrician now?** [Find a local verified sparky](/emergency-electrician/london).`
    },
    {
        title: 'Blocked Drain vs Flooded Sewer – How To Tell',
        slug: 'blocked-drain-vs-flooded-sewer',
        excerpt: 'One is a nuisance, the other is a public health hazard. Learn how to tell the difference and who is responsible for fixing it.',
        cover_image: 'https://images.unsplash.com/photo-1610553119213-9b231da90fb7?q=80&w=1200&auto=format&fit=crop',
        content: `Water backing up is stressful. But is it a simple clog or a collapsed sewer line? Here is how to tell.

### Signs of a Blocked Drain (Your Responsibility)
*   Only **one** appliance is slow (e.g., just the kitchen sink).
*   The water drains, but slowly.
*   Smell is localized to one room.

**Solution**: Try a plunger or drain snake. If that fails, call a [Drain Specialist](/emergency-drain-specialist).

### Signs of a Sewer Backup (Serious Issue)
*   **Multiple drains** back up at once (e.g., flush the toilet, and water comes up the shower drain).
*   **Gurgling sounds** from pipes when not in use.
*   **Raw sewage** smell throughout the house or garden.

**Responsibility**:
*   **Within property boundary**: Usually the homeowner.
*   **Outside boundary (Public Sewer)**: Your local water company.

> **Regulatory Advice**: If sewage is entering your home, this is a health hazard. Avoid contact.
> *   [Water UK: Who is responsible for pipes?](https://www.water.org.uk/advice-for-customers/find-your-supplier/sewerage-pipes-responsibility)
> *   [Citizen's Advice: Sewerage and Drains](https://www.citizensadvice.org.uk/consumer/water/water-supply/sewerage/who-is-responsible-for-repairing-drains-and-sewers/)

---
**Drains overflowing?** [Book an emergency drain clearance](/emergency-drain-specialist/london).`
    },
    {
        title: 'Is It Safe To Stay In A House With No Power?',
        slug: 'safe-to-stay-in-house-no-power',
        excerpt: 'Can you legally and safely stay in a home without electricity? We answer the panic questions about frozen pipes, food safety, and heating.',
        cover_image: 'https://images.unsplash.com/photo-1517260739337-6799d2cc9fe4?q=80&w=1200&auto=format&fit=crop',
        content: `If the power goes out, do you need to book a hotel? It depends on the duration and the temperature.

### When It Is SAFE
*   **Short Duration**: Less than 12 hours.
*   **Warm Weather**: No risk of hypothermia.
*   **Adults Only**: Healthy adults can manage with blankets and torches.

### When It Is UNSAFE
*   **Freezing Temperatures**: Without heating, pipes can freeze and burst.
*   **Medical Needs**: If anyone relies on powered medical equipment (CPAP, nebulizers).
*   **No Running Water**: If your water pump is electric.

### Panic Checklist
1.  **Light**: Use battery torches, NOT candles (fire risk).
2.  **Heat**: Do not use outdoor gas heaters indoors (Carbon Monoxide risk).
3.  **Food**: Throw away meat/dairy if fridge is off >4 hours.

> **Official Helper**: If you are vulnerable (elderly, young kids, medical needs), join the **Priority Services Register**.
> *   [Ofgem: Priority Services Register](https://www.ofgem.gov.uk/information-consumers/energy-advice-households/getting-extra-help-priority-services-register)
> *   [NHS: Keeping warm in winter](https://www.nhs.uk/live-well/seasonal-health/keep-warm-keep-well/)

---
**Power cut caused by your fuse box?** [Get an Emergency Electrician](/emergency-electrician/manchester) to fix it 24/7.`
    },
    {
        title: 'Water Leaking Through The Ceiling – What To DO FIRST',
        slug: 'water-leaking-through-ceiling-first-steps',
        excerpt: 'Your 60-Second Survival Guide to Stopping the Damage. Learn the "Golden Minute" action plan to save your ceiling and stay safe.',
        cover_image: '/blog/water-leak/cover.jpg',
        content: `![Water pouring from kitchen ceiling into buckets](/blog/water-leak/kitchen-ceiling-leak.jpg)
Water dripping (or pouring) from the ceiling is a classic panic moment. **Stop.** Follow these steps immediately.

### 1. Stop The Water (60 Seconds)
![Water dripping from living room light fixture](/blog/water-leak/living-room-electrical-leak.jpg)
*   **Turn off the Stopcock**: Usually under the kitchen sink. Twist it clockwise to shut off the entire house supply.
*   **Open Taps**: Open sink taps downstairs to drain the system and reduce pressure upstairs.

### 2. Protect The Ceiling
![Tradesman using flashlight to find leak source](/blog/water-leak/tradesman-detecting-leak.jpg)
*   If the ceiling is bulging, water is trapped. Safety tip: Poke a small hole with a screwdriver in the bulge to release the water into a bucket. **This prevents the whole ceiling from collapsing.**

### 3. Electrics
*   If water is near a light fixture, **do not touch the switch**. Turn off the lighting circuit at your fuse box if safe.

### 4. Detective Work
![Water dripping from attic roof](/blog/water-leak/attic-roof-leak.jpg)
*   Check if it is a plumbing leak (constant) or weather-related (only when it rains).

### 5. Who To Call?
*   **Plumber**: To fix the leak.
*   **Insurance**: Take photos immediately for your claim.

> **Water Regulations**: All plumbing work must comply with Water Supply (Water Fittings) Regulations 1999.
> *   [Water Regs UK: Finding a compliant plumber](https://www.waterregsuk.co.uk/)
> *   [CIPHE: Approved Plumber Search](https://www.ciphe.org.uk/)

---
**Leak won't stop?** [Call an Emergency Plumber immediately](/emergency-plumber/birmingham).`
    }
];

async function seedPanicBlogs() {
    console.log('🚨 Seeding Panic Search Blog Posts...');

    for (const post of panicPosts) {
        console.log(`Writing: ${post.title}`);

        // Upsert to ensure we don't create duplicates if run twice
        const { data, error } = await supabase
            .from('posts')
            .upsert({
                ...post,
                published: true,
                published_at: new Date().toISOString(),
                created_at: new Date().toISOString() // Only used on insert
            }, { onConflict: 'slug' })
            .select();

        if (error) {
            console.error(`❌ Error on ${post.slug}:`, error.message);
        } else {
            console.log(`✅ Success: ${post.slug}`);
        }
    }

    console.log('✅ All done!');
}

seedPanicBlogs();
