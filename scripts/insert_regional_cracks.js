import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Noticing stair-step cracks in your brickwork? Diagonal cracks above doors? Before you panic, learn to distinguish between normal drywall settlement and serious foundation heave.**

---

#### 1. The "Stair-Step" Crack (Exterior)
Walk around your house. Look at the brick or block siding.
*   **The Sign:** A crack that follows the mortar lines in a zigzag step pattern.
*   **The Meaning:** **Differential Settlement.** One corner of your house is sinking faster than the rest. The bricks are being pulled apart.
*   **The Cause:** Poor drainage (gutters dumping water right next to the foundation) or soil shrinkage (drought).

#### 2. Interior Warning Signs
Inside the house, look for:
*   **Diagonal Cracks:** Running from the top corner of a door or window frame up towards the ceiling.
*   **The "Sticky Door" Test:** Open and close your bedroom doors. Do they suddenly "stick" or rub against the jamb? If the frame has shifted from a rectangle to a parallelogram, the door won't fit. This is structural.
*   **Nail Pops:** Drywall nails popping out in a row usually just means stud shrinkage (normal), unless accompanied by floor sloping.

#### 3. Basement Walls (The Danger Zone)
If you have a poured concrete or block basement:
*   **Vertical Cracks:** Usually shrinkage. Not urgent unless leaking water.
*   **Horizontal Cracks:** **DANGER.** A horizontal crack mid-way up the wall means the soil outside is pushing the wall *in* (bowing). The wall has failed structurally. You need "Wall Anchors" or carbon fiber straps immediately.

#### 4. Case Study: The Texas "Expansive Clay" Disaster
*   **The Scenario:** A slab foundation home in Dallas (1980s build) developed a 1-inch crack across the living room tile floor after a severe summer drought.
*   **The Science:** Texas has expansive clay soil. When wet, it swells. When dry, it shrinks. The soil around the perimeter dried out and shrank, leaving the edge of the slab unsupported. The weight of the walls snapped the slab.
*   **The Fix:** 20 Steel Push Piers driven 25 feet down to bedrock to lift the perimeter back to level.
*   **The Cost:** $18,000.

#### 5. Cost Breakdown: Foundation Repair (2025)
| Method | Application | Cost Estimate |
| :--- | :--- | :--- |
| **Epoxy Injection** | Waterproofing minor vertical cracks | $500 - $800 |
| **Mudjacking (Poly)** | Lifting sunken concrete slabs/patios | $3,000 - $5,000 |
| **Helical Piers** | Lifting sinking foundations (standard) | $1,500 - $2,000 per pier |
| **Steel Push Piers** | Heavy duty lifting (bedrock) | $2,000 - $3,000 per pier |
| **Wall Anchors** | Stopping bowing basement walls | $600 - $1,000 per anchor |
| **Carbon Fiber Straps**| Reinforcing block walls | $500 per strap |

#### 6. The 12-Month Foundation Maintenance Calendar
*   **Spring:** Clean gutters. Ensure downspouts extend 5ft away from the house (Number 1 cause of failure).
*   **Summer:** Water your foundation? Yes. In drought zones (TX, OK), use a soaker hose around the perimeter to keep clay soil consistent.
*   **Fall:** Grade the soil. It should slope *away* from the house (drop 6 inches over 10 feet).
*   **Winter:** Seal asphalt driveway cracks to stop frost heave.

#### 7. Glossary of US Structural Terms
1.  **Backfill:** Soil put back against the foundation.
2.  **Bowing:** Wall bending inward.
3.  **Crawl Space:** Area under the floor (needs vapor barrier).
4.  **Differential Settlement:** Uneven sinking.
5.  **Expansive Soil:** Clay that swells.
6.  **Heave:** Ground lifting up (Frost or water).
7.  **Joist:** Wood beam supporting the floor.
8.  **Mudjacking:** Pumping concrete/foam under a slab.
9.  **Piering:** Driving steel stilts under the house.
10. **Slab-on-Grade:** Concrete floor on the ground.
11. **Sump Pump:** Removes water from under the basement.

#### 8. FAQ Section
**Q: Are hairline cracks normal?**
A: **Yes.** Concrete shrinks as it cures. "Plastic Shrinkage Cracks" (hairline, <1/16th inch) are cosmetic. Monitor them. If they widen to 1/4 inch, call a structural engineer.

**Q: Should I fill the crack before the engineer comes?**
A: **No.** The engineer needs to see the "clean" crack to diagnose the direction of movement. Filling it hides the evidence. You can put a piece of tape across it and mark a line to see if it moves.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Is that crack in the plaster serious? Identifying "Subsidence" caused by clay soil and trees. The RICS guide to monitoring cracks and the "15mm Rule."**

---

#### 1. The UK Context: Clay & Trees
In the South East (London), the soil is predominantly **London Clay**. It is highly shrinkable.
*   **The "Willow Tree" Problem:** A mature Willow or Oak tree can suck 1,000 litres of water a day out of the ground.
*   **The Mechanism:** In summer, the tree dries the clay under your foundations. The clay shrinks. The foundation drops.
*   **Subsidence:** This is the downward movement of the ground supporting the building.

#### 2. The RICS Crack Categories
Surveyors use the BRE Digest 251 classification:
*   **Category 0 (Negligible):** Hairline cracks <0.1mm.
*   **Category 1 (Very Slight):** Fine cracks <1mm. Treating with Polyfilla is fine.
*   **Category 2 (Slight):** Cracks <5mm. Not structural. Easily filled.
*   **Category 3 (Moderate):** Cracks 5mm - 15mm. Doors and windows sticking. Weather-tightness impaired. **Action required.**
*   **Category 4 (Severe):** Cracks 15mm - 25mm. Window frames distorted.
*   **Category 5 (Very Severe):** >25mm. Walls leaning. Beams losing bearing. **Major Structural Damage.**

#### 3. Lath and Plaster (Victorian Homes)
Do not confuse "Subsidence" with old plaster failure.
*   **The Material:** Pre-1930s ceilings are made of wooden slats (laths) covered in lime plaster.
*   **The Failure:** Over 100 years, the plaster "keys" (nibs that hook over the wood) snap off due to vibration.
*   **The Sign:** The ceiling sags or cracks, but the walls are straight. This is a plastering job, not a structural one.

#### 4. Case Study: The 1976 Drought vs 2022 Heatwave
*   **History:** The 1976 drought defined modern subsidence insurance.
*   **2022 Surge:** In the summer of 2022, "surge" claims for subsidence rose 400% in the South East.
*   **The Outcome:** Insurers are now demanding tree removal (or strict pruning regimes) before renewing cover in high-risk postcodes.
*   **The Lesson:** If you have a large tree within 10m of your house, get an Arborist Report.

#### 5. Insurance Context: "The Excess"
*   **Standard Excess:** Usually £100 for a leak.
*   **Subsidence Excess:** Almost always **£1,000**.
*   **The Declaration:** Once a house has been underpinned or had a subsidence claim, you must declare it forever. It makes the property harder to insure and sell (often "Cash Buyers Only").

#### 6. UK Repair Costs (2025)
| Service | Purpose | Cost Estimate |
| :--- | :--- | :--- |
| **Structural Survey** | Engineer Report (Specific Defect) | £600 - £1,000 |
| **Crack Stitching** | Bonding brickwork with Helibars | £80 per bar |
| **Tree Removal** | Felling a large Oak | £1,500 - £3,000 |
| **Drain Repairs** | Fixing leaking drains (softening soil) | £500 - £2,000 |
| **Underpinning** | Mass concrete pouring under foundations | £15,000 - £50,000 |
| **Resin Injection** | Geobear type expanding foam | £5,000 - £15,000 |

#### 7. The 12-Month UK Structural Calendar
*   **Jan:** Check gutters for overflow (Water saturating foundations).
*   **Feb:** Inspect pointing (frost damage).
*   **Mar:** Look for "Mouse holes" (Air bricks blocked?).
*   **Apr:** Prune trees (Crown reduction) before growth spurt.
*   **May:** Monitor existing cracks (mark with pencil).
*   **Jun:** Check drains (CCTV survey if cracks appear).
*   **Jul:** Water the garden (prevent clay shrinkage).
*   **Aug:** Check window sills for separation.
*   **Sep:** Clear climbing ivy (destroys brick face).
*   **Oct:** Clear valley gutters.
*   **Nov:** Check chimney stack stability.
*   **Dec:** Photograph cracks for insurance record.

#### 8. Glossary of UK Structural Terms
1.  **Arboriculturist:** Tree surgeon/expert.
2.  **Corbelling:** Bricks stepping out.
3.  **Heave:** Ground swelling up (often after tree removal).
4.  **Helibar:** Metal rod mortared into cracks.
5.  **Lath & Plaster:** Old ceiling type.
6.  **Lintel:** Beam over a window/door (Failure causes diagonal cracks).
7.  **London Clay:** The shrinkable soil type.
8.  **Monitor:** Measuring cracks over 12 months.
9.  **Pointing:** The mortar between bricks.
10. **Settlement:** Downward movement of *new* build (compaction).
11. **Subsidence:** Downward movement of *existing* ground.
12. **Underpinning:** Extending foundations downwards.

#### 9. FAQ Section
**Q: How do I know if it's subsidence or just settlement?**
A: **Settlement** happens in the first 10 years of a new building as the ground compacts. It is uniform. **Subsidence** happens later, is usually localized (one corner), and is seasonal (worse in summer).

**Q: Should I cut down the tree next to my house?**
A: **CAUTION.** If the tree is old, removing it can cause **Heave**. The dry soil will suddenly suck up moisture and swell, lifting the house and cracking it worse. You need an expert opinion before felling.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 5 Insertion (Structural Cracks) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'structural-cracks-foundation-repair-us',
            title: "Wall Cracks: Settlement vs. Foundation Failure (US Homeowner Guide)",
            content: us_content,
            excerpt: "Stair-step cracks in brick? Diagonal cracks above doors? Distinguish between normal drywall settlement and serious foundation heave. Cost guide included.",
            cover_image: "/blog/structure/brick-crack.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'structural-cracks-subsidence-survey-gb',
            title: "Cracks in the Plaster? The UK Guide to Subsidence & Heave",
            content: gb_content,
            excerpt: "Is that crack serious? Identifying 'Subsidence' caused by clay soil and trees. The RICS guide to crack categories (0-5) and the '15mm Rule'.",
            cover_image: "/blog/structure/stucco-crack.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 5 (Structural Cracks) Complete ---');
}

insertRegionalBatch();
