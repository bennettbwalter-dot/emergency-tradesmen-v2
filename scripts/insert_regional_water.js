import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Basement flooded? Burst pipe in the kitchen? The clock is ticking. Mold starts growing in 24 hours. Here is the US homeowner's guide to restoration.**

---

#### 1. The Clock Rule: 24 to 48 Hours
Water damage is a race against biology.
*   **0-24 Hours:** Water spreads. Drywall absorbs it like a sponge (wicking).
*   **24-48 Hours:** Mold spores germinate. Musty smells begin.
*   **48+ Hours:** Mold colonies become visible. The water degrades from Category 1 to Category 2. Restoration costs double.

#### 2. The Categories of Water (IICRC S500 Standard)
Insurance adjusters use this standard to decide what to save and what to trash.
*   **Category 1 (Clean Water):** From a broken supply line, faucet, or tub. Safe to handle. You can dry the carpet in place.
*   **Category 2 (Grey Water):** From a washing machine, dishwasher, or sump pump failure. Contains chemical or biological contaminants. **Carpet pad must be replaced.** Carpet can be cleaned.
*   **Category 3 (Black Water):** Sewage backup, toilet overflow (with feces), or flood water (from outside). Contains dangerous pathogens (E. coli). **Everything porous must be cut out and thrown away.** Drywall, carpet, insulation, hardwood.

#### 3. The Drying Process (Science of Psychrometry)
You cannot just open a window.
1.  **Extraction:** Use a submersible pump or weighted "Water Claw" to physically remove 90% of the water.
2.  **Air Movement:** High-velocity air movers (fans) evaporate moisture from the wet materials into the air.
3.  **Dehumidification:** Large LGR (Low Grain Refrigerant) dehumidifiers pull that moisture out of the air so it doesn't soak back into the walls.

#### 4. Case Study: The "Hidden" Kitchen Leak (Atlanta)
*   **The Scenario:** A homeowner noticed their oak hardwood floor "cupping" (edges curling up) in the kitchen. No visible water.
*   **The Investigation:** A moisture meter showed the subfloor was 100% saturated.
*   **The Cause:** The 1/4 inch plastic line to the refrigerator ice maker had a pinhole leak behind the cabinets. It had been dripping for 3 months.
*   **The Damage:** Because it was long-term ("seepage"), the insurance initially denied it. However, because the damage was "hidden within a wall/cabinet," the "Ensuing Loss" clause covered the floor replacement ($25,000).

#### 5. Cost Breakdown (2025 Restoration Rates)
| Service | Unit Cost | Total for 500 sq ft Basin |
| :--- | :--- | :--- |
| **Water Extraction** | $3.00 - $5.00 / sq ft | $1,500 - $2,500 |
| **Antimicrobial Spray** | $0.50 / sq ft | $250 |
| **Dehumidifier Rental** | $120 / day | $600 (5 days) |
| **Air Mover Rental** | $30 / day (x10) | $1,500 |
| **Drywall Removal** | $4.00 / sq ft | $1,000 |
| **Demolition Labor** | $75 / hour | $1,500 |
| **Total Project** | - | **$8,000 - $12,000** |

#### 6. The 12-Month Water Prevention Calendar
*   **Jan:** Disconnect garden hoses (prevent burst bibs).
*   **Feb:** Check sump pump discharge line for ice.
*   **Mar:** Test sump pump (pour a bucket of water in).
*   **Apr:** Clean gutters.
*   **May:** Inspect washing machine hoses (Replace rubber with steel braided).
*   **Jun:** Check water heater anode rod.
*   **Jul:** Clear AC condensate drain.
*   **Aug:** Check refrigerator ice maker line.
*   **Sep:** Flush water heater sediment.
*   **Oct:** Insulate pipes in unheated crawl spaces.
*   **Nov:** Locate your main water shut-off valve. Label it.
*   **Dec:** Leave faucets dripping during deep freeze.

#### 7. Glossary of US Restoration Terms
1.  **Air Mover:** Industrial fan.
2.  **Antimicrobial:** Chemical to kill mold/bacteria.
3.  **Category 1/2/3:** Water cleanliness levels.
4.  **Class 1-4:** Amount of water (Scale of evaporation).
5.  **Delamination:** Carpet backing separating.
6.  **Desiccant:** Dehumidifier for freezing temps.
7.  **Extraction:** Vacuuming water out.
8.  **IICRC:** The certifying body for restorers.
9.  **LGR:** Dehumidifier type.
10. **Mitigation:** The act of preventing further damage.
11. **Psychrometry:** Science of drying.
12. **Subrogation:** Insurance suing the at-fault party (e.g., appliance maker).

#### 8. FAQ Section
**Q: Can I just use a Shop-Vac?**
A: **For a small spill, yes.** For a flooded basement, no. A Shop-Vac cannot pull water out of the carpet pad. You will leave 50% of the water behind, and it will smell within 24 hours.

**Q: Will the insurance pay for the plumber?**
A: **No.** Standard homeowners insurance covers the *result* of the damage (wet drywall), but not the *cause* (the $300 plumbing repair to fix the pipe).

**Q: Can I save my carpet?**
A: If it is Cat 1 (Clean) water and verified dry within 72 hours, usually **Yes**. If it is Cat 3 (Sewage), **No**.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Came home to a flooded kitchen? Ceiling collapsed? How to handle the "Strip Out," drying verification certificates, and dealing with Loss Adjusters.**

---

#### 1. The Immediate Steps: Stop, Call, Document
1.  **Stop:** Turn off the Stopcock (usually under the kitchen sink).
2.  **Call:** Call your insurer's 24-hour emergency line. Ask "Do I have Trace and Access cover?"
3.  **Document:** Take photos of EVERYTHING. Do not throw away the ruined carpet or sofa. Put them in the garden/garage. The Loss Adjuster needs to see them to value the claim.

#### 2. The "Strip Out" Protocol
UK homes use different materials to the US.
*   **Chipboard Floors:** Most modern UK floors (P5 Chipboard) act like Weetabix when wet. They swell and lose structural integrity. **They cannot be dried.** They must be cut out and replaced.
*   **Plasterboard:** Water wicks up the wall. The restoration company will hack off the plaster 300mm *above* the highest wet line to allow the brickwork behind to breathe.
*   **Insulation:** Wet mineral wool insulation acts like a wet sponge against timber studs. It causes "Dry Rot" (Serpula lacrymans). It must be removed.

#### 3. The Drying Certificate
This is critical.
*   **The Mistake:** Builders arrive and re-plaster locally while the brickwork is still damp.
*   **The Result:** "Efflorescence" (white salts) pushes through the new paint 6 months later.
*   **The Rule:** Do not allow reinstatement until a technician provides a "Drying Certificate" proving the structure is below 15% WME (Wood Moisture Equivalent).

#### 4. Case Study: The "Escape of Water" Flat (Manchester)
*   **The Scenario:** A push-fit connector popped off under a bath in a top-floor flat. Water poured through 3 flats below.
*   **The Complexity:**
    *   **Buildings Insurance:** (The Freeholder) covered the drying and structural repairs (ceilings).
    *   **Contents Insurance:** (The Tenants) covered their own carpets and sofas.
    *   **Trace and Access:** Covered the plumber finding the leak.
*   **The Nightmare:** Coordinating 4 different insurance companies.
*   **The Solution:** They hired a "Loss Assessor" (Public Adjuster) to manage the claim for them.

#### 5. Insurance Context: "Betterment"
*   **The Principle:** Insurance is "Indemnity"—putting you back to the position you were in *before* the loss.
*   **The Reality:** If you had a cheap laminate floor, they will pay for cheap laminate. You cannot demand solid oak unless you pay the difference yourself. This is called "Betterment."

#### 6. UK Restoration Costs (2025)
| Service | Rate | Typical Cost |
| :--- | :--- | :--- |
| **Leak Detection** | Fixed Fee | £350 - £600 |
| **Dehumidifier Hire** | Weekly | £150 - £250 per week |
| **Strip Out Labour** | Daily Rate | £200 - £300 per day |
| **Skip Hire** | 8 Yard | £250 - £350 |
| **Re-Plastering** | Per Room | £600 - £900 |
| **Sanitisation** | Fluid | £150 |

#### 7. The 12-Month UK Water Calendar
*   **Jan:** Check pipes in the loft (Lagging).
*   **Feb:** Check stopcock operation (it seizes if not turned).
*   **Mar:** Clear gutters of winter moss.
*   **Apr:** Check washing machine hose inlet filter.
*   **May:** Check sealant around bath/shower (Silicone degradation).
*   **Jun:** Test the internal stopcock again.
*   **Jul:** Bleed radiators (check for leaks afterwards).
*   **Aug:** Check flexible hoses under sink (braided tails).
*   **Sep:** Clean drain gullies of leaves.
*   **Oct:** Isolate outside tap.
*   **Nov:** Check boiler pressure relief pipe (condensate).
*   **Dec:** Keep heating on "Frost Protection" (12 degrees) if away.

#### 8. Glossary of UK Restoration Terms
1.  **Air Brick:** Ventilation in the wall.
2.  **Appointed Representative:** The builder sent by the insurer.
3.  **Betterment:** Improving the property (you pay).
4.  **Chipboard:** Flooring material (ruined by water).
5.  **Dry Rot:** Structural fungus (Serious).
6.  **Efflorescence:** Salt crystals on wall.
7.  **Excess:** Your contribution to the claim.
8.  **Loss Adjuster:** Represents the Insurance Company (Argues down).
9.  **Loss Assessor:** Represents YOU (Argues up).
10. **Reinstatement:** Putting it back together.
11. **Stopcock:** Main water valve.
12. **Strip Out:** Demolition phase.
13. **Trace and Access:** Finding the leak.
14. **WME:** Wood Moisture Equivalent (%).

#### 9. FAQ Section
**Q: My insurer says I have to use their builder. Do I?**
A: **No.** You have the legal right to use your own contractor. However, the insurer will only pay what *their* builder would have charged. You might have to negotiate the rates.

**Q: Can I claim for the water bill?**
A: **Sometimes.** Some water companies (e.g., Thames Water) have a "Leak Allowance." If you prove the leak was accidental and fixed quickly, they will credit your bill for the lost water.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 5 Insertion (Water Damage) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'water-damage-restoration-category-mold-us',
            title: "Water Damage 101: The US Guide to Categories, Classes & Mold",
            content: us_content,
            excerpt: "Flooded basement? Race against the '24-hour mold clock'. Explaining IICRC Categories (Clean vs. Black Water) and the pro drying process.",
            cover_image: "/blog/water/dehumidifier.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'water-damage-restoration-strip-out-gb',
            title: "Burst Pipe Flood? The UK Guide to Drying Out (Strip Out & Reinstatement)",
            content: gb_content,
            excerpt: "Kitchen flooded? Why chipboard floors must be cut out. The importance of 'Drying Certificates' and dealing with Loss Adjusters.",
            cover_image: "/blog/water/fan-drying.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 5 (Water Damage) Complete ---');
}

insertRegionalBatch();
