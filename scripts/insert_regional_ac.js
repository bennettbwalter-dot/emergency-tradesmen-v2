import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const us_content = `**Air conditioner running but not cooling? It’s likely a bad Run Capacitor or a dirty condenser coil. Here is the US homeowner's guide to checking your refrigerant lines, understanding SEER2 ratings, and knowing when to call a pro.** For more on seasonal HVAC risks, see our [Spring Thaw Prevention](/blog/spring-thaw-pipe-burst-prevention) guide.

---

#### 1. The #1 Cause: The Run Capacitor
If your outside unit handles the heat but the fan isn't spinning (or is humming), you likely have a bad capacitor.
*   **The Part:** It looks like a silver Red Bull can. It stores a high-voltage charge to "kick start" the compressor and the fan motor. It is the most common point of failure in American HVAC systems.
*   **The Symptom:** The top of the can is bulged (like frozen soda). Or, the unit hums for 30 seconds and then shuts off (thermal overload).
*   **The Fix:** A $20 part on Amazon.
    *   **WARNING:** Capacitors store 370-440 volts even when power is off.
    *   **Safety:** You MUST discharge it by crossing the terminals with an insulated screwdriver before touching it. If you are unsure, do not touch it.

#### 2. Dirty Condenser Coils
Your AC doesn't "add cold air." It removes heat.
*   **The Mechanism:** The outside unit (Condenser) dumps the heat from your house into the outside air. It works like a car radiator.
*   **The Problem:** If the aluminum fins are clogged with cottonwood, grass clippings, dog fur, or dirt, the heat cannot escape. The compressor overheats and trips the "Thermal Overload" switch.
*   **The Fix:** Turn off the power at the disconnect box. Spray the coils gently with a garden hose (not a pressure washer, which bends the fins) from the *inside out* to push the dirt away. Use a specialized "Coil Cleaner" foam if it's greasy. For more on general HVAC care, refer to [EPA Indoor Air Quality](https://www.epa.gov/indoor-air-quality-iaq) standards.

#### 3. Low Refrigerant (Freon/Puron)
*   **The Myth:** "It just needs a top-up."
*   **The Truth:** AC is a sealed system. Refrigerant doesn't get used up like gas in a car. If you are low, you have a leak. Period.
*   **The Sign:** Ice building up on the copper line (suction line) entering the outside unit.
    *   **Why Ice?** As pressure drops, temperature drops. The coil gets colder than freezing, turning the humidity in the air into a block of ice.
    *   **The Damage:** If liquid refrigerant gets back to the compressor (slugging), it will destroy the valves.

#### 4. Case Study: The "Frozen Coil" in Phoenix, AZ
*   **The Scenario:** It was 110°F in July. The homeowner called saying "The air is blowing warm, and there is water leaking in the garage."
*   **The Diagnostics:** The technician found a solid block of ice encasing the indoor evaporator coil. The airflow was zero.
*   **The Cause:** The homeowner hadn't changed the air filter in 6 months. It was completely clogged with pet dander.
*   **The Physics:** No airflow over the coil = coil temperature drops below freezing = humidity turns to ice. The ice blocked the air further, compounding the loop.
*   **The Cost:** $150 service call for a $5 filter.

#### 5. The "Ductwork" Factor (The Invisible Thief)
You can have a brand new 16 SEER unit, but if your ducts leak, you are cooling the attic.
*   **Return Leaks:** If your return duct (sucking air) has a hole in the hot attic, it sucks in 140°F air and tries to cool it. This kills efficiency.
*   **Supply Leaks:** If your supply duct (blowing air) has a hole, you are paying to air condition the squirrels in the attic.
*   **The Test:** Turn the fan to "On." Go into the attic (early morning). Feel for cool breezes. Look for black streaks on insulation (dust being sucked in).

#### 6. Smart Thermostats & The "C-Wire"
Thinking of installing a Nest or Ecobee to save money?
*   **The Issue:** Old thermostats didn't need power (they used batteries). Smart stats need 24V constant power.
*   **The C-Wire:** This is the "Common" wire (Blue). If your cable bundle only has 4 wires (R, W, Y, G), you don't have a C-wire.
*   **The Symptom:** The Nest will try to "power steal" from the AC unit, causing the outside contactor to chatter (click-click-click) and burn out.
*   **The Fix:** Use the "Add-a-Wire" kit included in the box, or pull a new 5-wire cable.

#### 7. Cost Breakdown: AC Repair (2025 Estimates)
| Component | Part Cost | Labor Cost | Total | Worth It? |
| :--- | :--- | :--- | :--- | :--- |
| **Run Capacitor** | $20 - $50 | $150 | $170 - $200 | YES |
| **Contactor (Relay)** | $30 - $60 | $150 | $180 - $210 | YES |
| **Hard Start Kit** | $50 | $200 | $250 | YES |
| **Refrigerant Search**| - | $200 - $400 | $200 - $400 | MAYBE |
| **R-410A Refill** | $100/lb | - | $100 - $800 | NO (If leak not fixed) |
| **Blower Motor** | $200 - $400 | $300 | $500 - $700 | YES |
| **New 3-Ton Unit** | $3,000 | $2,000 | $5,000+ | - |

#### 8. The 12-Month HVAC Maintenance Calendar
*   **Jan:** Check Furnace Filter (Replace if grey).
*   **Feb:** Inspect Thermostat batteries (Alkaline leaks destroy boards).
*   **Mar:** Clear debris from around the outside Condenser unit (2ft clearance).
*   **California:** Look for a C-20 HVAC license on the [CSLB](https://www.cslb.ca.gov/).
first heatwave). Listen for "Hard Starting."
*   **May:** Wash Condenser Coils (Garden Hose). Check disconnecting box for wasp nests.
*   **Jun:** Check Condensate Drain line. Pour 1 cup of vinegar to kill algae.
*   **Jul:** Check Filter again (Pollen season).
*   **Aug:** Listen for unusual fan noises (screeching = bearings).
*   **Sep:** Check insulation on refrigerant lines (The black foam). UV eats it.
*   **Oct:** Switch to Heating mode test.
*   **Nov:** Cover AC unit? (Optional - only the top to stop leaves. Never wrap the sides).
*   **Dec:** Schedule professional tune-up ($99 special).

#### 9. Glossary of US HVAC Terms
1.  **AFUE:** Efficiency rating for furnaces.
2.  **BTU:** British Thermal Unit (Amount of heat).
3.  **Capacitor:** Electrical storage "battery" for starting motors.
4.  **Compressor:** The heart of the system (Pumps gas).
5.  **Condensate Pump:** Removes water from the system if gravity drain isn't possible.
6.  **Contactor:** The high-voltage switch that turns the unit on.
7.  **Evaporator Coil:** The indoor A-frame coil that gets cold.
8.  **Freon:** Old R-22 refrigerant (Banned).
9.  **Puron:** Modern R-410A refrigerant.
10. **SEER2:** Seasonal Energy Efficiency Ratio (New 2023 Standard, see [DOE Energy Star](https://www.energystar.gov/)).
11. **Split System:** Indoor + Outdoor unit combo (Standard US Home).
12. **Ton:** Cooling capacity (1 Ton = 12,000 BTUs/hr).

#### 10. FAQ Section
**Q: Why is there water pooling around my furnace?**
A: **Clogged Drain.** The AC pulls gallons of water (humidity) out of the air. It drains via a white PVC pipe. If algae blocks that pipe, it overflows. Pour a cup of bleach or vinegar down the "Cleanout Tee" every spring.

**Q: Can I replace R-22 Freon with R-410A?**
A: **No.** They operate at different pressures and use different oils (Mineral vs. Synthetic). If your R-22 system leaks, you usually have to replace the whole unit. R-22 is now gold dust ($200/lb) because it is no longer manufactured.

**Q: Should I set the fan to "On" or "Auto"?**
A: **Auto.** Setting it to "On" keeps the fan running even when the compressor is off. This pushes the humidity sticking to the coil back into the house, increasing indoor humidity. Only use "On" if you are actively filtering dust (e.g., while vacuuming).
`;

// ------------------------------------------------------------------
// UK CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const gb_content = `**Daekin or Mitsubishi unit blowing lukewarm air? Understanding "Defrost Mode," F-Gas regulations, and why you can't just "top up the gas" yourself. A guide to UK Mini-Splits.** For more on winter heating issues, see our [Frozen Condensate Pipe Fix](/blog/frozen-condensate-pipe-fix-gb).

---

#### 1. The UK Context: Mini-Splits & F-Gas
In the UK, domestic AC is usually "Air-to-Air Heat Pumps" (Mini-Splits).
*   **The Law (F-Gas):** It is a criminal offense to work on AC refrigerant circuits without specific F-Gas qualifications (see [HSE Gas Safety](https://www.hse.gov.uk/gas/domestic/)).
*   **Restriction:** You cannot buy R32 or R410A gas on Amazon. It is a controlled substance due to Global Warming Potential (GWP). R32 is mildly flammable.
*   **DIY Limit:** You can clean filters and wash coils. You cannot touch the copper pipes or valves.

#### 2. User Error: The "Sun" vs. "Snowflake"
Inverters heat AND cool.
*   **Common Callout:** "My AC is blowing hot air."
*   **The Cause:** The remote is set to "Heat" (Sun Icon).
*   **The Fix:** Set it to "Cool" (Snowflake) and lower the temp to 18°C. Wait 5 minutes. The system has a "changeover delay" to protect the compressor from jamming.
*   **Fan Speed:** Ensure the fan is not on "Auto" if you are testing. Set it to High.

#### 3. The Filters (DIY Maintenance)
Mini-splits have fine mesh filters under the front plastic cover.
*   **The Issue:** If these get clogged with dust, efficiency drops by 30% and the unit may freeze up.
*   **The Fix:**
    1.  Lift the front panel (it clicks).
    2.  Pull the mesh filters out.
    3.  Wash them in the sink with warm soapy water (Fairy Liquid).
    4.  Let them dry completely.
    5.  Replace them. Do this every 3 months.

#### 4. Case Study: The "Leaking Unit" in London
*   **The Scenario:** A tenant reported water dripping down the bedroom wall from the AC unit.
*   **The Diagnosis:** The "Condensate Pump" (Little Orange) had failed.
*   **Context:** Unlike gravity drains, many wall units need a tiny pump to push the water up into the ceiling void to drain away. These pumps vibrate, are noisy, and get stuck with "bio-slime."
*   **The Fix:** Replaced the pump (£120) and sanitized the tray with anti-bacterial tablets.
*   **Lesson:** If you have a pump, put "Condensate Tablets" in the tray once a year.

#### 5. Planning Permission: The Outdoor Unit
Thinking of installing AC?
*   **Permitted Development:** Usually allowed IF:
    *   The unit is >1 meter from the boundary.
    *   It is not on a listed building.
    *   It is not on a pitched roof.
    *   Noise is <42dB at the neighbor's window.
*   **The Trap:** In London terraced housing, it is almost impossible to be 1m from the boundary. You technically need planning permission. Most people ignore this, but if a neighbor complains about the noise, the council can make you remove it.

#### 6. Portable AC vs. Split Systems
Is it worth spending £1,500 on a split?
*   **Portable Units:**
    *   **Pros:** Cheap (£300), plug and play.
    *   **Cons:** Extremely loud (65dB). Inefficient (Negative pressure sucks warm air into the room from the hallway). You have to hang a hose out the window.
*   **Split Systems:**
    *   **Pros:** Silent (19dB). Highly efficient (COP 4.0 - 4kw of cooling for 1kw of electricity). Heats in winter.
    *   **Cons:** Expensive install. Ugly outdoor box.

#### 7. UK Repair Costs (2025)
| Service | Parts Cost | Labour Cost | Total |
| :--- | :--- | :--- | :--- |
| **Annual Service** | £10 (Cleaner) | £120 | £130 |
| **Leak Test (Nitrogen)** | - | £250 | £250 |
| **Re-gas (R32)** | £40/kg | £150 | £190+ |
| **Capacitor** | £30 | £120 | £150 |
| **New PCB (Inverter)** | £300 | £150 | £450 |
| **Condensate Pump** | £80 | £120 | £200 |
| **Deep Clean (Bagging)**| £20 | £150 | £170 |

#### 8. The 12-Month UK Heat Pump Calendar
*   **Jan:** Check outdoor unit is clear of snow/leaves (Airflow).
*   **Feb:** Monitor energy usage (Is COP dropping?).
*   **Mar:** Clean indoor mesh filters.
*   **Apr:** Switch to "Cooling Mode" test.
*   **May:** Sanitize indoor coil (Spray foam cleaner).
*   **Jun:** Listen for vibration (Fan balance).
*   **Jul:** Check vertical swing louvres move freely.
*   **Aug:** Clean outdoor coil (Garden sprayer).
*   **Sep:** Check remote batteries.
*   **Oct:** Switch to "Heating Mode" test.
*   **Nov:** Check pipe insulation (lagging) outside.
*   **Dec:** Book F-Gas certified service.

#### 9. Glossary of UK AC Terms
1.  **Air-to-Air:** Standard AC (heats and cools air).
2.  **Air-to-Water:** Heat pump for radiators (different system).
3.  **COP:** Coefficient of Performance (Efficiency > 3.0 is good).
4.  **F-Gas:** Fluorinated Gas (Refrigerant).
5.  **Inverter:** Variable speed compressor (Saves energy, doesn't stop/start).
6.  **Kw:** Kilowatt cooling capacity (3.5kw = Typical room).
7.  **Mini-Split:** One outdoor unit, one indoor unit.
8.  **Multi-Split:** One outdoor unit, multiple indoor units.
9.  **R32:** The modern, eco-friendly refrigerant.
10. **Refcom:** The body that registers AC engineers.
11. **VRV/VRF:** Large commercial systems.

#### 10. FAQ Section
**Q: Why is my outside unit steaming in winter?**
A: **Defrost Mode.** When heating, the outside unit gets very cold and ice forms on it. The unit reverses the cycle for 5 minutes to melt the ice (creating steam) and drain it away. This is normal. Do not turn it off.

**Q: Can I install it myself?**
A: **No.** You can physically mount the unit, but you legally need an F-Gas engineer to connect the pipes ("flare") and release the gas. DIY kits with "Quick Connectors" exist but are prone to leaking and often void the warranty.

**Q: My unit smells like old socks. Why?**
A: **Dirty Coil.** Mold and bacteria grow on the wet evaporator coil. You need a "Deep Clean" where the engineer puts a "catch bag" around the unit and jet washes the inside coil with chemical cleaner.
`;

async function insertRegionalBatch() {
    console.log(`--- Starting Batch 6 Insertion (AC / Heat Pump) ---`);

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'ac-blowing-warm-air-capacitor-leak-us',
            title: "AC Blowing Warm Air? The US Homeowner's Guide to Capacitor Failure & Freon Leaks",
            content: us_content,
            excerpt: "Air conditioner running but not cooling? It's likely a bad Run Capacitor or a dirty condenser coil. How to check your refrigerant lines and when to call a pro.",
            cover_image: "/blog/hvac/ac-capacitor.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'ac-heat-pump-not-cooling-troubleshooting-gb',
            title: "Heat Pump / AC Not Cooling? The UK Guide to F-Gas & Inverter Faults",
            content: gb_content,
            excerpt: "Daekin or Mitsubishi unit blowing lukewarm air? Understanding 'Defrost Mode,' F-Gas regulations, and why you can't just 'top up the gas' yourself.",
            cover_image: "/blog/hvac/mini-split.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log(`--- Batch 6 (AC / Heat Pump) Complete ---`);
}

insertRegionalBatch();
