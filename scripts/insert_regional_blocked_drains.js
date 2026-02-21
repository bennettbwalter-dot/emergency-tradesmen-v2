import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**A toilet that won't flush is annoying. A toilet that gurgles when the shower runs is a disaster waiting to happen. Learn the difference between a local clog and a main sewer backup.**

---

#### 1. The Anatomy of a Backup: How to Diagnose the Danger
Your home's plumbing is like a tree. The fixtures (toilets, sinks, showers) are the branches, and they all feed into one "Trunk"—the **Main Sewer Line**.
*   **Local Clog (Branch Issue):** If only ONE fixture is draining slowly (e.g., the kitchen sink), the clog is in the P-Trap or the immediate branch line. This is a DIY fix with a plunger or small snake.
*   **Main Line Backup (Trunk Issue):** This is the "Code Red." If you flush the toilet and water comes UP in the bathtub, or if running the washing machine causes the toilet to gurgle, the blockage is in the main line leaving the house. **STOP USING WATER IMMEDIATELY.** If you keep running water, you will flood your own home with sewage. For immediate response steps, see our [Home Emergency Shut-off Guide](/blog/home-emergency-shut-off-protocol-us).

#### 2. Whose Problem Is It? (The Lateral Line)
In the US, most homeowners are responsible for the **"Upper Lateral"**—the pipe that runs from your house foundation to the property line (sidewalk).
*   **The Lower Lateral:** The pipe from the property line to the City Sewer Main (in the middle of the street) is *usually* the city's responsibility, but in many municipalities, the homeowner owns the pipe all the way to the connection. You need to check your local code or the [EPA's Clean Water Act](https://www.epa.gov/laws-regulations/summary-clean-water-act) guidance.
*   **The Cleanout:** You should have a "Main Cleanout" (a PVC or cast iron pipe with a screw cap) in your yard. If you open this cap and water flows out, the blockage is downstream (City side). If you look down and it's empty, the blockage is under your house.

#### 3. The Silent Killer: Tree Roots
The #1 cause of main line backups in the US is **Root Intrusion**. Old clay or cast iron pipes develop small cracks over decades. Tree roots seek moisture, entering these cracks and forming a dense web inside the pipe.
*   **The Fix:** A regular plumber's snake poke a hole in the roots, but they will grow back in 6 months. To solve the problem, you need **Hydro-Jetting** (high-pressure water cutting) or a chemical root killer (Foaming Root Assassin).

#### 4. Section: Health Risks (Black Water)
Sewage backup is classified as **Category 3 Water** ("Black Water"). It is grossly unsanitary and contains bacteria (E. Coli, Salmonella), viruses (Hepatitis, Rotavirus), and parasites (Giardia).
*   **The Rule:** If sewage touches carpet, pad, or drywall, **IT CANNOT BE CLEANED.** It must be cut out and discarded. You cannot "shampoo" sewage out of a carpet pad. The health risk to children and pets is too high. Refer to [CDC Guidelines on Floodwater](https://www.cdc.gov/natural-disasters/safety/floodwater-safety.html) for more.

#### 5. Section: The "Backwater Valve" Solution
If you live in a low-lying area or possess a basement, you are at risk of the City Sewer backing up INTO your house during heavy rains. To prevent this, you should install a **Backwater Valve**. This is a one-way flap that allows water to leave your house but slams shut if sewage tries to flow back in. Recent code changes in flood-prone areas (like Florida and Houston) mandate these.

#### 6. Appendix A: 50-Item Master US Sewer & Septic Glossary
1.  **Lateral:** Sewer pipe from house to main.
2.  **Main:** City sewer in the street.
3.  **Cleanout:** Access point for snakes/jetters.
4.  **Trap:** U-bend holding water seal.
5.  **Vent Stack:** Roof pipe allowing air in.
6.  **Branch Line:** Pipe from fixture to stack.
7.  **Soil Stack:** Vertical pipe carrying waste.
8.  **P-Trap:** Sink trap.
9.  **S-Trap:** Illegal old-style trap.
10. **Drum Trap:** Old bathtub trap (prone to clogging).
11. **Lead Bend:** Connection for old toilets.
12. **Closet Flange:** Mounts the toilet to the floor.
13. **Wax Ring:** Seal under the toilet.
14. **Fernco:** Rubber coupling.
15. **ABS:** Black plastic pipe.
16. **PVC:** White plastic pipe.
17. **Cast Iron:** Heavy metal pipe (pre-1970).
18. **Orangeburg:** Paper/Tar pipe (failed design).
19. **Clay Pipe:** Historic pipe (prone to roots).
20. **Belly:** Sag in the pipe holding water.
21. **Offset:** Misaligned pipe joint.
22. **Collapse:** Crushed pipe.
23. **Scale:** Rust buildup in cast iron.
24. **Grease Trap:** Collection box for kitchen fat.
25. **Septic Tank:** Private treatment box.
26. **Leach Field:** Soil absorption area.
27. **Distribution Box (D-Box):** Splits septic flow.
28. **Effluent:** Liquid waste.
29. **Scum:** Floating layer in tank.
30. **Sludge:** Bottom solids in tank.
31. **Baffle:** Deflector in tank.
32. **Riser:** Access lid for pumping.
33. **Perc Test:** Soil percolation test.
34. **Cesspool:** Old-style pit (illegal now).
35. **Lift Station:** Pump moving sewage uphill.
36. **Grinder Pump:** Macerating pump.
37. **Ejector Pump:** Basement sewage pump.
38. **Sump Pump:** Groundwater pump (not sewage).
39. **Check Valve:** One-way valve.
40. **Backwater Valve:** Main sewer flap.
41. **Hydro-Jet:** High-pressure cleaner.
42. **Snake:** Auger cable.
43. **Camera Inspection:** Fiber optic diagnosis.
44. **Locator:** Tool to find camera underground.
45. **CIPP:** Cured-In-Place Pipe (lining).
46. **Trenchless:** Dig-free repair.
47. **Easement:** Utility access right.
48. **Dye Test:** Check for leaks.
49. **Smoke Test:** Check for sewer gas leaks.
50. **Black Water:** Raw sewage.

#### 7. 20-Step US Sewage Backup Response Checklist
1.  **Evacuate:** Get kids/pets out.
2.  **Stop Water:** Shut off Main Valve.
3.  **Electricity:** Turn off power to flooded area.
4.  **Identify:** Is it localized or main line?
5.  **Check Cleanout:** Is it holding water?
6.  **Call Pro:** Plumber with camera.
7.  **Notify City:** If street manhole is overflowing.
8.  **PPE:** Wear boots, gloves, mask.
9.  **Contain:** Use towels to stop spread (discard later).
10. **Ventilate:** Open windows.
11. **Document:** Photos for insurance.
12. **Insurance:** Call agent (check "Sewer Rider").
13. **Extract:** Wet-vac (hazardous waste).
14. **Disinfect:** Bleach solution on hard surfaces.
15. **Demolish:** Cut wet drywall/carpet.
16. **Repair:** Snake or Jet the line.
17. **Inspect:** Camera to find the root cause.
18. **Restore:** Dry piping/repainting.
19. **Sanitize:** Professional antimicrobial fogging.
20. **Re-occupy:** Only after air test clearance.

#### 9. The 12-Month US Drainage Maintenance Calendar
*   **January:** Check your **Sump Pump** discharge line for freezing. Ensure the extension hose is clear of snow.
*   **April (Spring Thaw):** Inspect your **Yard Cleanout**. Make sure the cap is not cracked by the lawnmower. If it's loose, sewer gas (and rats) can escape.
*   **June:** Apply a **Root Killer** (Foaming Copper Sulfate) down the toilet. This kills tree roots entering the line before they grow thick in summer.
*   **September:** Clear leaves from **Window Wells** and basement stair drains to prevent flooding during fall storms.
*   **November (Thanksgiving):** The busiest day of the year for plumbers. Do NOT pour turkey grease down the drain. Wipe pans with paper towels.
*   **December:** If you have a **Septic Tank**, check when it was last pumped (every 3-5 years is the rule).

#### 10. FAQ Section (Infinite Depth)
**Q: Does homeowners insurance cover sewer backup?**
A: **Usually No.** Standard HO-3 policies cover internal water damage (burst pipe), but explicitly exclude "Water Backup of Sewers or Drains." You must have a specific "Sewer & Drain Endorsement" or rider on your policy. Ideally, you want $10,000 to $20,000 of coverage.

**Q: Can I flush "Flushable Wipes"?**
A: **Absolute No.** There is no such thing as a flushable wipe. They do not break down like toilet paper. They snag on roots and rough cast iron, forming "rag balls" that block the main line. Plumber slogan: "Flushable wipes pay my mortgage."

**Q: My sink smells like rotten eggs. Is it sewage?**
A: Probably not. This is usually a dry P-Trap (in a guest bathroom used rarely) allowing sewer gas to escape. Pour a bucket of water down the drain to re-seal the trap. If the smell persists, it might be a broken vent stack in the wall.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Drain blocked? Before you pay a plumber £150, you need to know if the blockage is in your private drain or the public sewer. Thanks to a 2011 law change, the answer might save you a fortune.**

---

#### 1. The Critical Diagnosis: Public vs Private
Since October 2011, the "Transfer of Private Sewers Regulations" changed the game for UK homeowners.
*   **Your Responsibility:** You are only responsible for the drains inside your property boundary that serve *only* your home.
*   **The Water Company's Responsibility:** As soon as your drain meets a neighbor's pipe (becoming a "Shared Outlet") OR leaves your property boundary, it usually becomes a **Public Sewer**. The local Water Company (Thames Water, Anglian, Severn Trent, etc.) must clear blockages here **for free**. See [Ofwat Guide](https://www.ofwat.gov.uk/households/supply-and-standards/responsibility-for-pipes/) for more on pipe ownership.

#### 2. The "Inspection Chamber" Test
To find out where the problem lies, lift the lid of the Inspection Chamber (Manhole) in your garden or driveway. This is your "Portal of Truth."
*   **Scenario A (Empty):** If the chamber is empty but your toilet is blocked, the clog is *upstream* (inside your house pipes). **Call a Plumber.**
*   **Scenario B (Full):** If the chamber is full of sewage, the blockage is *downstream* (in the pipes leaving your property). This is likely a Public Sewer issue. **Call the Water Company.**

#### 3. Health Risks: Weil's Disease (Leptospirosis)
UK sewers are home to millions of Brown Rats (*Rattus norvegicus*). Their urine carries the bacteria *Leptospira*.
*   **The Risk:** If you have a sewer flood in your garden or house, you are at risk of contracting **Weil's Disease**. It enters through cuts or eyes/mouth. Symptoms overlap with flu but can cause liver/kidney failure.
*   **Protocol:** Always wear heavy rubber gloves, goggles, and waterproof boots. Disinfect everything with industrial bleach. Never let children play in a garden that has had sewage overflow until the topsoil is sanitized or replaced. For more, see [HSE Water Hazards](https://www.hse.gov.uk/healthservices/water-hazards.htm).

#### 4. Section: "Fatbergs" and the Wet Wipe Epidemic
UK sewers are plagued by "Fatbergs"—giant congealed masses of cooking fat and wet wipes. The largest found in London weighed 130 tonnes.
*   **The Law:** It is an offense under the Water Industry Act 1991 to "misuse" the sewer system. While rarely prosecuted, you can be charged for the clearance costs if the water company proves you flushed nappies, fat, or builder's rubble.
*   **Prevention:** "Bin it, don't flush it." Only the 3 Ps go down the loo: **Pee, Poo, and (Toilet) Paper.**

#### 5. Section: Surface Water vs Foul Water
The UK has two types of drainage systems.
1.  **Foul Water:** Takes toilet/sink waste to the sewage treatment works.
2.  **Surface Water:** Takes rain from your roof/driveway to a local river.
*   **Cross-Connection:** It is illegal to plumb a washing machine into a rainwater downpipe. You are polluting the river with detergent. You can be fined by the [Environment Agency](https://www.gov.uk/government/organisations/environment-agency). For more on drainage safety, see our [UK Plumber Guide](/blog/5-signs-you-need-emergency-plumber-gb).

#### 6. Appendix A: 50-Item Master UK Drainage Glossary
1.  **Foul Sewer:** Dirty water pipe.
2.  **Surface Water Sewer:** Rainwater pipe.
3.  **Combined Sewer:** Victorian pipe carrying both.
4.  **Soil Pipe (SVP):** Main vertical toilet pipe.
5.  **Waste Pipe:** Smaller sink/bath pipe.
6.  **Gulley:** Outside drain with grid.
7.  **Manhole:** Access chamber.
8.  **Inspection Chamber (IC):** Small plastic manhole.
9.  **Rodding Eye:** Cleaning access point.
10. **Interceptor Trap:** Old U-bend in manhole (often blocks).
11. **Soakaway:** Underground crate for rainwater.
12. **Lateral Drain:** Pipe joining sewer.
13. **Adopted Sewer:** Owned by water company.
14. **Section 24:** Historic Public Sewer term.
15. **Thames Water:** London provider.
16. **United Utilities:** North West provider.
17. **Severn Trent:** Midlands provider.
18. **Anglian Water:** East provider.
19. **Scottish Water:** Scotland provider.
20. **Welsh Water:** Wales provider.
21. **Fatberg:** Grease/Wipe blockage.
22. **Jetting:** High pressure cleaning.
23. **CCTV Survey:** Camera inspection.
24. **Lining:** Epoxy repair method.
25. **Patch Repair:** Localized lining.
26. **Excavation:** Digging up pipe.
27. **Sonar Tracing:** Finding pipe location.
28. **Bottle Trap:** Sink trap type.
29. **P-Trap:** Toilet trap type.
30. **S-Trap:** Older trap type.
31. **HepVO:** Waterless valve trap.
32. **Durgo Valve:** Air admittence valve.
33. **Vent Stack:** Roof outlet.
34. **Lead Pipe:** Forbidden water supply.
35. **Pitch Fibre:** 1960s pipe (collapses).
36. **Clayware:** Salt-glazed clay pipe.
37. **PVC-U:** Modern plastic pipe.
38. **Concrete Pipe:** Large sewer pipe.
39. **Root Ingress:** Tree root damage.
40. **Displaced Joint:** Moved pipe section.
41. **Fracture:** Cracking in pipe.
42. **Invert Level:** Bottom of the pipe height.
43. **Cover Level:** Ground height.
44. **Backdrop:** Vertical drop in manhole.
45. **Benching:** Sloped floor of manhole.
46. **Channel:** Open pipe in manhole.
47. **Non-Return Valve:** Anti-flood valve.
48. **Rat Flap:** Metal extensive to stop rats.
49. **Septic Tank:** Rural sewage system.
50. **Cesspit:** Sealed accumulation tank.

#### 7. 20-Step UK Sewage Flood Response Checklist
1.  **Safety First:** PPE (Gloves/Boots).
2.  **Stop Flow:** Do not flush/run taps.
3.  **Check IC:** Lift manhole lid.
4.  **Identify Owner:** Private or Public?
5.  **Call 105 (no, wait):** Call Water Company Emergency Line.
6.  **Call Insurer:** Check "Home Emergency" cover.
7.  **Isolate:** Keep pets away.
8.  **Neighbors:** Ask if they are blocked.
9.  **Landlord:** If renting, call immediately.
10. **Plumber:** Only if IC is empty.
11. **Containment:** Sandbags if overflowing.
12. **Ventilate:** Open windows.
13. **Photos:** Evidence for claim.
14. **Extraction:** Pump out (Pro service).
15. **Sanitize:** Jeyes Fluid / Bleach.
16. **Dry:** Dehumidifier.
17. **Discard:** Carpets/Soft furnishings.
18. **Survey:** CCTV to find cause (Collapse?).
19. **Repair:** Patch or Excavate.
20. ** prevention:** Install non-return valve.

#### 9. The 12-Month UK Drainage Maintenance Calendar
*   **January (Storm Season):** Check all **Gulleys** for leaves. A blocked gulley will cause rainwater to pool against the brickwork, leading to penetrating damp.
*   **April:** Lift the **Inspection Chamber** lid. If you see "slow flow" or solids building up, flush the drains with hot water and soda crystals.
*   **June:** If you have a shared drive, check the **Channel Drain** (Aco drain) across the entrance. It often fills with silt.
*   **September:** Gutter check. A blocked gutter overflows into the exact spot where your sewer pipe leaves the house, saturating the ground and potentially shifting the pipe (subsidence).
*   **November:** Christmas cooking fat warning. Pour fat into a jar, freeze it, and bin it. Never drain it.
*   **December:** Lagoons/Septic Tanks need winterizing. Ensure the lids are secure against heavy frost.

#### 10. FAQ Section (Infinite Depth)
**Q: Who pays if my shared drain is blocked?**
A: Since 2011, if the drain is **shared** (serves more than one property) or is outside your boundary, the **Water Company** usually pays for the clearance and repair. If it is only your private drain inside your boundary, **you pay**.

**Q: Can I build over a sewer?**
A: **Maybe.** You need a "Build Over Agreement" from your local Water Company. If you build an extension over a public sewer without permission, they can legally force you to knock it down to access the pipe.

**Q: Why does my house smell of sewage when it rains?**
A: This usually means the "Surface Water" drains (rain) are overwhelming the "Combined Sewer" system, or you have a crack in a pipe that only leaks when the ground is saturated. It requires a CCTV survey to locate.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 2 Insertion (Blocked Drains) ---');

    // 1. Handle US Version (Rename existing 'blocked-drains-vs-flooded-sewers-danger-guide' -> '...-us')
    console.log('Inserting US Version (and renaming base if needed)...');

    // First, try to find the BASE post
    const { data: baseData } = await supabase.from('posts').select('id').eq('slug', 'blocked-drains-vs-flooded-sewers-danger-guide').single();

    if (baseData) {
        console.log('Found base post. Updating to US version...');
        const { error: errorUpdateBase } = await supabase
            .from('posts')
            .update({
                content: us_content,
                slug: 'blocked-drains-vs-flooded-sewers-danger-guide-us', // RENAME
                title: "Blocked Drains vs. Major Sewer Backup: How to Spot the Danger (US Guide)",
                excerpt: "Toilet gurgling? Sewage in the shower? Learn the difference between a local clog and a City Sewer Backup. US Homeowner Guide to Cleanouts and Backwater Valves."
            })
            .eq('slug', 'blocked-drains-vs-flooded-sewers-danger-guide');
        if (errorUpdateBase) console.error('Error renaming base:', errorUpdateBase);
    } else {
        // Base not found, check if US already exists
        console.log('Base post not found. Checking for existing US version...');
        const { error: errorUpdateUS } = await supabase
            .from('posts')
            .update({
                content: us_content,
                title: "Blocked Drains vs. Major Sewer Backup: How to Spot the Danger (US Guide)",
                excerpt: "Toilet gurgling? Sewage in the shower? Learn the difference between a local clog and a City Sewer Backup. US Homeowner Guide to Cleanouts and Backwater Valves."
            })
            .eq('slug', 'blocked-drains-vs-flooded-sewers-danger-guide-us');
        if (errorUpdateUS) console.error('Error updating US:', errorUpdateUS);
    }

    // 2. Handle GB Version (Insert clean new row if not exists)
    console.log('Inserting UK Version...');

    // Check if GB exists
    const { data: gbData } = await supabase.from('posts').select('id').eq('slug', 'blocked-drains-vs-flooded-sewers-danger-guide-gb').single();

    if (gbData) {
        console.log('GB Version exists. Updating...');
        const { error: errorUpdateGB } = await supabase
            .from('posts')
            .update({
                content: gb_content,
                title: "Blocked Drains vs. Flooded Sewers: Critical UK Safety Guide",
                excerpt: "Is it a private blockage or a public sewer collapse? Learn your rights under the 2011 Transfer of Private Sewers Regulations. Prevent health risks from rat-borne disease."
            })
            .eq('slug', 'blocked-drains-vs-flooded-sewers-danger-guide-gb');
        if (errorUpdateGB) console.error('Error updating GB:', errorUpdateGB);
    } else {
        console.log('GB Version missing. Inserting new row...');
        const { error: errorInsertGB } = await supabase
            .from('posts')
            .insert([{
                slug: 'blocked-drains-vs-flooded-sewers-danger-guide-gb',
                title: "Blocked Drains vs. Flooded Sewers: Critical UK Safety Guide",
                content: gb_content,
                excerpt: "Is it a private blockage or a public sewer collapse? Learn your rights under the 2011 Transfer of Private Sewers Regulations. Prevent health risks from rat-borne disease.",
                cover_image: "/blog/drains-flooding-sewer.png", // Use existing image
                published: true
            }]);
        if (errorInsertGB) console.error('Error inserting GB:', errorInsertGB);
    }

    console.log('--- Batch 2 (Blocked Drains) Complete ---');
}

insertRegionalBatch();
