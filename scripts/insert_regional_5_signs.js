import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const us_content = `**Is that gurgling sound dangerous? Identifying Red Flag symptoms: Low water pressure, "Coffee Grounds" in sink, and wet spots on dry wall. Here are the 5 signs you need a pro NOW.**

---

#### Sign 1: No Water Pressure (Sudden Drop)
Gradual loss of pressure over years is just old pipes (mineral buildup). **Sudden** loss means a major burst pipe.
*   **The Test:** Turn on multiple faucets (Kitchen + Bath). If they are all dripping/dry, the break is likely in the "Service Line" from the street to your house.
*   **The Check:** Walk your front yard. Look for a "soggy spot" or water bubbling up from the grass. This is a $3,000 repair involving an excavator.
*   **The DIY Gauge:** Buy a $10 "Water Pressure Gauge" from Home Depot. Screw it onto an outdoor hose bib. Normal is 40-80 PSI. Below 30 is a crisis. Above 80 is dangerous (needs a PRV).

#### Sign 2: Backflow (Sewage in Tub)
This is the most dangerous symptom in plumbing.
*   **The Event:** You flush the toilet, and water gurgles UP the shower drain or bathtub.
*   **The Cause:** The main sewer line leaving your house is blocked (Tree roots or "flushable" wipes). The waste has nowhere to go but the lowest point in the house.
*   **Health Risk:** That water is "Category 3 Black Water." It contains feces and bacteria. Do not touch it.
*   **Action:** Stop using water immediately. Do not run the dishwasher or washing machine. You need a "Main Line Cleanout" (Auger).

#### Sign 3: "Coffee Grounds" in Sink
*   **The Symptom:** You turn on the *hot* water, and black/brown sediment comes out. It looks like coffee grounds.
*   **The Cause:**
    *   **Brown/Rust:** Your galvanized steel pipes (common in homes pre-1970) are rusting from the inside out. They are about to burst.
    *   **Black/Plastic:** The "Dip Tube" inside your water heater is disintegrating.
*   **The Fix:** If it's the dip tube, you need to flush the heater. If it's the pipes, you need a whole-house repipe (PEX).

#### Sign 4: The "Wet Spot" on Drywall
*   **The Appearance:** A brown stain on the ceiling or high up on a wall. It grows larger over hours.
*   **The Danger:** It means there is an active leak above. Water is pooling on top of the drywall. Wet drywall is heavy. It will collapse, dumping gallons of water and insulation into your living room.
*   **Immediate DIY:** Poke a hole in the center of the stain with a screwdriver. Put a bucket underneath. This relieves the weight and saves the ceiling from collapsing while you wait for the plumber.

#### Sign 5: Gas Smell (Rotten Eggs)
In the US, Plumbers handle gas lines (not just HVAC technicians).
*   **The Smell:** Natural gas is odorless. They add "Mercaptan" to make it smell like sulfur/rotten eggs.
*   **The Action:** Leave the house. Call 911 or the Gas Utility. Do not turn light switches on/off (sparks).
*   **The Diagnostic:** Plumbers use a "Manometer" to pressure test the lines to find the leak.

#### 6. Preventative Maintenance: Enzymes vs. Chemicals
*   **The Mistake:** Pouring Drano down a slow drain. It is caustic acid. It eats old pipes and generates heat, often cracking toilet porcelain.
*   **The Solution:** Use "Enzyme Cleaners" (Bio-Clean). These are bacteria that eat the organic sludge (hair/grease) without damaging the pipes. Use them once a month overnight.

#### 7. Insurance: "Sudden and Accidental"
*   **The Rule:** Standard homeowners insurance covers water damage if it is "Sudden and Accidental" (e.g., a burst pipe).
*   **The Exception:** They do **NOT** cover "Long Term Seepage." If that wet spot on the ceiling has been there for 6 months and mold grew, they will deny the claim as "Negligence."
*   **The Lesson:** Report leaks immediately.

#### 8. Cost Reality Check: Emergency vs. Scheduled
| Service | Scheduled (9am-5pm) | Emergency (2am/Sunday) |
| :--- | :--- | :--- |
| **Service Call** | $80 - $120 | $200 - $350 |
| **Hourly Labor** | $120 - $180 | $250 - $400 |
| **Main Line Auger** | $250 - $400 | $600 - $800 |
| **Burst Pipe Fix** | $300 | $800 |
| **Camera Inspection** | $200 | $350 |

#### 9. Glossary of US Plumbing Terms
1.  **Auger:** A "Snake" to clear drains.
2.  **Backflow:** Water flowing backwards (sewage).
3.  **Cleanout:** Access point for the sewer line (White cap in yard).
4.  **Dip Tube:** Cold water inlet tube in heater.
5.  **Galvanized:** Old steel pipes (Rust warning).
6.  **Hydro-Jetting:** High pressure water to clean sewers (better than snaking).
7.  **Main Line:** The big sewer pipe leaving the house.
8.  **PEX:** Modern plastic flexible piping (Red/Blue).
9.  **Rooter:** Roto-Rooter (Brand name for auger).
10. **Slab Leak:** Leak under the concrete foundation (Requires jackhammer).

#### 10. FAQ Section
**Q: Is a dripping faucet an emergency?**
A: **No.** It wastes water, but it won't flood your house. Put a bucket under it and call a plumber on Monday to save the "Emergency Fee."

**Q: Can I use "Flushable Wipes"?**
A: **NO.** Plumbers call them "Job Security." They do not break down like toilet paper. They snag on tree roots and cause massive backups. Put them in the trash.

**Q: My water heater is making popping sounds.**
A: **Sediment.** Calcium has built up on the bottom. It traps water, which boils and "pops." Flush the heater via the drain valve at the bottom (attach a garden hose).
`;

// ------------------------------------------------------------------
// UK CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const gb_content = `**Noisy pipes? Cold radiators? 5 critical warning signs that you need a plumber before the ceiling comes down. Water Hammer vs. Boiler Kettling.**

---

#### Sign 1: "Water Hammer" (Banging Pipes)
*   **The Sound:** A loud metallic *BANG* or *CLANG* when a tap turns off or the washing machine fills.
*   **The Cause:** High water pressure or unsecured pipes. The water is moving fast and stops suddenly (shockwave).
*   **The Risk:** The shockwave physically moves the pipe. Eventually, a soldered joint will crack or a compression fitting will blow off, causing a flood.
*   **The Fix:** Install a "Shock Arrestor" (mini expansion vessel) or clip the pipes properly.

#### Sign 2: The Boiler "Kettling"
*   **The Sound:** The boiler makes rumbling, banging noises like a kettle boiling.
*   **The Cause:** Hard water (Limescale) has built up on the heat exchanger. The water is trapped behind the scale and is "flash boiling" into steam.
*   **The Fix:** System descaler (chemical sentinels) or a "Power Flush." If ignored, the heat exchanger will crack (£500 part).
*   **Hard Water Map:** London, the South East, and East Anglia have the hardest water. Scotland has soft water.

#### Sign 3: Radiators Cold at the Bottom
*   **The Symptom:** The top of the radiator is hot, but the bottom is stone cold.
*   **The Cause:** **Sludge (Magnetite).** Rust from the inside of the radiators has settled at the bottom working like thick mud.
*   **The Risk:** This black sludge will eventually get sucked into the boiler pump and kill it (pump seizure).
*   **The Fix:** You need a Magnetic Filter (MagnaClean) fitted and a Power Flush to push the sludge out.

#### Sign 4: Lead Pipe Discovery
*   **The Check:** Look at the pipe connecting to your stopcock under the sink. Is it grey, soft (can be scratched with a key to reveal silver), and swollen at the joints?
*   **The Crisis:** Lead is toxic, especially for children (developmental issues).
*   **The Law:** The Water Board is responsible for the "Communication Pipe" (Street to Boundary). You are responsible for the "Supply Pipe" (Boundary to House).
*   **Replacement Scheme:** Many water companies (e.g., Severn Trent) will replace their bit for free *if* you replace yours. Grants are sometimes available.

#### Sign 5: The "Spinning Meter"
*   **The Test:** Turn off every tap in the house. Don't flush toilets. Ensure the washing machine is off.
*   **The Observation:** Go to the water meter in the pavement. Open the lid.
*   **The Result:** Is the little cog spinning? If yes, water is moving. You have a leak underground between the meter and the house.
*   **The Cost:** You pay for this wasted water!

#### 6. Insurance: HomeServe vs. British Gas
Should you buy "Plumbing Cover"?
*   **The Cost:** £15 - £25 per month.
*   **The Value:** Good for peace of mind if you have an old system.
*   **The Catch:** They often have an "Excess" (£60) per callout. And they won't fix "pre-existing faults" (sludge).
*   **Verdict:** Put the £20/month into a savings account. In 5 years, you have £1,200 for a new boiler.

#### 7. Preventative: The Stopcock Test
*   **The Drill:** Twice a year (Daylight Savings), turn your main stopcock off and on again.
*   **Why?** Brass valves seize up if left alone. The one time you need it (flood), it will be stuck. 
*   **Lubrication:** Spray a little WD-40 on the spindle (not the drinking water part) to keep it moving.

#### 8. UK Emergency Costs (2025)
| Service | Standard Rate | Emergency Rate |
| :--- | :--- | :--- |
| **Callout Fee** | £60 - £90 | £150 - £200 |
| **Trace and Access** | £450 (Fixed) | £600+ |
| **Power Flush** | £400 - £600 | - |
| **Boiler Repair** | £120 + Parts | £300 + Parts |
| **Tap Washer** | £80 | £180 |

#### 9. Glossary of UK Plumbing Terms
1.  **Airlock:** Air trapped in pipes stopping flow.
2.  **Combination Valve:** Reduces pressure.
3.  **Communication Pipe:** Utility-owned pipe.
4.  **Heat Exchanger:** Part of boiler that heats water.
5.  **Kettling:** Boiler noise (Scale).
6.  **Limescale:** Calcium deposit form Hard Water.
7.  **Magnetite:** Black rust sludge (Ferrous).
8.  **Power Flush:** High pressure cleaning of radiators.
9.  **Stopcock:** Main water shut-off.
10. **Supply Pipe:** Homeowner-owned pipe.
11. **TRV:** Thermostatic Radiator Valve (Knob with numbers).

#### 10. FAQ Section
**Q: My overflow pipe is dripping. Is it an emergency?**
A: **No.** It warns you a valve has failed (usually toilet or loft tank), but the water is going outside (safe). It's annoying but not dangerous. Fix it during normal hours.

**Q: Why is my hot water cloudy?**
A: **Aeration.** Fill a glass and let it stand. If it clears from the bottom up, it is just millions of tiny air bubbles (often happens in winter with high pressure). It is harmless.

**Q: Can I claim for a burst pipe?**
A: **Yes.** But check your policy excess. If the damage is just a wet carpet, the excess (£250) might be more than the drying cost. Claim only for major damage.
`;

async function insertRegionalBatch() {
    console.log(`--- Starting Batch 6 Insertion (5 Signs Plumber) ---`);

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: '5-signs-emergency-plumber-needed-us',
            title: "5 Signs You Need an Emergency Plumber NOW (US Guide)",
            content: us_content,
            excerpt: "Is that gurgling sound dangerous? Identifying Red Flag symptoms: Low water pressure, Backflow, and 'Coffee Grounds' in the sink. 5 critical signs.",
            cover_image: "/blog/plumbing/burst-pipe.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: '5-signs-emergency-plumber-needed-gb',
            title: "5 Signs Your Plumbing is About to Fail (UK Emergency Guide)",
            content: gb_content,
            excerpt: "Noisy pipes? Cold radiators? 5 critical warning signs that you need a plumber before the ceiling comes down. Water Hammer, Kettling, and Sludge.",
            cover_image: "/blog/plumbing/leaking-radiator.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log(`--- Batch 6 (5 Signs Plumber) Complete ---`);
}

insertRegionalBatch();
