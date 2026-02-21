import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Smelling rotten eggs in the master bath? It’s not just unpleasant—it’s dangerous. Hydrogen Sulfide is toxic. Here is the US homeowner's guide to Sewer Gas diagnostics.** For immediate shut-off steps, see our [Home Emergency Shut-off Guide](/blog/home-emergency-shut-off-protocol-us).

---

#### 1. The Science of the Smell (H2S)
Sewer gas is a mixture of ammonia, methane, and **Hydrogen Sulfide (H2S)**.
*   **The Rotten Egg Smell:** This is H2S. It is detectable by the human nose at 0.00047 parts per million (ppm).
*   **The Danger:** At low levels, it causes headaches and nausea. At high levels, it desensitizes your nose ("olfactory fatigue")—meaning you stop smelling it right before it becomes lethal.
*   **Explosion Risk:** Methane is odorless but explosive. If you smell eggs, you also have methane. Do not light candles.

#### 2. Diagnosis 1: The Dry P-Trap (90% of Cases)
Every sink, shower, and floor drain has a U-shaped pipe underneath called a P-Trap.
*   **How it Works:** It holds a cup of water. This water acts as a seal, blocking gas from coming up the pipe.
*   **The Failure:** If you have a guest bathroom or a basement floor drain that hasn't been used in a month, the water evaporates. The seal breaks, and gas flows freely into the room.
*   **The Fix:** Pour 2 gallons of water down the unused drain. You can add a tablespoon of vegetable oil to form a floating layer that slows future evaporation.

#### 3. Diagnosis 2: The Broken Wax Ring
If the smell is strictly around the toilet:
*   **The Test:** Straddle the toilet and try to rock it side-to-side. Does it move? Even 1/4 inch of movement breaks the wax seal between the toilet horn and the floor flange.
*   **The Fix:** You must pull the toilet, scrape off the old wax, and install a new "Jumbo" wax ring (or a modern silicone seal). Bolt it down TIGHT.

#### 4. Diagnosis 3: The Clogged Vent Stack
Your plumbing system needs to breathe. There is a pipe that goes from your drain up through the roof.
*   **The Symptom:** When you flush the toilet, does the bathroom sink gurgle? That is the sound of the toilet sucking air *through* the sink P-trap because the roof vent is blocked (Bird's nest, leaves).
*   **The Fix:** A plumber needs to snake the vent from the roof.

#### 5. Technical Deep Dive: Smoke Testing
If you cannot find the source, hire a plumber for a **Smoke Test**.
*   **The Process:** They plug the main sewer line and pump non-toxic white smoke into your plumbing system.
*   **The Reveal:** You walk through the house. Wherever you see smoke (under a cabinet, behind a wall), that is where the gas is leaking. It finds cracked cast iron pipes that are invisible to the eye.

#### 6. The 12-Month Plumbing Maintenance Calendar
*   **Jan:** Pour water down basement floor drains (Dry winter air evaporates traps fast).
*   **Feb:** Inspect the "Cleanout" plug in the yard. Is it cracked?
*   **Mar:** Check under sinks for S-Traps (Illegal venting) and replace with P-Traps.
*   **Apr:** Clean the "air gap" on the dishwasher.
*   **May:** Check toilet bolts. Tighten if loose.
*   **Jun:** Inspect the roof vent pipe (from the ground with binoculars) for nests.
*   **Jul:** Clear AC condensate lines (often tied into plumbing).
*   **Aug:** Pour boiling water down shower drains to kill "Drain Flies" (which live in the muck).
*   **Sep:** Check the washing machine drain hose for airtight sealing (Bad—it needs an air gap).
*   **Oct:** Winterize outdoor hose bibs.
*   **Nov:** Run water in the guest bath before holiday guests arrive.
*   **Dec:** Do not pour grease down the kitchen sink (Fatbergs cause backups).

#### 7. Glossary of US Plumbing Terms
1.  **Cleanout:** The access point with a screw cap to snake the line.
2.  **Closet Augur:** Special snake for toilets.
3.  **Flange:** The fitting on the floor the toilet bolts to.
4.  **H2S:** Hydrogen Sulfide.
5.  **Main Stack:** The large vertical pipe carrying waste down.
6.  **P-Trap:** U-shaped pipe holding water seal.
7.  **S-Trap:** Illegal trap shape that siphons itself dry.
8.  **Snake (Cobra):** Metal cable to clear clogs.
9.  **Vent Stack:** Pipe through roof for air.
10. **Wax Ring:** Seal under the toilet.
11. **Wet Vent:** A pipe serving as both drain and vent (Code strict).
12. **Backwater Valve:** Flapper preventing city sewer backup (Basements).

#### 9. Case Study: The "Mystery Smell" in Chicago (2023)
*   **The Scenario:** A homeowner in a renovated bungalow smelled sewage only during winter.
*   **The Diagnosis:** Smoke testing revealed a crack in the cast iron stack *behind* the new drywall in the kitchen.
*   **The Cause:** Thermal shock. The old pipe (1950s) cracked when hot water from the dishwasher hit the cold iron pipe.
*   **The Fix:** They had to open the wall and replace the stack with PVC.
*   **The Lesson:** Never bury old cast iron stacks behind expensive tile/cabinets without inspecting them first. Refer to [CDC Hydrogen Sulfide Safety](https://www.cdc.gov/natural-disasters/safety/hydrogen-sulfide.html) for more on health risks.

#### 10. US Plumbing Cost Guide (2025)
| Service | Average Cost | DIY Possible? |
| :--- | :--- | :--- |
| **Auger a Toilet** | $150 - $250 | YES ($50 tool) |
| **Replace Wax Ring** | $200 - $350 | YES ($10 part) |
| **Smoke Test** | $400 - $800 | NO (Requires machine) |
| **Camera Inspection** | $250 - $450 | NO |
| **Hydro Jetting** | $600 - $1,200 | NO |
| **Sewer Line Repair** | $50 - $200 per ft | NO |

#### 11. Insurance Note: "Water Backup Coverage"
Standard policies (HO-3) **DO NOT** cover sewage backing up into your house. You must ride "Water Backup and Sump Pump Overflow" endorsement.
*   **Cost:** ~$50/year.
*   **Benefit:** Covers the $10,000 mitigation bill when your basement fills with sludge.

#### 12. FAQ Section
**Q: Why does my house smell like sewage when it rains?**
A: **Atmospheric Pressure.** Low pressure allows gas to expand and escape easier. Also, if you are on a combined city sewer, heavy rain fills the main, pushing air (and gas) back up into your lateral line.

**Q: Is "Sewer Gas" explosive?**
A: **Yes.** It contains Methane. While rare, houses *have* exploded from sewer gas accumulation in basements. If the smell is strong, do not light a match.

**Q: Can I use Drano on a sewer smell?**
A: **No.** Drano clears clogs (hair/grease). It does nothing for a broken seal or a crack. In fact, the chemical heat can crack old porcelain toilets.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Drain smell in the en-suite? Gurgling plugs? You might have a "Siphoned Trap" or a failed "Durgo Valve." Here is the UK guide to eliminating sewer smells.** For more on sink issues, see our [Blocked Drainage Guide](/blog/blocked-drains-vs-flooded-sewers-danger-guide-gb).

---

#### 1. The UK Context: Victorian Plumbing vs Modern Plastic
UK plumbing is a mix of ancient cast iron soil stacks and modern "Push-Fit" plastic.
*   **The Soil Stack:** The 110mm pipe that runs vertically. In older houses, it is outside (Cast Iron). In newer houses, it is boxed in inside the bathroom.
*   **The Durgo Valve:** Unlike US homes which vent through the roof, many UK homes use an **Air Admittance Valve** (Durgo) in the loft or under the sink. It opens to let air in, and closes to stop smells getting out.

#### 2. Diagnosis 1: The Failing Durgo Valve
If you smell sewage in the loft or under a basin:
*   **The Mechanism:** The rubber seal on the AAV degrades after 10-15 years. It gets stuck in the "Open" position.
*   **The Fix:** Unscrew it (they are hand-tight) and replace it. A screwed-on AAV costs £15 at Screwfix.

#### 3. Diagnosis 2: Induced Siphonage
Do your traps gurgle?
*   **The Science:** When you flush the toilet, a "slug" of water rushes down the stack. This creates a vacuum behind it. If the venting is poor, this vacuum sucks the water out of the nearby basin or shower trap.
*   **The Result:** An empty trap = an open door for sewer gas.
*   **The Fix:** Install an **Anti-Siphon Bottle Trap** (McAlpine) on the basin. It lets air in to break the vacuum without losing the water seal.

#### 4. Diagnosis 3: The Outside Manhole
Go onto your driveway or patio. Lift the metal cover (Inspection Chamber).
*   **The Blockage:** Is it full of water? If so, the blockage is downstream (towards the street). The sewage is backing up the pipes and forcing gas through the joints.
*   **The Interceptor Trap:** Victorian drains often have a U-bend *in the manhole* called a "Buchan Trap." These block frequently. Many drainage engineers recommend removing them.

#### 5. Legal Context: Section 24 (The Transfer)
Who is responsible?
*   **Pre-2011:** You were responsible for the drain until it hit the main sewer.
*   **Post-2011:** Under the *Private Sewers Transfer Regulations*, water companies (Thames Water, Anglian, etc.) took ownership of "Shared Drains."
*   **The Rule:** If your drain serves *only* your house within your boundary, it is yours. Once it crosses the boundary OR joins a neighbor's pipe, it belongs to the Water Company. Call them first—it might be free.

#### 6. The 12-Month UK Drainage Calendar
*   **Jan:** Pour bleach and hot water down the kitchen sink to clear Christmas fat.
*   **Feb:** Check the external soil pipe for frost damage (Iron pipes crack).
*   **Mar:** Lift the manhole cover. Check for slow flow.
*   **Apr:** Install hair catchers in showers.
*   **May:** Check the gutter downpipes (often drain into the sewer). Are they blocked?
*   **Jun:** Test the Durgo Valve (if accessible).
*   **Jul:** Pour water down the "Guest Loo" usually used for storage.
*   **Aug:** Check the washing machine standpipe. ensure the hose isn't shoved down too far (bypassing the trap).
*   **Sep:** Clear leaves from the drain gullies outside.
*   **Oct:** Lag external waste pipes to prevent freezing.
*   **Nov:** Check the "Soil Vent Pipe" (SVP) cage on the roof for bird nests.
*   **Dec:** Do NOT pour Turkey fat down the sink. Bin it. For more on UK drainage law, see the [Environment Agency](https://www.gov.uk/government/organisations/environment-agency) guidance.

#### 7. Glossary of UK Drainage Terms
1.  **AAV:** Air Admittance Valve (Durgo).
2.  **Anti-Siphon Trap:** A trap allowing air in.
3.  **Bottle Trap:** The cup-shaped trap under basins.
4.  **Gulley:** The open drain grid outside for rainwater/kitchen waste.
5.  **Inspection Chamber:** Manhole.
6.  **Interceptor:** Old style trap in the manhole.
7.  **Pan Connector:** The white flexible finned pipe behind the toilet.
8.  **Rodding Eye:** Access point to push rods down.
9.  **Soil Stack:** The big toilet pipe (110mm).
10. **Soakaway:** A hole for rainwater (should NOT contain sewage).
11. **Stench Pipe:** Old name for Soil Vent Pipe.
12. **Stub Stack:** Short internal stack with a Durgo.

#### 9. Case Study: The "Victorian Terrace" Smell
*   **The Scenario:** A couple in London N4 kept smelling drains in their loft conversion.
*   **The Diagnosis:** The builder had installed an Air Admittance Valve (Durgo) but boxed it in completely.
*   **The Failure:** AAVs must have air flow to work. Because it was in an airtight box, it couldn't open to let air in, so the traps were being siphoned dry.
*   **The Fix:** Drilling a generic air vent grill into the boxing allowed the valve to breathe. Cost: £5.

#### 10. UK Drainage Cost Guide (2025)
| Job | Avg Cost (Inc VAT) | DIY Rating (1-10) |
| :--- | :--- | :--- |
| **Unblock Toilet** | £90 - £150 | 3 (Messy) |
| **CCTV Drain Survey**| £180 - £300 | 0 (Pro Kit needed) |
| **High Pressure Jetting** | £150 - £250 | 0 |
| **Replace Soil Stack** | £600 - £1,200 | 1 (Dangerous/Heavy) |
| **Install Bottle Trap** | £120 | 5 (Easy access needed) |
| **Lining a Drain** | £80/meter | 0 |

#### 11. Insurance Note: "Trace and Access"
If the smell is caused by a leak under the floor:
*   **Standard Policy:** Covers the *damage* caused by the leak (e.g., ruined floorboards).
*   **Trace and Access:** Covers the cost of *finding* the leak (digging up the floor). Without this clause, you pay the £1,000 digging bill yourself. Check your policy wording.

#### 12. FAQ Section
**Q: Can I block off the overflow pipe to stop the smell?**
A: **No.** The overflow is there to stop flooding. If it smells, the trap connected to it is dry or the waterseal is compromised. Fix the root cause.

**Q: Who pays for a blocked shared drain?**
A: **The Water Company.** If the blockage is in a pipe that serves you AND your neighbor, call your water provider (e.g., Severn Trent). It is their legal duty to clear it for free.

**Q: Are "Drain Flies" dangerous?**
A: They are a nuisance but carry bacteria. If you see tiny moth-like flies in the bathroom, they are breeding in the sludge inside your overflow or shower trap. Bleach and boiling water will kill the eggs.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 4 Insertion (Sewage Smell) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'sewage-smell-in-house-p-trap-us',
            title: "Sewage Smell in House? The US Guide to Dried P-Traps & Sewer Gas",
            content: us_content,
            excerpt: "Smelling rotten eggs? It's likely H2S gas from a dry P-Trap or broken toilet seal. Learn how to locate the leak and when to call a plumber for a Smoke Test.",
            cover_image: "/blog/plumbing/p-trap-diagram.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'drain-smell-bathroom-soil-stack-gb',
            title: "Drain Smell in the Bathroom? The UK Guide to Soil Stacks & Durgo Valves",
            content: gb_content,
            excerpt: "Nasty smell in the en-suite? It could be a failed Durgo Valve or 'Induced Siphonage'. UK guide to venting, soil stacks, and Section 24 shared drain laws.",
            cover_image: "/blog/plumbing/soil-stack.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 4 (Sewage Smell) Complete ---');
}

insertRegionalBatch();
