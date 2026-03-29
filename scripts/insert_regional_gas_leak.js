import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**You smell rotten eggs. You hear a hissing sound. Do NOT turn on the lights. This is the US homeowner's guide to surviving a natural gas leak.** For immediate shut-off steps, see our [Home Emergency Shut-off Guide](/blog/home-emergency-shut-off-protocol-us).

---

#### 1. Identification: Is it Gas?
Natural gas is odorless. Utility companies add **Mercaptan** to give it that distinctive "Rotten Egg" or sulfur smell.
*   **The Hiss:** If you hear a hissing or whistling sound near your water heater or furnace, gas is escaping under pressure.
*   **The Bubbles:** If you see bubbles in a puddle in your yard, or a patch of dead grass, it could be an underground service line leak.

#### 2. The "No Spark/No Flame" Rule
If you suspect a leak, your home is a bomb. Ideally, the gas concentration needs to be between 5% and 15% (the explosive range) to ignite, but you don't know the percentage.
*   **Do NOT:** Turn light switches on OR off. The tiny spark inside the wall switch is enough to ignite the gas.
*   **Do NOT:** Use a landline or cell phone inside the house.
*   **Do NOT:** Open the garage door. The electric motor creates massive sparks.
*   **Do NOT:** Light a match or cigarette.

#### 3. The Shut-Off Guide (Know Your Meter)
If the smell is faint and you can safely reach the meter outside:
1.  **Locate the Meter:** Usually on the side of the house.
2.  **Find the Valve:** Look for the pipe coming *out* of the ground into the meter. There is a valve on it. It usually has a rectangular tab.
3.  **The Tool:** You need a 12-inch adjustable wrench.
4.  **The Turn:** Turn the tab 90 degrees. When the tab is **crosswise** (perpendicular) to the pipe, the gas is OFF. If it is parallel, it is ON.

#### 4. Carbon Monoxide (The Silent Killer)
CO is different from Natural Gas. It is odorless and colorless. It comes from incomplete combustion (a yellow flame instead of blue).
*   **Symptoms:** Headache, dizziness, nausea, confusion, "The Flu without the Fever."
*   **The Source:** A cracked heat exchanger in your furnace, or using a generator/grill indoors.
*   **The Alarm:** You must have CO detectors on every level of your home and outside every sleeping area. Refer to [NFPA 720](https://www.nfpa.org/en/codes-and-standards/720) for installation standards.

#### 5. Glossary of US Gas Terms
1.  **BTU:** British Thermal Unit (Heat measurement).
2.  **Black Iron Pipe:** The standard steel pipe for indoor gas.
3.  **CSST:** Corrugated Stainless Steel Tubing (Yellow flexible gas line).
4.  **Combustion Air:** Fresh air needed for the flame.
5.  **Drip Leg:** A pipe trap to catch sediment before the appliance.
6.  **Flue:** The exhaust pipe for the furnace.
7.  **Heat Exchanger:** The metal chamber that heats the air (cracks release CO).
8.  **Manometer:** Tool to measure gas pressure.
9.  **Mercaptan:** The "rotten egg" chemical.
10. **Pilot Light:** Small continuous flame (older appliances).
11. **Regulator:** Device reducing street pressure to home pressure.
12. **Riser:** The pipe coming out of the ground.
13. **Thermocouple:** Safety sensor that shuts gas if pilot goes out.
14. **Vent:** Exhaust system.
15. **Water Column (WC):** How gas pressure is measured (Standard is 7" WC).

#### 6. Regional Safety: Earthquake Shut-Off Valves (California)
If you live in a seismic zone (CA, OR, WA), your gas meter should be equipped with a seismic shut-off valve.
*   **How it works:** A metal ball sits on a pedestal inside the valve. When an earthquake of magnitude 5.0+ hits, the shaking knocks the ball off, blocking the pipe instantly.
*   **The Risk:** After the 1994 Northridge Earthquake, half the fires were caused by gas leaks. If you don't have one, call a plumber today ($300-$500).

#### 7. Technical Warning: CSST and Lightning
Corrugated Stainless Steel Tubing (CSST) is that yellow flexible gas pipe found in millions of US attics.
*   **The Flaw:** If lightning strikes near your home, the electrical energy can arc to the thin jagged walls of the CSST, punching a hole and igniting the gas (the "Blowtorch Effect").
*   **The Fix:** All CSST systems must be **Bonded** (grounded) to the home's electrical panel with a 6 AWG copper wire. If you see yellow pipe in your attic, check if it has a green wire attached to the brass nut. If not, it is unsafe.

#### 8. The 12-Month Gas Safety Calendar
*   **Jan:** Check CO detector batteries (Replace if >7 years old).
*   **Feb:** Inspect the furnace flame color (Blue = Good, Yellow = Bad).
*   **Mar:** Clear snow/ice from the outdoor meter (don't let it get buried).
*   **Apr:** Test the shut-off valve with your wrench (Turn 1/8th turn then back, to ensure it's not seized).
*   **May:** Inspect the water heater flue for rust or disconnection.
*   **Jun:** Check the dryer vent for lint (fire hazard).
*   **Jul:** Visual check of outdoor gas grill lines for cracking.
*   **Aug:** Call utility for a "Meter Health Check" (often free).
*   **Sep:** Schedule professional furnace tune-up ($99).
*   **Oct:** Clear leaves from around the combi-boiler intake (if applicable).
*   **Nov:** Verify the "Combustion Air" vents in the utility room are not blocked by boxes.
*   **Dec:** Holiday safety: Don't hang lights on gas pipes.

#### 9. FAQ Section
**Q: Can I turn the gas back on myself?**
A: **No.** If you turned it off due to a leak, a Utility Company or Licensed Plumber must pressure test the line before turning it back on. If you turn it on yourself and there is an open valve inside, you will fill the house with gas.

**Q: Who do I call?**
A: **911** first, then your Utility Company (e.g., PG&E, ConEd). They will come out for free to make it safe. Then call a private plumber for the repair. For more on seasonal safety, see our [Carbon Monoxide US Guide](/blog/carbon-monoxide-us).
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Smell gas? Do not touch the light switch. Follow the "Golden Rule" and call 0800 111 999 immediately. This is the UK guide to gas safety.** For more on winter heating issues, see our [Frozen Condensate Guide](/blog/frozen-condensate-pipe-fix-gb).

---

#### 1. The Golden Rule
If you smell gas (rotten cabbage/eggs) or suspect Carbon Monoxide:
1.  **Open** doors and windows to ventilate the property.
2.  **Turn Off** the gas at the meter (Emergency Control Valve).
3.  **Do Not** operate electrical switches (On OR Off).
4.  **Evacuate** the property.
5.  **Call 0800 111 999** (The [National Gas Emergency Service](https://www.nationalgas.com/safety-and-emergencies/smell-gas)). This number works for all suppliers (British Gas, E.ON, Octopus, etc.) and is free, 24/7.

#### 2. The Emergency Control Valve (ECV)
You must know where this is *before* an emergency.
*   **Location:** Usually in a white plastic box outside, under the stairs, or in a hallway cupboard.
*   **Action:** The valve is usually a lever. If the lever is **parallel** to the pipe, gas is ON. Turn it 90 degrees so it is **crosswise** to the pipe to turn it OFF.

#### 3. Gas Safe Register: The Law
In the UK, it is illegal for anyone who is not **Gas Safe Registered** to work on a gas appliance.
*   **The ID Card:** Every engineer carries a card. Check the back. It lists what they are qualified to work on (Domestic Boilers, Cookers, Fires, etc.).
*   **DIY:** You cannot "have a go" at fixing a boiler. It is a criminal offense.

#### 4. Carbon Monoxide (CO)
CO kills around 50 people a year in the UK.
*   **The Law:** Tenants must legally have a CO alarm in any room with a solid fuel appliance, and (since 2022) in any room with a gas boiler.
*   **The Signs:** Sooting or yellow/brown staining on the boiler case. A "lazy" yellow flame instead of a crisp blue one. pilot lights blowing out frequently.
*   **Symptoms:** Drowsiness, headaches, collapse.

#### 5. Glossary of UK Gas Terms
1.  **Balanced Flue:** Modern boiler flue (takes air in, pushes exhaust out).
2.  **Combi Boiler:** Combination boiler (Heating + Hot Water).
3.  **Condensate Pipe:** Plastic pipe removing acidic water from boiler.
4.  **ECV:** Emergency Control Valve (Main shut-off).
5.  **Flue:** Chimney pipe.
6.  **Gas Safe:** The official registration body (replaced CORGI).
7.  **Gasket:** Seal to prevent leaks.
8.  **Heat Exchanger:** Core part of boiler.
9.  **LPG:** Liquid Petroleum Gas (Bottled gas for rural homes).
10. **Meter:** Measures usage (m3 or ft3).
11. **Open Flue:** Older system taking air from the room (higher risk).
12. **Pilot:** Ignition flame.
13. **Plume:** The white steam from the flue (water vapour).
14. **Purging:** Removing air from a new pipe.
15. **Smart Meter:** Digital meter sending readings automatically.
16. **Solenoid:** Electric gas valve.
17. **Tightness Test:** Pressure test to check for leaks.
18. **Trace and Access:** Finding a leak under a floor.

#### 6. Historical Context: The Ronan Point Disaster
In 1968, a gas explosion on the 18th floor of Ronan Point (a tower block in London) caused the entire corner of the building to collapse, killing 4 people. This tragedy changed UK building regulations forever. It is the reason why **Flues** must now be accessible for inspection (hatches in the ceiling) and why gas pipes in tower blocks have stricter safety valves.

#### 7. Landlord & Tenant Law: The CP12
If you rent your home, your Landlord is legally required (under the *Gas Safety (Installation and Use) Regulations 1998*) to provide you with a valid **CP12 Certificate** every 12 months.
*   **The Check:** An engineer must physically test every gas appliance (Boiler, Hob, Fire).
*   **The Paperwork:** You must receive a copy within 28 days of the check. If you don't have one, your landlord is breaking the law. Report them to the [HSE (Health and Safety Executive)](https://www.hse.gov.uk/gas/domestic/). For more on boiler pressure, see our [Combi Boiler Guide](/blog/boiler-pressure-dropping-filling-loop-gb).

#### 8. The 12-Month UK Gas Safety Calendar
*   **Jan:** Bleed radiators (release trapped air). If you do this often, you have a leak.
*   **Feb:** Check the pressure gauge on the boiler. It should be between 1.0 and 1.5 bar.
*   **Mar:** Test the CO alarm (Press the test button).
*   **Apr:** Turn the heating off, but run it for 10 mins once a week to prevent the pump seizing.
*   **May:** Service the boiler (Summer is cheaper/easier to book engineers).
*   **Jun:** Inspect the external flue terminal. Is it blocked by a new bush or creeper plant?
*   **Jul:** Check the Condensate Pipe (the white plastic one outside). Is it insulated against winter feeezing?
*   **Aug:** Visual check of the yellow gas pipe entry point to the house. Is it rusting?
*   **Sep:** Repressurize the system before winter start.
*   **Oct:** Confirm all TRVs (Thermostatic Radiator Valves) are not stuck.
*   **Nov:** Check the "fill loop" is disconnected (it should not be left attached).
*   **Dec:** Ensure the gas meter cupboard is not being used to store flammable items (paint/paper).

#### 9. FAQ Section
**Q: The National Gas engineer came and capped my supply. Now what?**
A: The emergency engineer's job is to make it **Safe**, not to fix it. If they find a leak, they will disconnect the supply (Cap it) and issue a "Warning Notice." You must then pay a private Gas Safe engineer to come and repair the fault and reconnect it.

**Q: Is "CORGI" still a thing?**
A: **No.** CORGI was replaced by the **Gas Safe Register** in 2009. If a tradesman says he is "CORGI Registered," he is 15 years out of date. Check his Gas Safe ID.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 3 Insertion (Smell Gas) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    // Upsert based on slug
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'smell-gas-what-to-do-safety-protocol-us',
            title: "Smell Gas? The US Homeowner's 911 & Shut-Off Protocol",
            content: us_content,
            excerpt: "Smell rotten eggs? Hissing sound? Immediate evacuation steps for Natural Gas and Propane leaks. Locating your meter shut-off and Carbon Monoxide safety.",
            cover_image: "/blog/gas-leak/meter-shutoff.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'smell-gas-what-to-do-safety-protocol-gb',
            title: "Smell Gas? The UK Guide to 0800 111 999 & The Golden Rule",
            content: gb_content,
            excerpt: "Smell gas? Turning off the ECV (Emergency Control Valve) and calling the National Grid. Gas Safe Register legal requirements and CO alarm laws.",
            cover_image: "/blog/gas-leak/meter-shutoff.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 3 (Smell Gas) Complete ---');
}

insertRegionalBatch();
