
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newPost = {
    slug: 'spring-thaw-pipe-burst-prevention',
    title: 'The "Spring Thaw" Myth — Why Your Pipes Are Most Likely to Burst When It Warms Up',
    excerpt: "If you've spent the last week anxiously watching the thermometer drop, assuming that once the temperature rises above freezing, you're safe — we have some bad news. The danger hasn't passed. It's just beginning.",
    cover_image: '/images/blog/spring-thaw/collage.jpg', // Using the provided collage
    published: true,
    published_at: new Date().toISOString(),
    content: `**If you've spent the last week anxiously watching the thermometer drop, assuming that once the temperature rises above freezing, you're safe — we have some bad news.**
**The danger hasn't passed. It's just beginning.**

In both the UK and the Northeastern US, thousands of homeowners wake up to flooded kitchens and collapsed ceilings not during the deep freeze, but on the first mild day that follows it. It's a phenomenon known in the trade as the **"Spring Thaw Burst"** (even if it happens in February), and it is responsible for some of the most catastrophic residential water damage recorded each year.

Today, New York is seeing temperatures rise to 47°F (8°C) after a freezing night. London is hovering around 7°C. This fluctuation is the exact trigger condition for thaw-related bursts.

Here is your comprehensive guide to understanding why this happens, how to spot the invisible signs of a leak today, and exactly what to do if you find one.

---

## The Physics of a "Thaw Burst"
![Ice crystals forming on a frozen structure](/images/blog/spring-thaw/ice-crystals.jpg)

To understand why pipes burst when it warms up, you need to understand what happened while it was cold.

### 1. The Freeze (The Blockage)
When water freezes inside a copper or plastic pipe, it creates an ice plug. This plug adheres to the inner walls of the pipe, effectively sealing it shut.

Water expands by about 9% when it turns to ice. This expansion puts immense stress on the pipe, often causing hairline fractures or splitting joints. **However, the ice itself often plugs these new cracks.** It acts as a temporary seal, holding back the water pressure.

### 2. The Pressure Build-Up
The real damage often isn't at the site of the ice plug itself, but downstream from it. As the ice expands, it pushes liquid water towards closed taps or valves. This trapped water has nowhere to go. Pressure can skyrocket from a normal 40-60 PSI to over **2,000 PSI**. This extreme pressure weakens joints and creates "micro-failures" throughout the system.

### 3. The Thaw (The Release)
![Icicles thawing on a fence in the sun](/images/blog/spring-thaw/thawing-icicles.jpg)

This is today. As the ambient temperature rises, the ice plug begins to melt. It shrinks. The temporary seal it provided for those hairline cracks vanishes.

Suddenly, 2,000 PSI of pressurised water — plus the unlimited flow from the mains — rushes through the system. It finds every split, crack, and loose joint that formed during the freeze.

Because the ice is gone, there is nothing to stop the flow. Water sprays out at full mains pressure, often behind walls or under floorboards where you can't see it until it's too late.

---

## 4 Silent Symptoms of a Thaw Burst
You might not see a waterfall coming through your ceiling immediately. Many thaw leaks start as "pinhole sprays" that damage structure for hours or days before becoming visible. Watch for these signs today:

### 1. The "Ghost" Water Meter
This is the most definitive test you can do.
- Turn off every tap, washing machine, and dishwasher in the house.
- Don't flush any toilets.
- Go to your water meter (usually on the pavement in the UK, or in the basement/utility room in the US).
- **Watch the dial.** If the small red triangle, cog, or digital number is moving *at all*, you have a leak.

### 2. Reduced Water Pressure
If you turn on a tap and the flow is weaker than usual, or it sputters and "spits" air, this is a red flag. It implies that water is escaping somewhere else in the line, or that a partial ice blockage is shifting.

### 3. Strange Noises Behind Walls
Go into quiet rooms (bathrooms, utility rooms) and listen.
- A **hissing** sound suggests a small, high-pressure spray (like a tyre leaking, but constant).
- A **dripping** or **trickling** sound behind a wall is an immediate emergency.
- **Banging or clanging** (water hammer) can indicate trapped air pockets or loose pipes vibrating due to pressure changes.

### 4. Damp Patches or Cold Spots
Run your hand along walls where pipes run. Feel for:
- Unexplained cold spots on drywall or plaster.
- Soft or "spongy" sections of flooring.
- Discolouration or yellow/brown stains on ceilings (water travels along joists, so the stain might be metres away from the actual leak).

---

## Immediate Action Plan: What to Do If You Suspect a Leak
If you find any of the signs above, **do not wait**. Water damage compounds exponentially with time.

### Step 1: Shut Off the Water
Go immediately to your **stopcock** (UK) or **main shut-off valve** (US).
- **Turn it clockwise** until it stops.
- If you can't find it, or it's seized, this is an instant emergency callout. Do not force a seized valve with a wrench — you could snap the spindle and leave yourself with no way to stop the flood.

### Step 2: Relieve the Pressure
Once the mains are off, open the cold water taps in your kitchen and bathroom (and an outside tap if you have one). This drains the system and stops water from spraying out of the leak site.

### Step 3: Killing the Electrics
If water is dripping near light fittings, sockets, or switches, or if it is pooling on the floor/ceiling:
- Go to your consumer unit (fuse box) / breaker panel.
- **Turn off the main switch** or the breakers for the affected circuits.
- Water acts as a conductor. Do not touch wet switches.

### Step 4: Call a Professional
Thaw bursts are rarely DIY fixes. They often involve split copper pipes that need cutting out and resoldering, or plastic push-fit joints that have blown apart.
- **[Find an Emergency Plumber Near Me](https://emergencytradesmen.net/)**
- Look for a verified tradesman who offers "Trace and Access" services if the leak is hidden.

---

## The Insurance "Gotcha": Trace and Access
We mentioned this usually, but it bears repeating during a thaw event.
Most home insurance policies cover "Escape of Water" (the damage caused by the water).
However, many **exclude** the cost of finding and repairing the leak itself.
This clause is called **Trace and Access**.
- If your plumber has to cut a hole in your expensive tiled bathroom floor to reach the pipe, and you *don't* have Trace and Access cover, you might be footing the bill for the floor restoration yourself.
- Check your policy wording today.

---

## Prevention for Next Time: The "Future-Proof" Protocol
Once the emergency is over, how do you stop this happening next February?

### 1. Lagging (Insulation) is Non-Negotiable
UK building regulations now require pipe insulation in unheated areas (lofts, basements, garages). But in older homes, bare copper pipes are common.
- **Fix:** Install foam lagging tubes (Armaflex or similar) on every inch of pipework in unheated zones. It costs pennies per metre and saves thousands.

### 2. Smart Leak Detectors
Technology has moved on from the "wait and see" approach.
- **Smart valves** (like leakBot or Moen Flo) clip onto your main pipe. They monitor flow rates and pressure 24/7. If they detect a micro-leak or unusual usage (like 400 litres in an hour), they send an alert to your phone and can even **automatically shut off your water**.

### 3. Keep the Heating On
If you are away during winter, never turn the heating completely off.
- Set the thermostat to a "frost protection" temperature (typically 12-15°C / 55°F). This keeps the internal fabric of the house warm enough to prevent loft pipes from freezing.

---

## Why You Need a Verified Emergency Plumber
When a thaw hits, demand for plumbers spikes by **300-400%** in 24 hours. This is prime time for rogue traders.
They know you are desperate. They know you have water pouring through your ceiling.
Some will charge extortionate "emergency callout fees" just to turn up, then claim the job is "too big" or damage your home further.
**Do not panic-hire.**
Use a platform that verifies its tradesmen.
- **Emergency Tradesmen** checks ID, insurance, and qualifications.
- We use a **1-5 Trust Score** system based on real customer feedback and digital footprint verification.
- You see the verification status *before* you call.

---

## Fun Fact
Water is one of the only substances in the universe that expands when it freezes. Almost everything else shrinks. If water behaved like other liquids — shrinking as it froze — ice would sink to the bottom of the ocean, and life on Earth (and your plumbing pipes) would look very different!

---

**Don't let the weather fool you today.**
If you hear a drip, hiss, or see a damp patch — act now.
**[Find a Verified Plumber Near You →](https://emergencytradesmen.net/)**
🛡️ Local. Verified. Ready to help.
`
};

async function insertPost() {
    console.log(`Upserting post: ${newPost.slug}`);

    // First try to check if it exists if we wanted to be careful, but upsert handles it.
    // We update on conflict on slug.
    const { data, error } = await supabase
        .from('posts')
        .upsert(newPost, { onConflict: 'slug' })
        .select();

    if (error) {
        console.error('Error upserting post:', error);
    } else {
        console.log('Successfully upserted post:', data);
    }
}

insertPost();
