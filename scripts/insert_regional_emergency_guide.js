import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const us_content = `**Water pouring through the ceiling? Smell gas? The 3 valves every homeowner MUST label today. A printable checklist for Main Water, Gas, and Breakers to save $10,000.**

---

#### 1. The "Golden Minute" Protocol
In a catastrophic plumbing failure (e.g., a burst washer hose), water flows at 10-15 gallons per minute.
*   **The Math:** In 10 minutes, you have 150 gallons of water in your kitchen. That is 1,200 lbs of liquid weight on your joists.
*   **The Goal:** You need to be able to shut off the water in under 60 seconds.
*   **The Drill:** Walk your family through this drill twice a year. If you aren't home, can your teenager find the valve?

#### 2. Valve 1: The Main Water Shut-Off
This cuts water to the entire house. It is the single most important valve you own.
*   **Location:**
    *   **Basement/Crawl Space:** Look for a pipe coming through the foundation wall on the *street side* of the house.
    *   **Slab Foundation:** Look in the garage (near the water heater) or in a utility closet.
    *   **The Curb:** There is always a meter box near the street sidewalk. You need a "Water Key" ($15 tool at Home Depot) to turn this.
*   **Types:**
    *   **Ball Valve (Good):** A lever handle. Perpendicular = OFF. Parallel = ON.
    *   **Gate Valve (Bad):** A round wheel handle. These often rust and break in the "Open" position. Exercise them once a year (turn right, turn left). If it leaks, replace it with a ball valve.

#### 3. Valve 2: The Gas Meter
If you smell rotten eggs (Mercaptan):
*   **Action:** Evacuate immediately. Call 911. Do not use your phone inside the house.
*   **The Shut-Off:** On the grey meter outside. You need a 12-inch Crescent Wrench (or an Emergency Gas Wrench zip-tied to the meter).
*   **The Turn:** There is a rectangular tab on the pipe. Turn it 90 degrees so the hole in the tab aligns with the hole in the pipe. Padlock it if necessary.
*   **The Rule:** Once you turn gas **OFF**, you are legally forbidden from turning it back on. The Gas Company must do a pressure test first to find the leak.

#### 4. Switch 3: The Main Breaker
If water is touching outlets or appliances, or you smell burning plastic:
*   **Location:** The Grey Metal Panel (Garage, Basement, Laundry).
*   **The Big Switch:** At the very top (or bottom) is a large double-pole switch labeled "100" or "200".
*   **Action:** Flip it firmly to OFF. The whole house will go dark. This prevents electrocution and electrical fires.
*   **Flashlight Rule:** Always keep a working flashlight on top of the breaker box.

#### 5. Case Study: The "Frozen Pipe" Vacation (Chicago)
*   **The Scenario:** A family went to Florida for Christmas week. The Nest thermostat lost wi-fi but they ignored it. Temperatures hit -10°F.
*   **The Event:** A copper pipe in the uninsulated attic froze and burst.
*   **The Damage:** The water ran for 6 days. It collapsed the 2nd-floor ceiling, flooded the 1st floor, and filled the basement 4 feet deep.
*   **The Loss:** $180,000 (Scales to "Total Loss").
*   **The Prevention:** Turn off the Main Water Valve before *any* winter vacation. Open faucets to drain pressure. Set thermostat to 55°F minimum.

#### 6. The "Power Outage" Survival Kit
When the grid goes down for 3 days (Ice Storm):
1.  **Water:** 1 gallon per person per day (Flush toilets with pool water or melted snow).
2.  **Light:** Headlamps are better than flashlights (hands-free). Avoid candles (Fire risk).
3.  **Heat:** Do NOT bring a gas grill or generator inside (Carbon Monoxide Kills). Use sleeping bags and one designated "Warm Room."
4.  **Food:** Non-perishable (Peanut butter, crackers).
5.  **Comms:** Battery-powered AM/FM radio for news. Anker power bank for phones.

#### 7. What to Say to 911 (Keywords)
Dispatchers prioritize calls based on keywords.
*   **Gas Leak:** "I smell gas inside the structure." (High Priority).
*   **Electrical Fire:** "I have smoke coming from an outlet." (High Priority).
*   **Flooding:** "I have active rapid water intrusion." (Low Priority unless wires are involved).
*   **The Lesson:** Be specific. "My basement is wet" sounds like a nuisance. "Water is rising near the furnace" is a hazard.

#### 8. Insurance Claims: First 24 Hours
*   **Mitigation:** You have a duty to "Mitigate Loss." This means you MUST stop the water and start drying. If you let it sit for a week, they can deny the claim.
*   **Evidence:** Take video of the water *gushing* if safe. Photograph damaged items before moving them.
*   **Do Not Throw Away:** Keep the burst pipe section. The adjuster needs to see *why* it failed (Wear and tear vs. freezing).

#### 9. Cost of Ignorance: Shut-Off vs. Emergency Plumber
| Scenario | Action | Cost |
| :--- | :--- | :--- |
| **Burst Pipe (You Shut Off)** | You turn valve in 1 min. Call Plumber next day. | $300 (Repair) + $500 (Drywall) |
| **Burst Pipe (Panic)** | You search for valve for 20 mins. Call Emergency Plumber. | $600 (Emergency) + $15,000 (Flooring/Mold) |
| **Gas Leak (Ignored)** | "I'll check it tomorrow." | House Explosion (Priceless) |
| **Circuit Overload (Ignored)** | "It keeps tripping, I'll tape it ON." | Electrical Fire ($200,000) |

#### 10. Glossary of US Emergency Terms
1.  **Angle Stop:** The small silver valve under the toilet/sink.
2.  **Backflow Preventer:** Valve that stops water going back to street.
3.  **Circuit Breaker:** Safety switch for electricity.
4.  **Cleanout:** White cap in yard to access sewer line.
5.  **Curb Key:** Long metal tool to turn street water off.
6.  **Gate Valve:** Wheel handle (prone to failure).
7.  **GFCI:** Outlet that trips instantly when wet (Bath/Kitchen).
8.  **Main:** The primary supply line.
9.  **Mercaptan:** The chemical added to Natural Gas to make it smell.
10. **PRV:** Pressure Reducing Valve (Protects pipes from municipal spikes).

#### 11. FAQ Section
**Q: My main valve is stuck. Should I force it?**
A: **NO.** If you break the handle off, it is stuck in the ON position forever. Spray it with WD-40, tap it gently with a hammer, and wiggle it. If it won't move, call a plumber to replace it (scheduled call, not emergency).

**Q: Can I use the valve behind the toilet?**
A: **Yes, for local leaks.** If the toilet is overflowing, turn the "Angle Stop" (football shaped handle) clockwise. But this won't help if a pipe bursts in the wall.

**Q: Where is my sewer cleanout?**
A: usually a white PVC cap (3-4 inches wide) in the front flower bed or the basement floor. You need a large wrench to open it. If sewage backs up, this is where "Roto-Rooter" goes in.
`;

// ------------------------------------------------------------------
// UK CONTENT (Hyper-Expanded)
// ------------------------------------------------------------------
const gb_content = `**Water leak chaos? Electrical sparking? Step-by-step guide to finding your Stopcock, tripping the RCD, and isolating the gas ECV before the fire brigade arrives.**

---

#### 1. The Internal Stopcock (Mains Water)
This is the most important valve in your house.
*   **Location:**
    *   **Kitchen:** Usually under the sink, at the back of the cupboard.
    *   **Cloakroom:** Sometimes near the front door.
    *   **Bathroom:** Rarely (in older flats) under the bath.
    *   **New Builds:** Often behind a plastic panel in the utility room.
*   **Mechanism:** It is usually a brass tap (looks like a garden tap). Turn it **Clockwise** to close.
*   **The "Seized" Problem:** Because it is never used, it calcifies. Test it twice a year. If it won't move, don't use mole grips. You will snap the spindle and flood the kitchen immediately.

#### 2. The External Stop Valve
If the internal stopcock snaps (or you can't find it):
*   **Location:** In the pavement/pathway outside your property boundary. Look for a small plastic (black) or metal (blue/iron) lid typically marked "Water" or "W".
*   **Access:** You often need a "Stopcock Key" (a long T-bar tool) to reach down 3 feet and turn it. Flashlight essential.
*   **Who Owns It?** The Water Company (e.g., Thames Water) owns it. If it's broken, they fix it for free. But you are allowed to turn it in an emergency.

#### 3. The Fuse Box (Consumer Unit)
*   **The Main Switch:** The large Red switch. This kills power to the whole house.
*   **The RCD (Residual Current Device):** This is the life-saver. It detects "earth leakage" (e.g., someone cutting a cable with a hedge trimmer).
    *   **Test It:** Press the "T" or "Test" button every 6 months. It should snap OFF instantly. If not, it is faulty. call an electrician immediately.
    *   **The 50% Rule:** If your electrics trip, turn off 50% of the breakers. If it stays on, the fault is in the other 50%. Keep halving until you find the faulty circuit.

#### 4. The Gas ECV (Emergency Control Valve)
*   **Location:** In the white fibreglass meter box on the external wall, or under the stairs (older homes).
*   **Action:** It is a lever attached to the pipe *before* the meter.
    *   **ON:** Lever is parallel to the pipe (Vertical).
    *   **OFF:** Lever is perpendicular (Horizontal).
*   **Safety:** If you smell gas, turn this off and open all windows. Do not touch light switches (spark risk). Call National Gas Emergency Service (0800 111 999).

#### 5. Case Study: The "Loft Tank" Overflow
*   **The Scenario:** A Victorian terrace in Manchester. The ball valve in the cold water storage tank (in the loft) seized open.
*   **The Symptom:** Water poured out of the "Overflow Pipe" (warning pipe) sticking out of the eaves.
*   **The Mistake:** The owner ignored it, thinking "it's draining outside, so it's fine."
*   **The Damage:** The wind blew the water back against the fascia board and brickwork for 3 weeks. It saturated the solid wall, causing wet rot in the roof timbers and destroying the bedroom plaster below.
*   **The Fix:** A 50p washer for the ball valve. But the rot repair cost £4,000.
*   **Emergency Fix:** Find the "Gate Valve" on the pipe feeding the tank and shut it. Or tie the ballcock arm up with string to stop the fill.

#### 6. The "Priority Services Register"
If you have elderly parents or medical equipment:
*   **The Register:** You can register with your energy/water supplier as "Vulnerable."
*   **The Benefit:** In a power cut or outage, you get priority support (free bottled water delivery, heaters, dedicated phoneline). It is free to register.

#### 7. Insurance Claims: "Trace and Access"
*   **The Clause:** Most policies cover the *damage* caused by a leak, but not the *repair* of the pipe itself.
*   **Trace & Access:** This specific clause covers the cost of *finding* the leak (e.g., digging up a concrete floor).
*   **The Trap:** Without this clause, you might have to pay £3,000 to dig up your kitchen floor just to fix a £10 pipe. Check your policy today.

#### 8. UK Emergency Costs (2025)
| Service | Business Hours | Out of Hours (2am) |
| :--- | :--- | :--- |
| **Emergency Plumber** | £80 - £120 | £180 - £300 |
| **Emergency Electrician** | £90 - £130 | £200 - £350 |
| **Gas Safe Engineer** | £100 - £150 | £220+ |
| **Locksmith (Entry)** | £80 | £150 |
| **Boarding Up (Glazier)**| £100 | £250 |

#### 9. Glossary of UK Emergency Terms
1.  **Bonding:** Earth wire connecting pipes to the fuse box (Safety).
2.  **Consumer Unit:** The fuse box.
3.  **Earth Spike:** Rod in the ground (for older earthing systems).
4.  **ECV:** Emergency Control Valve (Gas).
5.  **Gate Valve:** Red wheel valve (usually stuck).
6.  **Isolation Valve:** Small unwanted screw-slot valve on copper pipes suitable for isolating a specific tap.
7.  **Main Squib:** The main fuse from the street (Do not touch. 100A).
8.  **MCB:** Miniature Circuit Breaker (The little switches).
9.  **Overflow:** Pipe warning you a tank is too full.
10. **RCD:** Life-saving trip switch.
11. **Stopcock:** Main water shut-off.
12. **Shoring:** Propping up a dangerous wall.

#### 10. FAQ Section
**Q: My fuse box is tripping, but I don't know why.**
A: **The Process of Elimination.**
1. Switch all MCBs (little switches) OFF.
2. Switch the RCD (Main Trip) ON.
3. Switch MCBs on one by one.
4. When the RCD trips again, you have found the faulty circuit (e.g., Kitchen Sockets). Leave that one OFF and turn the rest back on. Then unplug everything in the kitchen to find the faulty appliance.

**Q: Can I fit an isolation valve myself?**
A: **Yes.** "Service Valves" (compression fittings with a screw slot) are DIY legal. Fit them to the pipes feeding your bathroom sinks and toilets so you can isolate them without turning off the whole house.

**Q: Who pays if my fence blows down?**
A: **You do.** Fences are rarely covered by insurance for "Storm Damage" (check the small print). It is considered "wear and tear."
`;

async function insertRegionalBatch() {
    console.log(`--- Starting Batch 6 Insertion (Home Emergency) ---`);

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'home-emergency-shut-off-protocol-us',
            title: "The Home Emergency Protocol: Shut-Off Valves, Breakers & 911 (US Edition)",
            content: us_content,
            excerpt: "Water pouring through the ceiling? Smell gas? The 3 valves every homeowner MUST label today. A printable checklist for Main Water, Gas, and Breakers.",
            cover_image: "/blog/emergency/main-shutoff-valve.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'home-emergency-stopcock-fusebox-gb',
            title: "Home Emergency Guide: Stopcocks, Fuse Boxes & The Isolation Valve (UK)",
            content: gb_content,
            excerpt: "Water leak chaos? Electrical sparking? Step-by-step guide to finding your Stopcock, tripping the RCD, and isolating the gas ECV.",
            cover_image: "/blog/emergency/uk-stopcock.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log(`--- Batch 6 (Home Emergency) Complete ---`);
}

insertRegionalBatch();
