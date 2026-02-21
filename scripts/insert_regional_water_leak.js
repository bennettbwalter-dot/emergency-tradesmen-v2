import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**If your ceiling is bulging with water, do not stand directly under it. The drywall can collapse without warning, dropping 50lbs of wet gypsum and water on top of you.** For immediate shut-off steps, see our [Home Emergency Shut-off Guide](/blog/home-emergency-shut-off-protocol-us).

---

#### 1. The "Golden Minute" Protocol
Water leaking through a ceiling is a "Golden Minute" emergency. This means the actions you take in the first 60 seconds determine whether you simply repaint a water stain ($200) or replace your entire living room ceiling and hardwood floors ($20,000).

In the United States, most homes use **Paper-faced Gypsum Board** (Drywall/Sheetrock). When this material gets wet, it loses 90% of its structural integrity. It turns into a heavy, soggy mush that creates a "Hydraulic Blister." If you don't relieve the pressure, it **will** collapse, bringing insulation, moldy dust, and possibly the pipe itself down with it.

#### 2. Immediate Action: The "Bucket and Poke" Method
This is the single most important trick in a homeowner's emergency arsenal.
1.  **Clear the Area:** Move furniture and expensive rugs away from the drip zone.
2.  **Place a Catchment:** Put a 5-gallon bucket or a large trash can directly under the bulge.
3.  **Poke the Hole:** Take a screwdriver, a pencil, or even a key, and punch a small hole in the center of the lowest point of the bulge.
4.  **Stand Back:** Water will pour out. This is GOOD. You are directing the water into the bucket rather than letting it pool across the entire ceiling panel. By draining the water, you allow the drywall to dry out and potentially save the sheet.

#### 3. Step 2: Kill the Source
Once the immediate pressure is relieved, you must stop the water.
*   **Constant, High-Pressure Flow:** This is a supply line failure (Copper, PEX, or CPVC). You must shut off the **Main Water Valve**.
    *   *Where is it?* In the basement near the front wall, in the garage near the water heater, or in a curbside meter box (you may need a "Curb Key").
*   **Intermittent or Soapy Water:** This is a waste line leak. If it only drips when someone showers or flushes, it’s a drain seal failure (Wax Ring or P-Trap).
    *   *Action:* Scream "STOP USING THE WATER" to everyone in the house.
*   **Dirty/Brown Water:** If it’s raining, this is a roof leak. If it’s not raining, it could be a sewage backup.
    *   *Action:* Call a roofer or plumber immediately.

#### 4. The Electrical Hazard: "Can Lights" and Smoke Detectors
Water follows gravity and path of least resistance. In US ceilings, that path is often the electrical wiring for your **Recessed Can Lights** (Pot Lights) or hardwired smoke detectors.
*   **Danger:** If water is dripping *through* a light fixture, **DO NOT TOUCH THE SWITCH.** The water has energized the metal trim of the light.
*   **Protocol:** Go to your **Breaker Panel** (Load Center) and turn off the breaker for that specific room. Use a flashlight/torch to navigate back.

#### 5. Section: The "Ice Dam" Phenomenon (Northern US Case Study)
In states like Minnesota, New York, and Massachusetts, ceiling leaks in February are often caused by **Ice Dams**. This happens when heat escapes your attic, melts snow on the roof, which then refreezes at the cold eaves, forming a dam. The water then backs up *under* the shingles and drips into your bedroom.
*   **The Fix:** Do NOT climb on an icy roof. Use a "Roof Rake" from the ground or fill a pantyhose with Calcium Chloride (ice melt) and throw it onto the dam to melt a channel. In 2025, insurance companies require "adequate attic insulation" (R-60) to prevent this.

#### 6. Appendix A: 50-Item Master US Ceiling & Leak Glossary
1.  **Sheetrock:** Brand name for drywall.
2.  **Joist:** The wooden beam the ceiling hangs from.
3.  **Rafter:** The angled roof beam.
4.  **Stud:** Vertical wall framing (2x4).
5.  **Drywall Tape:** Paper used to hide seams.
6.  **Mud/Joint Compound:** Paste used to finish drywall.
7.  **Texture:** Popcorn or Orange Peel finish.
8.  **P-Trap:** U-shaped drain pipe under sinks.
9.  **Wax Ring:** Seal under the toilet.
10. **Flange:** Anchor for the toilet.
11. **Supply Line:** Braided metal hose to toilet/faucet.
12. **Angle Stop:** Chrome shut-off valve under sink.
13. **PEX:** Red/Blue plastic piping.
14. **CPVC:** Yellowish plastic piping (brittle).
15. **Copper:** Metal piping (Type L or M).
16. **Fernco:** Rubber coupling for drains.
17. **Cleanout:** Access point for sewer snake.
18. **Vent Stack:** Pipe allowing air into drains.
19. **Boot:** Rubber seal around roof vent.
20. **Flashing:** Metal waterproofing on roof.
21. **Shingle:** Asphalt roof covering.
22. **Underlayment:** Tar paper / felt under shingles.
23. **Valley:** Where two roof slopes meet.
24. **Drip Edge:** Metal edge of roof.
25. **Soffit:** Underside of roof overhang.
26. **Fascia:** Board facing the gutter.
27. **Gutter:** Rain trough.
28. **Downspout:** Vertical gutter pipe.
29. **Splash block:** Diverter at bottom of downspout.
30. **Sump Pump:** Basement water remover.
31. **French Drain:** Exterior perimeter drain.
32. **Hose Bibb:** Outdoor faucet.
33. **Sillcock:** Frost-free hose bibb.
34. **Main Shut-off:** Master water valve.
35. **Curb Stop:** Utility valve at street.
36. **PRV:** Pressure Reducing Valve.
37. **Expansion Tank:** For water heater pressure.
38. **T&P Valve:** Relief valve on water heater.
39. **Pan:** Tray under washing machine/heater.
40. **Escutcheon:** Decorative plate around pipe.
41. **Caulk:** Waterproof sealant.
42. **Grout:** Filler between tiles.
43. **Backer Board:** Cement board for tile.
44. **Greenboard:** Moisture-resistant drywall.
45. **Blueboard:** Plaster-base drywall.
46. **Insulation:** Fiberglass or Cellulose.
47. **R-Value:** Insulation efficiency rating.
48. **Vapor Barrier:** Plastic moisture blocker.
49. **Mold:** Fungal growth from moisture.
50. **Mildew:** Surface mold.

#### 7. The Insurance Game: "Sudden and Accidental"
Homeowners Insurance in the US is very specific. They cover **"Sudden and Accidental"** discharge of water.
*   **Covered:** A pipe bursts at 2 AM and floods the house.
*   **Denied:** A toilet has been slowly leaking for 6 months and rotted the floor joists ("Long-term Seepage").
*   **The Lesson:** You must report the claim *immediately*. Waiting 2 weeks implies negligence.
*   **Deductible:** Know your deductible ($500 vs $2,500). If the repair is $2,000 and your deductible is $2,500, don't file a claim. Refer to [National Flood Insurance Program (NFIP)](https://www.floodsmart.gov/) for coverage details.

#### 8. Section: Who Do You Call? (The US Trade Hierarchy)
1.  **Emergency Plumber:** To stop the water and fix the pipe.
2.  **Mitigation Company (ServoPro/Paul Davis):** These are "Water Damage Restoration" experts. They bring in huge dehumidifiers (LGRs) and fans (Air Movers) to dry the structure before mold grows (usually within 48-72 hours).
3.  **Roofer:** Only if the water is coming from rain/ice.
4.  **Drywall Contractor:** To patch the hole *after* everything is dry (~5-7 days later). For mitigation standards, see [IICRC S500](https://iicrc.org/s500/).

#### 9. 20-Step US Ceiling Restoration Checklist
1.  **Stop Water:** Main valve off.
2.  **Drain Ceiling:** Bucket and poke.
3.  **Protect Contents:** Tarp furniture.
4.  **Call Pro:** Plumber/Mitigation.
5.  **Documentation:** Photos/Video for insurance.
6.  **Extraction:** Shop-vac standing water.
7.  **Demo:** Cut out wet drywall (2ft past water line).
8.  **Insulation Removal:** Bag wet fiberglass (it never dries).
9.  **Air Flow:** Set up box fans.
10. **Dehumidify:** Run AC or dehumidifier.
11. **Mold Spray:** Apply antimicrobial (Concrobium).
12. **Dry Test:** Use moisture meter on studs (<15%).
13. **Repair Pipe:** Plumber fixes leak.
14. **Insulate:** New fiberglass batts.
15. **Hang Drywall:** 5/8" thickness for ceilings.
16. **Tape & Mud:** 3 coats.
17. **Texture:** Match existing pattern.
18. **Prime:** PVA primer.
19. **Paint:** Ceiling white (flat).
20. **Cleanup:** Restore furniture.

#### 10. FAQ Section (Infinite Depth)
**Q: Can I just paint over the water stain?**
A: **No.** You must use a "Stain-Blocking Primer" (like Kilz or BIN) first. Regular latex paint is water-based; the yellow tannin stain will bleed right through it, even after 10 coats. You must use an Oil-based or Shellac-based primer to seal the stain.

**Q: Why does my ceiling leak only when the AC runs?**
A: This is a **Condensate Line Clog**. Your central air conditioner removes moisture from the air. This water drains via a PVC pipe. If algae blocks that pipe, the "Overflow Pan" fills up. If the secondary drain is also blocked, it spills into your ceiling. In 2025, codes require a "Float Switch" to shut off the AC automatically if this happens.

**Q: Is "Popcorn Ceiling" dangerous to remove?**
A: **Yes.** If your home was built before 1979, the texturing material likely contains **Asbestos**. Do not scrape it dry. You must send a sample to a lab ($30 test) before disturbing it. If positive, you need an abatement team.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Water dripping through your light fitting? Follow our emergency guide to isolating the stopcock, relieving plasterboard pressure, and understanding 'Trace and Access' insurance cover.** For help with other leaks, see our [Emergency Plumber Guide](/blog/5-signs-you-need-emergency-plumber-gb).

---

#### 1. The "Golden Minute" Safety Guide
Water leaking through a ceiling is a Tier-1 home emergency. It compromises the structural integrity of your home and creates a lethal electrical hazard. In the UK, with our mix of Victorian, Edwardian, and New Build properties, the behavior of a wet ceiling varies wildly.

*   **Modern Homes (Post-1950):** Likely **Plasterboard**. It absorbs water, sags, turns to mush, and collapses in large sheets.
*   **Period Homes (Pre-1950):** Likely **Lath and Plaster**. Heavy lime plaster keyed onto wooden slats. When the wooden laths swell with water, they snap the "keys," causing the entire heavy ceiling to detach in one massive slab. This is a severe injury risk.

#### 2. Immediate Action: The "Bucket and Poke" Method
Do not watch the bubble grow.
1.  **Bucket:** Place a bucket under the bulge.
2.  **Pierce:** Use a screwdriver to puncture the lowest point of the blister or bulge.
3.  **Rationale:** By releasing the water, you reduce the weight on the plaster/board. A 1m x 1m section of saturated lath and plaster can weigh 50kg. You want that water in the bucket, not holding inside the ceiling.

#### 3. Step 2: Isolating the Water (The Stopcock Hunt)
You must stop the flow.
*   **Mains Water:** Located at the **Internal Stopcock**. Check under the kitchen sink, in the downstairs toilet, or under the stairs. Turn it clockwise to close.
*   **Tank Fed:** If you are in an older house with a "Cold Water Storage Tank" in the loft, the leak might be from the tank itself or its overflow.
*   **Isolation Valves:** Modern sinks and toilets have "Service Valves" (silver slot-screw valves) on the pipes feeding them. Turn the screw 90 degrees to isolate just that fixture.

#### 4. The Electrical Hazard: Pendant Lights
Water seeks the lowest point. In a ceiling, that is often the hole drilled for your light fitting (Rose/Pendant).
*   **The Danger:** If water is dripping from the light bulb or the plastic rose, the circuit is LIVE and wet. The water may look clean, but it has passed through dirty joists and insulation—it is conductive.
*   **Protocol:** Go to your **Consumer Unit** (Fuse Box). Flip the MCB labeled "Lighting" (usually the 6Amp breaker) to the OFF position. Do not touch the light switch. Refer to [NICEIC Safety Guidance](https://www.niceic.com/find-a-contractor/electrics-explained) for more.

#### 5. Section: The Flat Roof Failure (UK Case Study)
In the UK, "Flat Roofs" on kitchen extensions or garages are notorious for leaking. Felt roofs have a lifespan of 10-15 years. If the leak occurs during a storm, it is likely ingress.
*   **Emergency Fix:** Do not go on the roof in a storm. Use buckets. If the ceiling is bowing, prop it if safe. Call an emergency roofer who offers "Tarping" (tarpaulin) services.

#### 6. Appendix A: 50-Item Master UK Ceiling & Leak Glossary
1.  **Plasterboard:** Gypsum sheet (9.5mm or 12.5mm).
2.  **Skim:** Thin layer of finishing plaster.
3.  **Lath:** Thin wooden strips in old ceilings.
4.  **Joist:** Structural timber beam.
5.  **Cornice/Coving:** Decorative molding at wall edge.
6.  **Artex:** Textured finish (Asbestos risk pre-2000).
7.  **Rose:** Plastic ceiling light base.
8.  **Pendant:** Hanging light wire.
9.  **Downlight:** Recessed spot light (Gu10).
10. **Transformer:** Power pack for 12V lights.
11. **Stopcock:** Main water valve.
12. **Gate Valve:** Red wheel valve (often seized).
13. **Ballcock:** Float valve in loft tank.
14. **Overflow:** Warning pipe (dripping outside).
15. **Cistern:** Toilet tank.
16. **Immersion Heater:** Hot water tank heater.
17. **Cylinder:** Hot water storage (Copper).
18. **Header Tank:** Small expansion tank in loft.
19. **Speedfit:** Plastic push-fit pipe.
20. **Compression:** Nut and olive joint.
21. **Solder Ring:** Yorkshire fitting.
22. **Flex:** Flexible braided hose.
23. **Waste Pipe:** 40mm pipe from bath.
24. **Soil Pipe:** 110mm pipe from toilet.
25. **Trap:** U-bend under sink.
26. **Gulley:** Outside drain grid.
27. **Felt:** Bitumen roof covering.
28. **Lead Flashing:** Waterproofing around chimneys.
29. **Ridge Tile:** Top roof tile.
30. **Slate:** Natural stone roof tile.
31. **Valley:** Metal channel between roofs.
32. **Soffit:** Under roof overhang.
33. **Fascia:** Board holding the gutter.
34. **Gutter:** Rain channel.
35. **Downpipe:** Pipe to ground.
36. **Hopper:** Box catching water from upstream.
37. **Megger:** Insulation resistance tester.
38. **RCD:** Trip switch.
39. **Bonding:** Earth safety wire.
40. **Consumer Unit:** Fuse box.
41. **Trace and Access:** Insurance term for finding leaks.
42. **Excess:** Amount you pay on claim.
43. **Loss Adjuster:** Insurance investigator.
44. **Make Safe:** Emergency temporary repair.
45. **Dehumidifier:** Drying machine.
46. **Hygrometer:** Moisture meter.
47. **Rot:** Wet/Dry timber decay.
48. **Acrow Prop:** Metal support pole.
49. **Batten:** Wood strip for fixing tiles.
50. **Vapour Barrier:** Plastic sheet.

#### 7. The Insurance Game: "Trace and Access"
UK home insurance policies often have a clause called **"Trace and Access"**.
*   **The Problem:** The pipe is buried under the floor or in the wall. Smashing the bathroom tiles to find it costs £1,000. The pipe repair costs £50.
*   **The Cover:** "Trace and Access" pays for the *damage caused to find the leak* (the tiles) and the *making good* (re-tiling). It often does NOT pay for the plumbing repair itself (the £50 part).
*   **The Ceiling:** The water-damaged ceiling is "Consequential Damage" and is almost always covered.
*   **Betterment:** Insurers won't pay to upgrade old pipes, only to put you back to "pre-loss condition."

#### 8. Section: Who Do You Call? (The UK Trade Hierarchy)
1.  **Emergency Plumber:** To stop the leak.
2.  **Restoration Company (Rainbow/Polygon):** For drying and sanitising.
3.  **Electrician:** Essential if water touched the lights. They issue a "Minor Works Certificate" to say it's safe.
4.  **Plasterer:** To re-board and skim the ceiling.

#### 9. 20-Step UK Ceiling Restoration Checklist
1.  **Isolate:** Stopcock off.
2.  **Drain:** Bucket/Poke.
3.  **Electrics:** Lighting circuit off.
4.  **Contents:** Move sofa/TV.
5.  **Plumber:** Fix the leak.
6.  **Insurance:** Check policy / call line.
7.  **Assessment:** Is ceiling safe or bowed?
8.  **Strip Out:** Pull down wet plasterboard (bag it).
9.  **Lath Check:** If lath & plaster, remove loose keys.
10. **Drying:** Rent commercial dehumidifier.
11. **Ventilation:** Open windows (if not humid out).
12. **Anti-fungal:** Spray timbers to stop rot.
13. **Moisture Check:** Protimeter test.
14. **Electric Test:** Electrician checks cables.
15. **Re-board:** 12.5mm foil-backed board if bathroom above.
16. **Tape & Joint / Skim:** Plaster finish.
17. **Mist Coat:** Diluted paint primer.
18. **Top Coat:** Ceiling emulsion.
19. **Carpet Clean:** Wet vac floors.
20. **Claim:** Submit receipt to insurance.

#### 10. FAQ Section (Infinite Depth)
**Q: My ceiling is stained brown but feels dry. What is it?**
A: This is an "Historic Leak" or "Ghost Leak". It often means a pipe drips only occasionally (e.g., when the shower overflow is used, or wind blows rain in a certain direction). The brown ring is "tannin" or mineral deposits left behind. You must seal it with a stain-blocker paint before decorating, or the mark will bleed through forever.

**Q: Can I claim for a "Slow Leak"?**
A: **Often No.** Insurers cover "Sudden and Unforeseen" events. A shower tray that has been leaking for 3 years because the silicone sealant failed is considered "Wear and Tear" / "Maintenance Issue" and is usually denied. This is why you must fix leaks the moment they appear.

**Q: What is Awaab's Law (for Tenants)?** If you rent (Social Housing), **Awaab's Law** compels landlords to investigate damp and mold hazards within **14 days** and begin repairs within **7 days**. A major ceiling leak is a Category 1 hazard. If your landlord ignores you, they are breaking the law. See [UK Gov Awaab's Law Guidance](https://www.gov.uk/government/publications/carbon-monoxide-alarms-in-rented-and-owned-homes-guidance).
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 2 Insertion (Water Leak) ---');

    // 1. Handle US Version (Rename existing 'water-leaking-through-ceiling-first-steps' -> '...-us')
    console.log('Inserting US Version (and renaming base if needed)...');

    // First, try to find the BASE post
    const { data: baseData } = await supabase.from('posts').select('id').eq('slug', 'water-leaking-through-ceiling-first-steps').single();

    if (baseData) {
        console.log('Found base post. Updating to US version...');
        const { error: errorUpdateBase } = await supabase
            .from('posts')
            .update({
                content: us_content,
                slug: 'water-leaking-through-ceiling-first-steps-us', // RENAME
                title: "Water Leaking From Ceiling? The 5-Minute 'Stop the Collapse' Protocol (US Edition)",
                excerpt: "Ceiling bulging with water? Learn the 'Bucket and Poke' method to prevent a collapse and save your home. US Insurance & Safety Guide 2025."
            })
            .eq('slug', 'water-leaking-through-ceiling-first-steps');
        if (errorUpdateBase) console.error('Error renaming base:', errorUpdateBase);
    } else {
        // Base not found, check if US already exists
        console.log('Base post not found. Checking for existing US version...');
        const { error: errorUpdateUS } = await supabase
            .from('posts')
            .update({
                content: us_content,
                title: "Water Leaking From Ceiling? The 5-Minute 'Stop the Collapse' Protocol (US Edition)",
                excerpt: "Ceiling bulging with water? Learn the 'Bucket and Poke' method to prevent a collapse and save your home. US Insurance & Safety Guide 2025."
            })
            .eq('slug', 'water-leaking-through-ceiling-first-steps-us');
        if (errorUpdateUS) console.error('Error updating US:', errorUpdateUS);
    }

    // 2. Handle GB Version (Insert clean new row if not exists)
    console.log('Inserting UK Version...');

    // Check if GB exists
    const { data: gbData } = await supabase.from('posts').select('id').eq('slug', 'water-leaking-through-ceiling-first-steps-gb').single();

    if (gbData) {
        console.log('GB Version exists. Updating...');
        const { error: errorUpdateGB } = await supabase
            .from('posts')
            .update({
                content: gb_content,
                title: "Water Leaking Through the Ceiling? The 'Golden Minute' Safety Guide (UK Edition)",
                excerpt: "Water in your light fitting? Follow our emergency guide to isolating the stopcock and preventing ceiling collapse. UK Insurance & Safety Guide 2025."
            })
            .eq('slug', 'water-leaking-through-ceiling-first-steps-gb');
        if (errorUpdateGB) console.error('Error updating GB:', errorUpdateGB);
    } else {
        console.log('GB Version missing. Inserting new row...');
        const { error: errorInsertGB } = await supabase
            .from('posts')
            .insert([{
                slug: 'water-leaking-through-ceiling-first-steps-gb',
                title: "Water Leaking Through the Ceiling? The 'Golden Minute' Safety Guide (UK Edition)",
                content: gb_content,
                excerpt: "Water in your light fitting? Follow our emergency guide to isolating the stopcock and preventing ceiling collapse. UK Insurance & Safety Guide 2025.",
                cover_image: "/blog/water-leak/cover.jpg", // Use existing image
                published: true
            }]);
        if (errorInsertGB) console.error('Error inserting GB:', errorInsertGB);
    }

    console.log('--- Batch 2 (Water Leak) Complete ---');
}

insertRegionalBatch();
