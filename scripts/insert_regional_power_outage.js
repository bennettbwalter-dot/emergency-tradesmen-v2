import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**You’re sitting on the couch, and suddenly—silence. The fridge stops humming, the TV goes black, and the Wi-Fi dies. In 2025, a power outage isn't just an inconvenience; it's a disruption to your security system, your medical devices, and your ability to work.**

---

#### 1. The Immediate Diagnosis: Is It Just You?
Before you call the power company, you must determine the scope of the outage.
*   **The "Neighbor Check":** Look out the window. If the streetlights are off and the houses across the street are dark, this is a **Grid Event**.
*   **The "Breaker Check":** If your neighbors have lights but you don't, the problem is likely in your **Service Entrance**.
*   **The Smart Meter Check:** Go outside to your meter can. If the digital display is blank, power is not reaching your house (Utility side). If the display is on and showing numbers, power is reaching the meter but not getting into your home (Main Breaker issue).

#### 2. The Main Breaker: Your First Line of Defense
Your **Main Breaker** (usually 100A or 200A) is the master switch for your home. It can trip due to a massive surge or a "Short Circuit" in the main feeder cables.
*   **How to Reset:** A tripped main breaker will be in the center "Trip" position (not fully On or Off). You must push it firmly to the **OFF** position (you will hear a giant *CLUNK*), wait 5 seconds, and then push it to **ON**.
*   **Warning:** If it trips again instantly with a loud *BANG* or flash, **DO NOT RESET IT AGAIN**. You have a "Dead Short" in your panel bussing. Call an emergency electrician immediately. Resetting it repeatedly can cause an arc flash explosion.

#### 3. Generator Safety: The "Suicide Cord"
In the US, the #1 cause of death during power outages isn't the cold—it's Carbon Monoxide (CO) poisoning and electrocution from improper generator use.
*   **The "Suicide Cord":** Never, ever plug a portable generator into a dryer outlet using a male-to-male cord. This "backfeeds" 240V electricity out of your house and up the utility pole. It can kill the lineman trying to fix your power. It is illegal in all 50 states.
*   **The Solution:** You must use a **Transfer Switch** or an **Interlock Kit** installed by a licensed electrician. This physically prevents the main breaker from being ON while the generator is running.
*   **CO Risk:** Never run a generator in an attached garage, even with the door open. The exhaust contains CO, which is odorless and deadly. It must be 20 feet away from the house.

#### 4. Section: The 2003 Northeast Blackout (Historical Context)
On August 14, 2003, a software bug in FirstEnergy's control room in Ohio triggered a cascade failure that left 55 million people without power across the US and Canada. It taught us that the US grid is a single, interconnected machine. In 2025, the risk is different: **PSPS (Public Safety Power Shutoffs)**. In states like California, utilities cut power preemptively during high wind events to prevent wildfires. This means outages are now *planned* events, requiring homeowners to have battery backup (like Tesla Powerwall) or standby generators.

#### 5. Appendix A: 50-Item Master US Electrical Grid Glossary
1.  **Grid:** The interconnected power network.
2.  **Substation:** Steps high voltage down to distribution voltage.
3.  **Transformer:** The "can" on the pole dropping 7200V to 240V.
4.  **Service Drop:** Wires from the pole to your house.
5.  **Service Lateral:** Underground wires.
6.  **Weatherhead:** The hood where wires enter the conduit.
7.  **Meter Can:** The box holding the utility meter.
8.  **Main Lug:** The connection point in your panel.
9.  **Busbar:** The copper rail carrying power.
10. **Neutral:** The return path wire (White).
11. **Ground:** The safety wire (Green/Bare).
12. **Bonding:** Connecting metal pipes to ground.
13. **Surge:** A voltage spike (>120V).
14. **Brownout:** A voltage drop (<110V).
15. **Rolling Blackout:** Intentional load shedding.
16. **PSPS:** Public Safety Power Shutoff.
17. **Load Side:** Your house's side of the meter.
18. **Line Side:** The utility's side of the meter.
19. **Single Phase:** Standard residential power.
20. **Three Phase:** Commercial power.
21. **Ampacity:** Current carrying capacity of a wire.
22. **Inverter:** Converts DC (Battery) to AC (House).
23. **Transfer Switch:** Safely swaps grid for generator.
24. **Interlock Kit:** Mechanical breaker guard.
25. **Backfeed:** Illegal reverse power flow.
26. **Suicide Cord:** Male-to-male extension cord.
27. **Fuel Stabilizer:** Additive for stored gas.
28. **Propane:** LPG fuel for generators.
29. **Diesel:** Fuel for large standby gen-sets.
30. **THHN:** Standard individual wire type.
31. **Romex:** Standard cable type.
32. **Conduit:** Pipe for wires (EMT/PVC).
33. **Easement:** Utility's right to access your yard.
34. **Right of Way:** Land under power lines.
35. **Vegetation Management:** Tree trimming by utility.
36. **Fault Current:** Massive energy released in a short.
37. **Arc Flash:** Explosive release of energy.
38. **Circuit Breaker:** Overload protection device.
39. **Fuse:** One-time protection device.
40. **Multimeter:** Tool to measure voltage.
41. **Non-Contact Tester:** "Tic tracer" pen.
42. **GFCI:** Ground fault protector.
43. **AFCI:** Arc fault protector.
44. **Spark Arrestor:** Muffler screen on a generator.
45. **Load Shedding:** Turning off heavy appliances.
46. **Wattage:** Power measurement.
47. **Kilowatt-hour (kWh):** Billing unit.
48. **Peak Hours:** Expensive time to use power.
49. **Time of Use (TOU):** Rate plan.
50. **Smart Grid:** Digital monitoring of power lines.

#### 6. Section: Food Safety (The 4-Hour Rule)
According to the USDA, a refrigerator will keep food safe for **4 hours** during a power outage *if you keep the door closed*. A full freezer will hold visual temperature for **48 hours**; a half-full freezer for **24 hours**.
*   **The Test:** If you have digital thermometers, check them when power returns. If food is above 40°F for more than 2 hours, discard it. "When in doubt, throw it out." Measuring the cost of a gallon of milk vs a trip to the ER for Salmonella—the choice is clear.

#### 7. 20-Step US Emergency Power Restoration Checklist
1.  **Check Diagnosis:** Verify it's a grid outage.
2.  **Report IT:** Call the utility (automated system).
3.  **Unplug Sensitive Electronics:** Surges happen when power *returns*.
4.  **Turn Off AC/Heat Pump:** Prevent "Hard Start" strain.
5.  **Keep Fridge Closed:** Tape the door shut if needed.
6.  **Generator Check:** Inspect oil and fuel before starting.
7.  **Connect Generator:** Outdoors, 20ft away.
8.  **Power Essentials:** Fridge, Internet, minimal lights.
9.  **Monitor Carbon Monoxide:** Ensure detectors have battery backup.
10. **Water Preservation:** If on a well pump, fill bathtub for flushing.
11. ** conserve Heat/Cooling:** Close blinds and doors.
12. **Family Safety:** Locate flashlights (no candles).
13. **Update Info:** Check utility app for disruption maps.
14. **Disconnect Garage Door:** Use red emergency release cord.
15. **Food Audit:** Check temps at 4-hour mark.
16. **Restoration Signal:** Watch for streetlights returning.
17. **Wait 10 Minutes:** Let grid stabilize before reconnecting house.
18. **Turn Breakers On:** One by one, not all at once.
19. **Reset Clocks/Timers:** Oven, microwave, irrigation.
20. **Restock:** Buy fresh gas and batteries for next time.

#### 8. FAQ Section (Infinite Depth)
**Q: Can I use a gas stove to heat my house?**
A: **No.** This is a primary cause of CO poisoning. Gas ovens are not vented for continuous 24-hour use like a furnace. The buildup of CO can be lethal. Wear layers of clothing instead.

**Q: My neighbor produces solar power. Does their power work during an outage?**
A: **Surprisingly, No.** Most standard "Grid-Tied" solar systems shut down automatically when the grid goes down. This is an "Anti-Islanding" safety feature to prevent backfeeding power to the lines. Unless they have a specific "Battery Backup" or "Sunlight Backup" inverter (like Enphase IQ8), their panels are dead weight during an outage.

**Q: Why does my UPS beep?**
A: An Uninterruptible Power Supply (UPS) beeps to warn you it is on battery. It is designed to give you 5 minutes to save your work and shut down your PC—not to run your gaming rig for 3 hours. Silence the alarm and shut down the device to preserve the battery for charging phones.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**The lights flicker and die. The hum of the fridge stops. In the UK, a power cut can be a simple fuse trip or a national grid failure. Do you know which one it is?**

---

#### 1. The Immediate Diagnosis: 105 or Trip Switch?
Before you assume it's a power cut, check your **Consumer Unit** (Fuse Box).
*   **Trip Switch Down:** If an RCD or MCB is in the OFF (down) position, the fault is in your house. It was likely caused by a blown bulb or a faulty kettle.
*   **All Switches UP:** If all your breakers are ON but you have no power, check the street.
*   **Verify:** Look at your **Smart Meter In-Home Display (IHD)**. If it is blank or red, power is not coming into the house.

#### 2. Dial 105: The National Power Cut Number
In the UK, many people mistakenly try to call their billing supplier (British Gas, Octopus, E.ON) when the power goes out. **They cannot help you.** They only send the bill.
*   **Who to Call:** You need your **Distribution Network Operator (DNO)**. These are the companies that own the cables, poles, and substations (e.g., UK Power Networks, Western Power, Northern Powergrid).
*   **The Magic Number:** Dial **105** from any mobile or landline. It is free and will automatically route you to the DNO for your region. They can tell you if it is a known HV (High Voltage) fault or a local LV (Low Voltage) issue.

#### 3. The "Cut-Out Fuse" Risk (Do Not Touch)
Between your electricity meter and the street cable is a black or grey fuse holder called the **Service Head** or **Cut-Out**. Inside is a massive 60A, 80A, or 100A fuse.
*   **The Danger:** If this fuse blows, you will have zero power, even if your neighbors are fine. This often happens if you install an EV Charger or Electric Shower without upgrading the supply.
*   **The Law:** It is illegal for a homeowner or even a standard electrician to break the seals and pull this fuse. Only the DNO can replace it. If you suspect it has blown (often it feels hot to the touch or smells of fish), call 105 immediately.

#### 4. Section: The "Three-Day Week" (Historical Context)
In 1974, the UK government invoked the "Three-Day Week" to conserve electricity during coal miner strikes. Commercial users were limited to 3 consecutive days of consumption. This historic event shaped the UK's appreciation for grid reliability. Today, the threat is different: **"Peak Demand Management"**. With the closure of coal plants and reliance on wind, the National Grid ESO (Electricity System Operator) sometimes uses "Demand Flexibility Services" to pay households to USE LESS power during peak winter evenings (5pm-7pm).

#### 5. Section: Priority Services Register
If you are elderly, disabled, or rely on electrically powered medical equipment (dialysis, oxygen), you MUST register for the **Priority Services Register**. This is a free listing that ensures the DNO knows you are vulnerable. In a prolonged outage, they can provide emergency heating, hot meals, or unannounced welfare checks.

#### 6. Appendix A: 50-Item Master UK Electrical Grid Glossary
1.  **National Grid:** The high-voltage transmission network.
2.  **DNO:** Distribution Network Operator (local grid).
3.  **Supplier:** The billing company (e.g., Octopus).
4.  **MPAN:** Supply number (on your bill).
5.  **Cut-Out Fuse:** Main service fuse (100A).
6.  **Service Head:** The box holding the main fuse.
7.  **Isolator:** Switch to separate meter from fuse box.
8.  **Meter Tails:** Thick cables from meter to board.
9.  **Smart Meter:** Digital meter sending readings.
10. **IHD:** In-Home Display (the little screen).
11. **Economy 7:** Cheaper night-time rate.
12. **Standing Charge:** Daily fixed cost.
13. **Pre-payment:** Pay-as-you-go meter.
14. **Emergency Credit:** £5-£10 buffer on pre-pay.
15. **Consumer Unit:** Fuse box.
16. **RCD:** Residual Current Device (Life saver).
17. **MCB:** Miniature Circuit Breaker.
18. **RCBO:** Combined RCD and MCB.
19. **Main Switch:** Master off switch.
20. **Ring Main:** Socket circuit topology.
21. **Radial:** Lighting or cooker circuit.
22. **Substation:** Local transformer (buzzer box).
23. **Feeder Pillar:** Green street cabinet.
24. **Phase:** One of three power lines.
25. **Three Phase:** Industrial 400V power.
26. **Single Phase:** Domestic 230V power.
27. **Brownout:** Voltage dip (lights dim).
28. **Surge:** Voltage spike.
29. **Spike:** Sudden transient voltage.
30. **Harmonics:** Dirty power quality.
31. **Load Shedding:** Grid cutting power to save system.
32. **Black Start:** Rebooting the grid after total failure.
33. **Generator:** Petrol/Diesel power backup.
34. **Inverter:** Converts 12V DC to 230V AC.
35. **UPS:** Battery backup for PC.
36. **Earth Rod:** Ground connection for TT systems.
37. **PME:** Protective Multiple Earthing (TN-C-S).
38. **Bonding:** Safety earth to gas/water pipes.
39. **Kettle Lead:** IEC connector.
40. **Fused Spur:** Connection for boiler/alarm.
41. **PAT Testing:** Appliance safety check.
42. **Part P:** Building regulations for electrics.
43. **NICEIC:** Regulatory body.
44. **EICR:** Safety certificate (Tenant check).
45. **Volt Stick:** Non-contact tester.
46. **Multimeter:** Diagnostic tool.
47. **Ampere:** Current unit.
48. **Kilowatt:** Power unit (1000W).
49. **Unit:** 1 kWh of electricity.
50. **Off-Peak:** Cheaper time to run washing machine.

#### 7. Section: Food Safety (The Freezer Strategy)
If the power goes out, **DO NOT OPEN THE FREEZER.** A full freezer acts as a block of ice and can hold its temperature for **24-48 hours**. Every time you open the door to "check" the food, you lose cold air.
*   **The Coin Trick:** Before an outage, freeze a cup of water, then place a penny on top of the ice. If you return and the penny is at the bottom of the cup, the ice melted and refroze. Your food is unsafe.

#### 8. 20-Step UK Emergency Power Restoration Checklist
1.  **Check Safety:** Smell for burning (electrical fire).
2.  **Verify Outage:** Check streetlights / 105.
3.  **Unplug:** Protect sensitive TV/PC from return surge.
4.  **Heating:** Keep one room warm (close doors).
5.  **Lighting:** Use torches (battery/wind-up). No candles.
6.  **Fridge:** Do not open.
7.  **Water:** If pump assisted, fill bottles now.
8.  **Phone:** Enable "Low Power Mode" to save battery.
9.  **Battery Pack:** Charge phones from laptop if needed.
10. **Radio:** Tune to local BBC radio (battery powered).
11. **Neighbors:** Check on elderly neighbors.
12. **Gate:** Ensure electric gates have manual release key.
13. **Fish Tank:** Wrap in blankets to retain heat.
14. **Food:** Eat perishables first.
15. **Alarm:** House alarm may screech (battery low). Silence it.
16. **Updates:** Check UK Power Networks map on 4G.
17. **Restoration:** Wait 10 mins after power returns.
18. **Reset RCDs:** Flip main switch if it tripped.
19. **Check Boiler:** Reset timer/programmer.
20. **Restock:** Buy batteries and tinned food.

#### 9. FAQ Section (Infinite Depth)
**Q: Can I claim compensation for a power cut?**
A: **Yes.** Under the Guaranteed Standards scheme, if your power is off for more than 12 hours (or 24 hours in some storms), you are entitled to a payment (usually £90+). The DNO usually pays this automatically, but you should claim within 3 months.

**Q: Why do my lights flicker?**
A: This could be a loose neutral in the substation (contact DNO) or a loose connection in your own consumer unit (fire risk - call electrician). If it happens when heavy appliances start, it's just voltage drop. If it happens randomly, get it checked.

**Q: Can I install my own generator?**
A: **Technically yes, but be careful.** A small suitcase generator for camping is fine for plugging in a lamp. But trying to wire it into your house circuits requires a specific "Changeover Switch" installed by a Part P electrician. Backfeeding the grid is illegal and dangerous.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 2 Insertion (Lost Power) ---');

    // 1. Handle US Version (Rename existing 'domestic-electrical-interruption-protocol' -> '...-us')
    console.log('Inserting US Version (and renaming base if needed)...');

    // First, try to find the BASE post
    const { data: baseData } = await supabase.from('posts').select('id').eq('slug', 'domestic-electrical-interruption-protocol').single();

    if (baseData) {
        console.log('Found base post. Updating to US version...');
        const { error: errorUpdateBase } = await supabase
            .from('posts')
            .update({
                content: us_content,
                slug: 'domestic-electrical-interruption-protocol-us', // RENAME
                title: "US Home Power Outage Protocol: Diagnostics, Safety, and Grid Resilience (2025 Edition)",
                excerpt: "Lights out? Learn the difference between a tripped breaker and a grid failure. Critical safety guide for US homeowners on generators and food safety."
            })
            .eq('slug', 'domestic-electrical-interruption-protocol');
        if (errorUpdateBase) console.error('Error renaming base:', errorUpdateBase);
    } else {
        // Base not found, check if US already exists
        console.log('Base post not found. Checking for existing US version...');
        const { error: errorUpdateUS } = await supabase
            .from('posts')
            .update({
                content: us_content,
                title: "US Home Power Outage Protocol: Diagnostics, Safety, and Grid Resilience (2025 Edition)",
                excerpt: "Lights out? Learn the difference between a tripped breaker and a grid failure. Critical safety guide for US homeowners on generators and food safety."
            })
            .eq('slug', 'domestic-electrical-interruption-protocol-us');
        if (errorUpdateUS) console.error('Error updating US:', errorUpdateUS);
    }

    // 2. Handle GB Version (Insert clean new row if not exists)
    console.log('Inserting UK Version...');

    // Check if GB exists
    const { data: gbData } = await supabase.from('posts').select('id').eq('slug', 'domestic-electrical-interruption-protocol-gb').single();

    if (gbData) {
        console.log('GB Version exists. Updating...');
        const { error: errorUpdateGB } = await supabase
            .from('posts')
            .update({
                content: gb_content,
                title: "Domestic Electrical Interruption Protocol: A Comprehensive Analysis of UK Diagnostics, Safety, and Resilience",
                excerpt: "Power cut? Dial 105. Learn how to check your fuse box, protect your food, and navigate UK grid blackouts safely."
            })
            .eq('slug', 'domestic-electrical-interruption-protocol-gb');
        if (errorUpdateGB) console.error('Error updating GB:', errorUpdateGB);
    } else {
        console.log('GB Version missing. Inserting new row...');
        const { error: errorInsertGB } = await supabase
            .from('posts')
            .insert([{
                slug: 'domestic-electrical-interruption-protocol-gb',
                title: "Domestic Electrical Interruption Protocol: A Comprehensive Analysis of UK Diagnostics, Safety, and Resilience",
                content: gb_content,
                excerpt: "Power cut? Dial 105. Learn how to check your fuse box, protect your food, and navigate UK grid blackouts safely.",
                cover_image: "/blog/electrical-protocol-fusebox.png", // Use existing image
                published: true
            }]);
        if (errorInsertGB) console.error('Error inserting GB:', errorInsertGB);
    }

    console.log('--- Batch 2 (Lost Power) Complete ---');
}

insertRegionalBatch();
