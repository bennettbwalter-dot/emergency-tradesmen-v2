import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Turn the key and hear a click? Or a slow groan? Don't call a tow truck yet. Here is the US Driver's 2025 Troubleshooting Guide to Dead Batteries, Bad Starters, and Failed Alternators.**

---

#### 1. The Golden Rule: "Click vs. Crank"
The sound your car makes is the #1 diagnostic tool.
*   **One Loud Click:** You turn the key, hear a single solid *CLUNK*, and everything goes dark.
    *   **Diagnosis:** The **Starter Motor Solenoid** is engaging, but the motor isn't spinning. This is usually a bad starter or a loose battery terminal.
*   **Rapid Clicking (Machine Gun Sound):** *Click-click-click-click-click.*
    *   **Diagnosis:** The starter is trying to engage but doesn't have enough voltage to hold. **Dead Battery.**
*   **Slow Crank:** *Rrr... rrr... rrr...* (Groaning sound).
    *   **Diagnosis:** Dying battery or thick oil in extreme cold (<0°F).
*   **Crank but No Start:** The engine spins fast and healthy, but won't "catch."
    *   **Diagnosis:** Fuel or Spark issue. (Fuel pump or Spark Plugs).

#### 2. The Alternator Test (DIY)
How do you know if it's the battery or the alternator?
*   **The Test:** Jump start the car. Let it run for 5 minutes. Remove the jumper cables.
*   **The Result:** If the car dies *immediately* (or within 30 seconds) after removing the cables, your **Alternator** is dead. It is running solely on the battery, and once the external source is gone, it dies.
*   **The Voltage:** A healthy alternator puts out 14.2 Volts. A battery is only 12.6 Volts.

#### 3. Modern Key Fob Issues (Push-to-Start)
"Key Not Detected"?
*   **The Panic:** You press the start button, and the dash says "No Key."
*   **The Fix:** Your fob battery is dead (CR2032). Every manufacturer builds a "Limp Mode" into the system.
    *   **Ford/Chevy:** Place the fob *physically against* the plastic start button and push it. The button has an NFC reader that works without battery power.
    *   **Toyota:** Hold the fob against the button until the light turns green.

#### 4. Case Study: The "Vampire Drain" in Denver
*   **The Scenario:** A Subaru Outback owner in Denver kept finding their car dead after parking it for 2 days. The battery tested "Good" at AutoZone.
*   **The Investigation:** A multimeter test showed a "Parasitic Draw" of 0.5 Amps (Normal is 0.05).
*   **The Culprit:** A dashcam plugged into the cigarette lighter. In many cars, that socket is "Always On," even when the car is off. The camera was recording the inside of a dark garage all night, draining the battery.
*   **The Fix:** Hardwiring the dashcam to the "Ignition Fuse" so it turns off with the car.

#### 5. Cost Breakdown (2025 Estimates)
| Component | Part Cost | Labor Cost | Total |
| :--- | :--- | :--- | :--- |
| **New Battery (AGM)** | $180 - $250 | $50 | $230 - $300 |
| **Alternator** | $300 - $600 | $200 | $500 - $800 |
| **Starter Motor** | $200 - $400 | $250 | $450 - $650 |
| **Tow (5 miles)** | - | - | $120+ |
| **Portable Jump Pack** | $80 (Amazon) | - | $80 |

#### 6. The 12-Month Car Care Calendar
*   **Jan:** Check tire pressure (Air shrinks in cold).
*   **Feb:** Wash salt off the undercarriage (Rust prevention).
*   **Mar:** Replace wiper blades.
*   **Apr:** Check AC refrigerant before summer.
*   **May:** Test battery voltage (Heat kills batteries more than cold).
*   **Jun:** Check coolant levels (Overheating risk).
*   **Jul:** Inspect serpentine belt for cracks.
*   **Aug:** Check brake pads thickness.
*   **Sep:** Wax the paint (Winter protection).
*   **Oct:** Check all exterior lights.
*   **Nov:** Buy a scraper and de-icer spray.
*   **Dec:** Put an emergency kit (blanket/gloves) in the trunk.

#### 7. Glossary of US Auto Terms
1.  **AGM:** Absorbent Glass Mat (Modern battery type).
2.  **Alternator:** The generator that charges the battery.
3.  **CCA:** Cold Cranking Amps (Battery power rating).
4.  **Crank:** The engine turning over.
5.  **Ignition Coil:** Creates the spark.
6.  **Jump Pack:** Lithium battery to jump start without another car.
7.  **Parasitic Draw:** Something using power when car is off.
8.  **Serpentine Belt:** The belt driving the alternator.
9.  **Solenoid:** The switch inside the starter.
10. **Spark Plug:** Ignites the fuel.
11. **Core Charge:** Deposit paid on old battery at the store.

#### 8. FAQ Section
**Q: Can I jump a hybrid (Prius)?**
A: **Yes, but rely on the manual.** The 12V battery is usually in the trunk or under the rear seat, not under the hood. There is often a "Jump Point" (Red Tab) in the fuse box under the hood for safety.

**Q: My battery has corrosion (blue powder) on it. Is it dead?**
A: **Not necessarily.** That is lead sulphate. Clean it off with a mixture of baking soda and water and a wire brush. It causes a bad connection which mimics a dead battery.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Car won't start on a frosty morning? Dreading the call to the boss? Before you call the AA, check the essentials. Here is the UK Guide to Flat Batteries and Alternators.**

---

#### 1. The Winter Killer: Why Frost Kills Batteries
A lead-acid battery relies on a chemical reaction to create electricity.
*   **The Physics:** At 0°C, a battery loses 35% of its power. At the same time, the engine oil thickens, making the engine 50% harder to turn.
*   **The Age Factor:** Car batteries last 3-5 years. If yours is 5 years old, it *will* fail on the first proper frost of the year.

#### 2. Diagnostics: The Headlight Test
Don't have a multimeter? Use your lights.
1.  Turn the headlights ON.
2.  Try to start the car.
    *   **If the lights go dim or out:** The starter is taking all the juice, and there isn't enough. **Flat Battery.**
    *   **If the lights stay bright:** The battery has power, but the starter isn't taking it. **Starter Motor Failure.**

#### 3. The "Bump Start" (Manuals Only)
Since 60% of UK cars are manual, you have a backup option.
*   **The Method:**
    1.  Turn ignition ON (Warning lights on dash).
    2.  Put car in **2nd Gear**.
    3.  Hold Clutch down.
    4.  Get 2 friends to push the car to walking speed.
    5.  **Dump the Clutch:** Release the clutch specifically. The momentum of the wheels forces the engine to spin and fire.
*   **Warning:** **Never** try this in an Automatic. You will destroy the transmission.

#### 4. Legal Note: "Quitting" (Idling)
Leaving your car running on the driveway to defrost while you go inside for a tea?
*   **The Law:** Under *Section 42 of the Road Traffic Act 1988*, "stationary idling" is an offense (Fine: £20-£80).
*   **Insurance:** Major Warning. If your car is stolen while keys are in the ignition (even if locked), your insurance company **will not pay out**. It is classed as "negligence."

#### 5. Case Study: The "Smart Alternator" Issue (Ford Focus)
*   **The Scenario:** A driver bought a new battery from Halfords and fitted it themselves to save £50.
*   **The Outcome:** The Stop/Start system stopped working, and the battery died again in 6 months.
*   **The Reason:** Modern cars (Euro 6) have "Smart Charging." The ECU needs to be told a new battery is installed ("Battery Registration"). If you don't code it, the car thinks the old battery is still there and undercharges the new one.
*   **The Fix:** Pay a garage £40 to plug in a diagnostic tool and register the battery.

#### 6. UK Repair Costs (2025)
| Part | Parts Cost | Labour (VAT Inc) | Total |
| :--- | :--- | :--- | :--- |
| **New AGM Battery** | £120 - £180 | £40 | £160 - £220 |
| **Alternator** | £250 - £450 | £150 | £400 - £600 |
| **Starter Motor** | £200 - £350 | £120 | £320 - £470 |
| **Coding (Registration)** | - | £40 - £80 | £40+ |
| **Roadside Assistance** | - | - | £100+ (Non-Member) |

#### 7. The 12-Month UK Car Calendar
*   **Jan:** Check coolant antifreeze strength (Tester costs £5).
*   **Feb:** Wash wheel arches (Salt corrosion).
*   **Mar:** Check tyre tread depth (Legal min 1.6mm).
*   **Apr:** MOT Due? Check lights and horn.
*   **May:** Replace pollen filter (Hayfever season).
*   **Jun:** Check fan belt tension.
*   **Jul:** Top up screenwash (Flies on windscreen).
*   **Aug:** Check spare tyre pressure (before holiday).
*   **Sep:** Check wiper blades for splits.
*   **Oct:** Test battery health (before winter).
*   **Nov:** Buy de-icer and scraper.
*   **Dec:** Check oil level (cold starts burn oil).

#### 8. Glossary of UK Auto Terms
1.  **Alternator:** Charges battery.
2.  **Big End:** Major engine failure bearing.
3.  **Bonnet:** Hood.
4.  **Boot:** Trunk.
5.  **Bump Start:** Push starting.
6.  **Consumer Unit:** Fuse box.
7.  **Dpf:** Diesel Particulate Filter (Clogs if short journeys).
8.  **ECU:** Engine Control Unit (Computer).
9.  **Head Gasket:** Seal between engine blocks (White smoke = bad).
10. **MOT:** Annual safety test.
11. **Slave Cylinder:** Clutch part.
12. **Solenoid:** Starter switch.

#### 9. FAQ Section
**Q: Can I charge a battery without removing it?**
A: **Yes.** But connect the Negative (Black) charger clip to a chassis earth point, not the battery terminal, if your car has "Smart Charging" (Stop/Start sensor on the terminal).

**Q: How long does a jump start take?**
A: Connect the cables and let the "Donor Car" run for 5 minutes *before* trying to start the dead car. This puts surface charge into the dead battery.
`;

async function insertRegionalBatch() {
    console.log(`--- Starting Batch 5 Insertion (Car Won't Start) ---`);

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'car-wont-start-click-vs-crank-us',
            title: "Car Won't Start? The US Driver's 2025 Troubleshooting Guide (Click vs. Crank)",
            content: us_content,
            excerpt: "Turn the key and hear a click? Diagnose your Dead Battery, Bad Starter, or Failed Alternator. Plus 'Vampire Drain' case study and jump-start safety.",
            cover_image: "/blog/auto/jump-cables.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'car-wont-start-flat-battery-alternator-gb',
            title: "Car Won't Start on a Frosty Morning? UK Guide to Batteries & Alternators",
            content: gb_content,
            excerpt: "Flat battery in winter? How to identify a faulty Alternator vs. parasitic drain. The RAC guide to jump-starting and 'Bump Starting' manuals.",
            cover_image: "/blog/auto/frosty-car.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log(`--- Batch 5 (Car Won't Start) Complete ---`);
}

insertRegionalBatch();
