import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Water is pouring into your attic during a storm. You have two options: Watch the ceiling collapse, or deploy the 'Blue Tarp' defense. This is the US homeowner's guide to emergency roof mitigation.** For more on ceiling safety, see our [Water Leak Guide](/blog/water-leaking-through-ceiling-first-steps-us).

---

#### 1. Safety First: The OSHA Rules of Engagement
**Rule #1:** Never, ever climb onto a wet roof. Asphalt shingles are like ice when wet. Refer to [OSHA Fall Protection](https://www.osha.gov/fall-protection) for safety standards.
**Rule #2:** Identify the leak from the *inside* first. Water travels down rafters. The drip on your ceiling may be 20 feet downhill from the actual hole in the roof. Go into the attic (if safe) and look for wet wood or "shiners" (nails with frost on them).

#### 2. Immediate Mitigation: The Tarp Protocol
If the storm has passed and it is safe to act:
1.  **Buy the Right Tarp:** You need a heavy-duty woven polyethylene tarp (Blue or Silver).
2.  **The "Over the Ridge" Method:** Never nail the bottom edge of a tarp to the shingles; water will just run under it. You must wrap the tarp *over the peak* (ridge) of the roof so water flows over it from the top.
3.  **Furring Strips:** Do not just use bricks to hold it down. Wrap the edge of the tarp around a 2x4 or 1x2 wood strip and nail *through* the wood into the roof deck. This prevents wind from ripping the grommets out.

#### 3. Ice Dams: The Northern US Menace
In states like MN, NY, and MA, winter leaks are caused by Ice Dams.
*   **The Cause:** Heat escapes your poorly insulated attic, melting snow on the roof. The water runs down to the cold eaves and freezes, forming a dam. Water then backs up *under* the shingles.
*   **The Fix:** Do NOT hack at it with an axe (you will destroy the roof). Use **Calcium Chloride** (Ice Melt) in a nylon stocking (the "Salt Sock") and lay it across the dam to melt a channel. Long term, you need better attic insulation and ventilation.

#### 4. Insurance Terminology: 'Sudden Peril' vs. 'Neglect'
*   **Covered (Usually):** "Wind-Driven Rain." If a storm blows shingles off and rain enters, that is a sudden peril.
*   **Not Covered:** "Wear and Tear." If your roof is 30 years old and just starts leaking because the shingles are worn out, insurance will deny the claim. They consider maintenance your responsibility.

#### 5. Section: Post-Storm Contractor Scams
After a major hurricane or tornado, "Storm Chasers" flood the area.
*   **The Scam:** They promise a "Free Roof" paid by insurance. They pretend to see damage that isn't there (or create it by lifting shingles).
*   **The Protection:** Never sign a "Contingency Agreement" before your adjuster has approved the claim. Always hire a local company with a physical office, not a "knocker" from out of state. For licensed contractor verification, check the [NRCA](https://www.nrca.net/).

#### 6. Glossary of US Roofing Terms
1.  **Asphalt Shingle:** The most common US roof cover (3-tab or Architectural).
2.  **Boot (Pipe Jack):** Rubber seal around vent pipes (Common leak spot).
3.  **Cricket:** A small diverter built behind a chimney.
4.  **Drip Edge:** Metal flashing at the roof edge.
5.  **Eaves:** The lower edge of the roof (overhang).
6.  **Fascia:** The board the gutters attach to.
7.  **Flashing:** Metal (aluminum/galvanized) used at joints.
8.  **Gable:** The triangular side of the house.
9.  **Granules:** The sand on shingles (protects from UV).
10. **Ice & Water Shield:** Self-adhering waterproof membrane.
11. **Joist:** Horizontal structural wood.
12. **Rafter:** Sloped structural wood.
13. **Ridge Vent:** Exhaust vent at the peak.
14. **Soffit:** The underside of the eaves (ventilation intake).
15. **Square:** Roofing unit (100 sq ft).
16. **Step Flashing:** L-shaped metal woven between shingles at a wall.
17. **Underlayment:** Felt paper or synthetic layer under shingles.
18. **Valley:** Where two roof slopes meet (High leak risk).

#### 7. Deep Dive: The Physics of Ice Dams
Understanding *why* your roof is leaking in February is key to stopping it.
*   **The Thermal Stack Effect:** Hot air rises. If your attic floor is not sealed, warm air from your living room leaks into the attic.
*   **The Melt:** This warm air heats the underside of the roof deck, melting the snow on top.
*   **The Freeze:** The water runs down to the eaves (which are cold because they extend past the warm wall). The water freezes into a block of ice.
*   **The Backup:** New meltwater hits this ice dam and pools backward, forcing itself UP under the shingles and down through the nail holes.
**The Fix:** You don't need a new roof; you need Air Sealing in the attic floor and more soffit ventilation.

#### 8. The 12-Month Roof Maintenance Calendar (US)
*   **Spring (March/April):** Clean gutters of winter debris. Check for "shiner" nails in the attic.
*   **Summer (July):** Inspect attic ventilation fans. Is the humid air escaping?
*   **Fall (October):** The Big Clean. Gutters must be 100% clear before the leaves fall. Trim tree branches staying 10ft away from the roof.
*   **Winter (January):** Monitor for ice dams. If you see icicles, you have a heat loss problem.
*   **Post-Storm:** Ground-level inspection with binoculars. Look for missing tabs or granules in the downspouts.

#### 9. Contractor Guide: Local vs. Storm Chaser
*   **Local:** Has a physical office, local phone number, and a reputation to protect.
*   **Storm Chaser:** Arrives in a truck with out-of-state plates immediately after a hail storm. Hits an entire zip code, subcontracts the work to the lowest bidder, and vanishes. **Avoid.**

#### 10. FAQ Section
**Q: Can I use silicone caulk to fix a leak?**
A: **Temporary only.** Silicone does not adhere well to asphalt granules long-term. For a better patch, use **Roofing Cement** (tar) in a tube, specifically designed for wet application.

**Q: How much does an emergency tarp service cost?**
A: Expect to pay $300 - $800 depending on the pitch (steepness) and height of the roof. It is dangerous work and insurance often reimburses this as "Mitigation."
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Water coming through the bedroom ceiling? In the UK, it's usually a slipped slate or a blocked valley gutter. Here is your emergency guide to stopping the rot.** For help in other home emergencies, see our [Emergency Home Guide](/blog/what-to-do-in-home-emergency-before-help-arrives-gb).

---

#### 1. The "Bucket Defense"
Before you worry about the roof, save the ceiling. Lath and plaster ceilings (in Victorian homes) are heavy. If they get saturated, they can collapse.
*   **The Poke:** If the ceiling is bulging, place a bucket underneath and poke a small hole with a screwdriver to release the water. This relieves the weight.

#### 2. Common UK Leak Sources
*   **Slipped Slates:** Older roofs (pre-1950) suffer from "Nail Sickness." The iron nails rust and the heavy slates slide down.
*   **The Valley Gutter:** The V-shape channel where two roofs meet. In terraced houses, this is often lead-lined. If it blocks with moss, water overflows into the loft.
*   **Cement Verge:** The mortar edge of the roof often cracks and falls out, letting rain blow in.
*   **Flat Roofs:** Traditional bitumen felt has a lifespan of 10-15 years. The sun cracks it, and water pools (ponding).

#### 3. Emergency Fixes (Do NOT Climb)
UK roofs are often steep and high (2-3 storeys). Ladder accidents are a leading cause of death.
*   **From the Loft:** Sometimes you can see daylight. You can temporarily stuff a rag or slide a piece of plastic under the slate *from the inside* to deflect water into a bowl.
*   **Polythene Sheeting:** If you have a flat roof extension, you might be able to weigh down a heavy plastic sheet with bricks (carefully).

#### 4. Finding a Roofer: The NFRC
The roofing trade is unregulated in the UK. Anyone can buy a ladder and call themselves a roofer.
*   **The Standard:** Look for members of the **NFRC (National Federation of Roofing Contractors)** at [nfrc.co.uk](https://www.nfrc.co.uk/).
*   **The Scam:** "I was just driving past and noticed a loose tile." **NEVER** accept this. This is the classic start of a rogue trader scam where they strip your roof and demand thousands to put it back.

#### 5. Section: Party Wall Issues
In a semi-detached or terraced house, the leak might be coming from your neighbor's side (e.g., a shared chimney stack).
*   **The Law:** You need to communicate. If the chimney is shared, the repair cost is shared. Check the *Party Wall Act 1996* if major work is needed.

#### 6. Glossary of UK Roofing Terms
1.  **Batten:** The wood strips tiles hang on.
2.  **Bitumen:** Tar used on flat roofs.
3.  **Breather Membrane:** Modern underlay (Tyvek).
4.  **Coping Stone:** Stone capping on a parapet wall.
5.  **Dormer:** Vertical window projecting from slope.
6.  **Eaves:** The bottom edge of the roof.
7.  **Fascia:** Board holding the gutter.
8.  **Fibreglass (GRP):** Modern flat roof material.
9.  **Flashing:** Lead sheet used for weatherproofing joints.
10. **Hip:** The external angle of a roof.
11. **Pantile:** Curved clay tile (S-shape).
12. **Parapet:** Wall extending above the roof line.
13. **Pointing:** Cement mortar between ridge tiles.
14. **Ridge Tile:** The V-shape tile at the very top.
15. **Sarking Felt:** Old black underlay (often rots).
16. **Slate:** Natural stone tile (Welsh/Spanish).
17. **Soaker:** Under-tile flashing at walls.
18. **Soffit:** Underside of the overhang.
19. **Valley:** Internal angle where roofs meet.
20. **Verge:** The edge of the roof at the gable.

#### 7. Material Guide: Slate vs. Concrete Tile
*   **Welsh Slate:** The gold standard. Lasts 100 years. If it slips, it's usually "nail sickness" (rusted nails). A roofer can refix it with a copper "tingle" hook.
*   **Concrete Tile:** Cheaper, heavier. Lasts 50 years. Usually fails due to moss buildup in the interlocking channels.
*   **Rosemary Tile:** Small clay tiles. Very brittle. Do not walk on these; they will snap.

#### 8. Security Warning: Lead Theft
With the price of scrap metal rising, thieves strip lead flashing from valley gutters and bay windows.
*   **The Sign:** You suddenly have water pouring in after a dry night (thieves climbed up).
*   **The Fix:** Replace lead with **Ubiflex** or a similar non-lead alternative that has no scrap value. Mark any remaining lead with **SmartWater** DNA forensic liquid. Refer to [HSE Working at Height](https://www.hse.gov.uk/work-at-height/index.htm) for roofing safety.

#### 9. The 12-Month UK Roof Maintenance Calendar
*   **Spring (Mar):** Moss removal. Do not pressure wash (it damages the surface). Scrape it off manually.
*   **Summer (Aug):** Check pointing on the ridge tiles. Is the cement crumbling?
*   **Autumn (Nov):** Gutter clearance. This is critical in the UK. Stopped gutters cause penetrating damp in walls.
*   **Winter (Dec/Jan):** Check for "wind lift" after storms.
*   **Ongoing:** Monitor the "flaunching" (cement) around the chimney pots.

#### 10. FAO Section
**Q: How much does a slipped slate cost to fix?**
A: Usually a minimum call-out charge (£80 - £150) plus materials. However, if the roofer needs scaffolding to reach it safely, the price jumps to £500+.

**Q: Can I claim on house insurance?**
A: Maybe. "Storm Damage" is usually covered (if wind speed was over ~50mph). "Wear and Tear" (old rotting felt) is NOT covered. Maintaining the roof is your job.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 3 Insertion (Roof Leak) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    // Upsert based on slug
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'emergency-roof-leak-tarping-us',
            title: "Roof Leaking in a Storm? The US Homeowner's Emergency Tarping Guide",
            content: us_content,
            excerpt: "Water entering your attic? Learn safe 'Blue Tarp' deployment, how to identify ice dams, and the insurance difference between 'Sudden Peril' and neglect.",
            cover_image: "/blog/roof-leak/tarp-roof.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'emergency-roof-leak-tarping-gb',
            title: "Roof Leaking? The UK Guide to Slipped Tiles and Valley Gutters",
            content: gb_content,
            excerpt: "Rain coming in? Guide to slipped slates, blocked valley gutters, and flat roof felt failure. Identifying 'Cowboy Roofers' and effective temporary repairs.",
            cover_image: "/blog/roof-leak/slate-roof.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 3 (Roof Leak) Complete ---');
}

insertRegionalBatch();
