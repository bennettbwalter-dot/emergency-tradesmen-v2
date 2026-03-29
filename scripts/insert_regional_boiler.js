import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Furnace blowing cold air? Woke up to a freezing house? Before you pay $150 for a service call, check the "High Limit Switch." This is the US homeowner's guide to forced air diagnostics.** For immediate safety steps, see our [Emergency Home Guide](/blog/what-to-do-in-home-emergency-before-help-arrives-us).

---

#### 1. The Panic Moment: It's blowing, but it's cold.
If you hear the fan running but feel cool air coming from the vents, your furnace is likely in **"Limit Lockout."**
*   **The Mechanism:** The furnace has a safety sensor called the High Limit Switch. Its job is to prevent the heat exchanger from getting too hot (which could crack it).
*   **The Sequence:** If the internal temperature hits ~200°F, the switch trips. It cuts the gas to the burners (fire goes out) but keeps the blower fan running to dissipate the heat.
*   **The Cause:** 90% of the time, this is caused by a **Dirty Air Filter** restricting airflow.

#### 2. The Diagnostics Checklist (US Forced Air)
Before calling a pro, perform this 5-minute audit:
1.  **Check the Filter:** Pull it out. If it's grey/black, replace it. (Size is printed on the cardboard edge, e.g., 16x25x1).
2.  **Check the Thermostat:** Is it set to "Fan: ON" instead of "Fan: AUTO"? If it's ON, the fan runs 24/7, even when the furnace isn't heating. Switch to AUTO.
3.  **Check the Vents:** Are half your vents closed? You might be choking the system, causing back-pressure that trips the limit switch. Open them up.
4.  **The Flame Sensor:** Watch the furnace start. Does the flame light for 4 seconds and then click off? Your flame sensor rod is likely coated in carbon. (Pro Tip: Polish it gently with a dollar bill or fine steel wool). For technical standards, see [NFPA 54](https://www.nfpa.org/54).

#### 3. Boiler Systems (Hydronic Heat)
If you have radiators instead of vents, you have a boiler.
*   **The Pressure Rule:** A cold boiler should sit at **12-15 PSI**.
*   **The Zero Pressure Fault:** If the gauge reads 0, water has leaked out, or the **Automatic Feeder Valve** (Pressure Reducing Valve) is clogged with sediment.
*   **The Fix:** Lift the "Fast Fill" lever on the feeder valve for 5 seconds. Watch the needle rise. Stop at 12 PSI.

#### 4. Historical Context: Alice Parker and the Gas Furnace
Before 1919, US homes were heated by coal or wood locally in each room. An African American inventor, **Alice H. Parker**, patented the first central heating system using natural gas. Her design allowed for individual ducts to carry heat to different parts of the building—the precursor to the modern "Zone Control" systems we use today. This invention sparked the shift away from dirty, labor-intensive coal shoveling toward the automated thermostats of the 20th century.

#### 5. Technical Deep Dive: AFUE Ratings (80% vs 90%+)
When buying a furnace, you see "AFUE" (Annual Fuel Utilization Efficiency).
*   **80% Furnace:** Uses a metal flue pipe. 20% of the heat goes up the chimney.
*   **90%+ (Condensing) Furnace:** Extracts so much heat that the exhaust gas cools down and turns to liquid water. It uses PVC plastic pipes for exhaust.
*   **The Maintenance Difference:** A 90% furnace has a "Condensate Trap" (a P-trap inside the unit). If this clogs with slime, the furnace will shut down to prevent water backing up into the burner. Flush this trap annually.

#### 6. The 12-Month HVAC Maintenance Calendar
*   **Jan:** Check the exterior exhaust pipe (PVC) for snow blockage.
*   **Feb:** Inspect the humidifier pad (if equipped). Mineral buildup reduces efficiency.
*   **Mar:** Listen for "short cycling" (furnace turning on/off every 3 mins).
*   **Apr:** Switch humidifier to "Summer/Off" position.
*   **May:** Clean the AC condenser coils outside (Cottonwood/pollen).
*   **Jun:** Check the condensate drain line for algae. Pour a cup of vinegar down.
*   **Jul:** Inspect the "Start Capacitor" on the AC unit (visual check for bulging).
*   **Aug:** Clear vegetation 2ft away from the outdoor unit.
*   **Sep:** Replace the furnace filter (Start of heating season).
*   **Oct:** Test the Carbon Monoxide detectors.
*   **Nov:** Vacuum the burners (if comfortable doing so).
*   **Dec:** Check the thermostat batteries.

#### 7. Glossary of US HVAC Terms
1.  **AFUE:** Efficiency rating.
2.  **Blower Motor:** The fan that pushes air.
3.  **Capacitor:** A battery-like device that helps motors start.
4.  **Draft Inducer:** Small fan that clears exhaust gas before ignition.
5.  **Heat Exchanger:** The metal clamshell that separates fire from your air.
6.  **High Limit Switch:** Overheat safety sensor.
7.  **Igniter (Hot Surface):** The glow stick that lights the gas.
8.  **MERV:** Filter rating (Minimum Efficiency Reporting Value). Higher = tighter mesh.
9.  **Plenum:** The metal box distributing air to ducts.
10. **Pressure Switch:** Proves the draft inducer is working.
11. **Return Drop:** The duct bringing air back to the furnace.
12. **Scroll Compressor:** The motor inside the AC unit.
13. **Thermocouple:** Flame sensor for older pilot lights.
14. **Zone Valve:** Controls flow to specific areas (Boilers).
15. **Short Cycling:** Rapid on/off behavior.

#### 9. Case Study: The "Cracked Heat Exchanger" in Michigan (2024)
*   **The Scenario:** A family in Detroit noticed their CO detector chirping intermittently. They assumed it was a low battery and replaced it. The new one also chirped.
*   **The Diagnosis:** A technician found a hairline crack in the 18-year-old heat exchanger.
*   **The Science:** When the furnace heated up, the metal expanded, opening the crack. The blower fan (which has higher pressure) pushed air *into* the combustion chamber, disturbing the flame. However, during the "cool down" cycle, exhaust gas (CO) leaked back into the supply air.
*   **The Outcome:** The unit was Red Tagged immediately. The family had to stay in a hotel.
*   **The Lesson:** Inspect heat exchangers annually after year 15. For more on gas safety, see our [Carbon Monoxide US Guide](/blog/carbon-monoxide-us).

#### 10. Cost Breakdown: Repair vs. Replace (2025 Estimates)
| Component | Part Cost | Labor Cost | Total | Worth Fixing? |
| :--- | :--- | :--- | :--- | :--- |
| **High Limit Switch** | $20 - $50 | $150 | $200 | YES |
| **Flame Sensor** | $10 - $30 | $125 | $150 | YES |
| **Blower Motor** | $150 - $400 | $300 | $500+ | MAYBE (If unit <10 yrs) |
| **Control Board** | $200 - $600 | $250 | $600+ | MAYBE |
| **Heat Exchanger** | $600 - $1,500 | $1,000+ | $2,000+ | NO (Replace Unit) |
| **New 96% Furnace** | $2,000 | $3,500 | $5,500 | - |

#### 11. FAQ Section
**Q: Can I bypass the Limit Switch to get heat for one night?**
A: **ABSOLUTELY NOT.** The limit switch is a firewall against cracked heat exchangers and house fires. If it trips, it's saving your life. Find the cause (airflow) instead.

**Q: My pilot light is yellow. Is that okay?**
A: **No.** A healthy gas flame should be crisp blue. Yellow indicates "incomplete combustion," meaning it is producing high levels of **Carbon Monoxide** and soot. Call a tech immediately.

**Q: How often should I chance my filter?**
A: **Every 90 days** for standard 1-inch filters. If you have pets, every 60 days. If you have a 4-inch "Media Filter," every 6-12 months.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Boiler pressure gauge sitting at zero? No hot water? Before you call an engineer out for £120, learn how to use the "Filling Loop." This is the UK homeowner's guide to Combi Boiler pressure.** For regional safety protocols, see our [Carbon Monoxide UK Guide](/blog/carbon-monoxide-gb).

---

#### 1. The 1.5 Bar Standard
A modern UK Combi Boiler (Worcester Bosch, Vaillant, Baxi, Ideal) is a sealed system. It needs pressure to push water around your radiators.
*   **The Sweet Spot:** When cold, the needle should be between **1.0 and 1.5 bar** (the green zone).
*   **The Danger Zone:** If it drops below 0.5 bar, the boiler's safety switch prevents it from firing (to save the pump running dry).
*   ** The Fix:** You need to add water manually using the "Filling Loop."

#### 2. How to Repressurise (The Filling Loop Guide)
Look underneath your boiler. You will see pipes.
1.  **Identify the Loop:** It is usually a silver, flexible braided hose connecting two pipes. It has small black or blue tap handles on one or both ends.
2.  **Open the Taps:** Turn the tap(s) slowly. You should hear a flow of water (hissing).
3.  **Watch the Gauge:** Keep looking at the pressure gauge. It will rise slowly.
4.  **Stop:** When it hits **1.5 bar**, turn the taps off firmly.
5.  **Disconnect:** By law (Water Regulations), the loop should be disconnected when not in use to prevent back-flow of dirty heating water into mains drinking water.

#### 3. Why Did It Drop? (Diagnostics)
Pressurised systems shouldn't lose water. If you have to top it up every week, you have a problem.
*   **Weeping Radiator Valves:** Check the carpet under your TRVs (Thermostatic Valves). Is it damp? A tiny weep evaporates before you see a puddle, but drops pressure over a week.
*   **The PRV (Pressure Relief Valve):** Go outside. Look for the small 15mm copper pipe coming out of the wall near the boiler. Is it dripping? If so, your **Expansion Vessel** has failed.

#### 4. Historical Context: North Sea Gas & The Combi Revolution
In the 1960s, the UK relied on "Town Gas" (made from coal). It was dirty and poisonous. The discovery of natural gas in the North Sea prompted a massive national conversion program—every burner in Britain had to be changed. Then, in 2005, the government changed building regulations to mandate **Condensing Boilers** (A-Rated). This killed off the old "Back Boiler" (behind the fireplace) and the "Immersion Heater" tank, leading to the dominance of the Combi Boiler in 80% of UK homes today. For gas work regulations, see the [Gas Safe Register](https://www.gassaferegister.co.uk/).

#### 5. Technical Deep Dive: The Condensate Pipe Freeze
In strict UK winters, thousands of boilers stop working.
*   **The Cause:** The white plastic pipe that carries acidic water from the boiler to the drain is exposed to the cold outside. It freezes solid.
*   **The Sensor:** The boiler detects the blockage and shuts down with an error code (e.g., EA on Worcester).
*   **The Fix:** Pour warm (not boiling) water over the external pipe to melt the ice plug. Lag (insulate) it for the future. For more on winter risks, see our [Frozen Condensate Guide](/blog/frozen-condensate-pipe-fix-gb).

#### 6. The 12-Month UK Boiler Maintenance Calendar
*   **Jan:** Check the Condensate Pipe insulation.
*   **Feb:** Bleed radiators (top floors first). Re-pressurise after bleeding.
*   **Mar:** Test the TRVs. Twist them from 0 to 5 to make sure the pin isn't stuck.
*   **Apr:** Switch the heating off, but verify the "Summer Mode" (Hot Water only).
*   **May:** Book your annual service (It's cheaper in summer).
*   **Jun:** Check the programmer clock (Did it change with Daylight Savings?).
*   **Jul:** Run the heating for 10 mins to spin the pump. Pumps seize if left off for 6 months.
*   **Aug:** Visual check of the flue terminal outside.
*   **Sep:** Turn heating on *before* the first frost to test it.
*   **Oct:** Inspect carbon monoxide alarm dates.
*   **Nov:** Listen for "Kettling" (banging noises) in the boiler—sign of limescale scale.
*   **Dec:** Explain the "Filling Loop" location to visiting guests/family.

#### 7. Glossary of UK Heating Terms
1.  **Combi:** Combination boiler (No hot water cylinder).
2.  **System Boiler:** Sealed system but *with* a cylinder.
3.  **Open Vent:** Old system with a small "Feed & Expansion" tank in the loft.
4.  **Filling Loop:** The hose to add water.
5.  **PRV:** Pressure Relief Valve (Safety blow-off).
6.  **TRV:** Thermostatic Radiator Valve (The numbers 1-5 on the rad).
7.  **Lockshield:** The small valve on the other side of the rad (used for balancing).
8.  **Flue:** The chimney.
9.  **Condensate:** The acidic waste water.
10. **Expansion Vessel:** The red internal tank that absorbs expansion.
11. **Heat Exchanger:** The core component.
12. **MagnaClean:** A magnetic filter fitted to pipes to catch sludge.
13. **Inhibitor:** Chemical added to water to stop rust.
14. **Bar:** Metric unit of pressure.
15. **Flow & Return:** The two main pipes (Hot out, cooler back).

#### 9. Case Study: The "Sludged Up" System in Leeds
*   **The Scenario:** A homeowner replaced their old boiler with a new Worcester Bosch but didn't flush the radiators.
*   **The Failure:** Within 6 months, the new boiler's "Plate Heat Exchanger" blocked up with black magnetite sludge (rust) from the old radiators.
*   **The Repair:** The manufacturer voided the 10-year warranty because the system water was dirty (Benchmark Scheme failure).
*   **The Cost:** £450 for a "Power Flush" and £200 for a new heat exchanger.
*   **The Lesson:** Always fit a **MagnaClean** filter and add Inhibitor when changing a boiler.

#### 10. UK Boiler Repair Cost Guide (2025)
| Part | Material Cost | Labour (Inc VAT) | Total | Worth It? |
| :--- | :--- | :--- | :--- | :--- |
| **Thermocouple** | £15 | £80 | £95 | YES |
| **Fan** | £150 | £100 | £250 | YES |
| **PCB (Computer)** | £200 - £300 | £100 | £350 | MAYBE (If <7 years old) |
| **Gas Valve** | £150 | £120 | £270 | YES |
| **Heat Exchanger** | £400+ | £300 | £700+ | NO (Buy New Boiler) |
| **New Combi Install**| £1,200 | £1,000 | £2,200 | - |

#### 11. FAQ Section
**Q: I topped it up to 1.5 bar, but when the heating is on, it goes to 2.5 bar. Is that bad?**
A: **No, that is normal.** Water expands when heated. The pressure will rise as the radiators get hot and fall back to 1.5 when they cool down. If it goes over 3.0 bar, the PRV will open.

**Q: Can I bleed a radiator when the heating is ON?**
A: **Avoid it.** The pump might suck air *into* the system. Turn the heating off and let it cool down before bleeding.

**Q: What is a "Power Flush"?**
A: A high-velocity cleaning process where a large pump is connected to your system to force chemicals through the radiators, dislodging sludge. It is essential for older systems.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 4 Insertion (Boiler/Furnace) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'furnace-blowing-cold-air-limit-switch-us',
            title: "Furnace Blowing Cold Air? The US Homeowner's Guide to Low Pressure & Limit Switches",
            content: us_content,
            excerpt: "Furnace running but no heat? Diagnosis guide for High Limit Switches, dirty filters, and troubleshooting forced air systems. Plus, Boiler PSI checks.",
            cover_image: "/blog/boiler/pressure-gauge.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'boiler-pressure-dropping-filling-loop-gb',
            title: "Boiler Pressure Dropping? The UK Guide to Filling Loops & Repressurising",
            content: gb_content,
            excerpt: "Combi boiler losing pressure? How to use the Filling Loop, checking for 'weeping' radiators, and understanding the 1.5 Bar rule.",
            cover_image: "/blog/boiler/filling-loop.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 4 (Boiler/Furnace) Complete ---');
}

insertRegionalBatch();
