import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const content = `**If you smell burning fish or see sparks from your consumer unit, evacuate now and call 999 or an emergency electrician.**

---

#### 1. The Anatomy of a UK Electrical Emergency
In the United Kingdom, our domestic electrical systems are unique on the global stage. Born from the post-World War II copper shortage, the **Ring Final Circuit** remains the backbone of British residential wiring. This topology, while efficient, introduces specific failure modes that can remain hidden until the moment of crisis. 

#### 2. Section: The Welsh Housing Stock Challenge (Case Study)
In Wales, a high proportion of terraced housing and rural cottages presents a unique electrical challenge. Damp environments in valleys lead to 'Verdigris'—a green corrosion on copper terminals. This corrosion increases resistance, leading to heat and fire. In 2024, the Welsh government has increased scrutiny on 'Electrical Safety in the Private Rented Sector'. If you live in a coastal property in Pembrokeshire or a terrace in the Valleys, your emergency electrician must be aware of 'Salt-Air Corrosion'.

#### 3. Sign #1: The "Fishy Smell" (Trimethylamine Release)
Perhaps the most alarmingly distinctive indicator of electrical failure in UK homes is a smell resembling **rotting fish or urine**. This is the scent of **Trimethylamine**, a chemical released when the Urea-formaldehyde plastic in older electrical sockets and light switches begins to break down due to extreme heat. If you smell this, a fire is literally mid-ignition inside your walls.

#### 4. Section: The Science of the 'Lost Neutral' in the UK
A 'Lost Neutral' is a catastrophic utility failure. In the UK, our 3-phase street distribution means that if a neutral wire breaks in the street, your house can be flooded with 400V instead of the standard 230V. This will literal catch your boiler, TV, and fridge on fire. The primary signs are wildly flickering lights and 'surging' behavior. If you notice this, evacuate and call the **National Grid** immediately.

#### 5. Appendix A: 50-Item Master UK Electrical Safety Glossary
1. **AFDD:** Arc Fault Detection Device.
2. **BS 7671:** The Wiring Regulations.
3. **Consumer Unit:** Modern name for a fuse box.
4. **Continuity:** An unbroken electrical path.
5. **Double Insulated:** Appliance needing no earth.
6. **Earthing:** Safety wire to the ground.
7. **EICR:** Electrical Installation Condition Report.
8. **ELV:** Extra Low Voltage (under 50V).
9. **Fused Spur:** Connection for fixed appliances.
10. **IP Rating:** Degree of water protection.
11. **Lumber:** Informal term for cable types.
12. **Main Switch:** The master power isolator.
13. **MCB:** Miniature Circuit Breaker.
14. **NAPIT:** Trade body for inspectors.
15. **NICEIC:** The main electrical regulator.
16. **Part P:** Building safety regulation.
17. **RCD:** Residual Current Device (Trip-switch).
18. **Ring Main:** The standard UK loop circuit.
19. **SELV:** Separated Extra Low Voltage.
20. **Voltage Drop:** Power loss over a cable length.
21. **13A Plug:** The standard British 3-pin plug.
22. **Terminals:** Where wires are screwed in.
23. **Live:** The brown (active) wire.
24. **Neutral:** The blue (return) wire.
25. **Earth:** The green/yellow (safety) wire.
26. **Trunking:** Plastic wire covering.
27. **Grommet:** Protection for wire entry.
28. **Back Box:** Metal box behind a socket.
29. **Chasing:** Cutting a groove in a wall for wires.
30. **Megger:** Brand name for insulation tester.
31. **RCBO:** RCD and MCB combined in one.
32. **TT System:** Earth provided via a rod.
33. **TN-S System:** Earth provided via the cable sheath.
34. **TN-C-S System:** Earth and neutral combined at origin.
35. **Busbar:** Copper bar inside the consumer unit.
36. **Knockout:** Pre-cut hole in a back box.
37. **Pattress:** Surface-mounted back box.
38. **Spur:** A branch off a ring circuit.
39. **Twin and Earth:** The standard grey cable.
40. **Flex:** Multistorey appliance cable.
41. **Insulation Resistance:** Measuring wire health.
42. **Earth Fault Loop Impedance:** Safety speed test.
43. **Polarity:** Ensuring Live/Neutral aren't swapped.
44. **Harmonics:** Distortions in power quality.
45. **Load Shedding:** Cutting power to save the grid.
46. **Photovoltaic:** Solar power systems.
47. **Three Phase:** Industrial grade power (400V).
48. **Single Phase:** Domestic power (230V).
49. **Junction Box:** Where wires are split.
50. **Safe Zones:** Where wires are legally allowed in walls.

#### 6. Section: The 150-Year History of UK Electrical Standards
From the first street lighting in Godalming (1881) to the **18th Edition** of the Wiring Regulations today, the UK has prioritized safety. The 'Ring Final' was a Stroke of genius in 1947 to save copper, but it requires 'Bridge Testing' to ensure the ring isn't broken. If a ring breaks, it becomes two 'Radials'—drawing more current than the wire can handle, leading to hidden fires. In 2025, the addition of **AFDDs** is the biggest jump in safety since the RCD in the 1970s.

#### 7. Section: 20-Step UK Electrical Restoration Protocol
1. **Fault Finding:** Using a 'Megger' to find low insulation resistance.
2. **Thermal Imaging:** Spotting hot breakers before they fire.
3. **Consumer Unit Upgrade:** Replacing old 'Rewirable' fuse boards.
4. **Ring Continuity Test:** Ensuring the loop is solid.
5. **Polarity Verification:** Checking no wires are reversed.
6. **Earth Bonding:** Connecting gas/water pipes to the consumer unit.
7. **RCD Timing Test:** Ensuring the trip happens in <40ms.
8. **Faulty Socket Swap:** Replacing urea-formaldehyde with thermosetting plastic.
9. **Cable Re-routing:** Moving cables out of 'illegal' wall zones.
10. **Load Analysis:** Checking if an EV charger will melt the main fuse.
11. **Sanitisation:** Cleaning soot from walls after an arc.
12. **Smoke Alarm Integration:** Linking alarms to the electrical system.
13. **Certification:** Issuing the EIC (Electrical Installation Certificate).
14. **Utility Coordination:** Working with the DNO if the cutout fuse is blown.
15. **Surge Protection:** Installing Type 2 SPDs to protect smart homes.
16. **Arc Fault Protection:** Adding AFDDs to high-risk bedroom circuits.
17. **Full Re-wire:** If VRI or lead-sheathed cables are found.
18. **Chasing and Filling:** Making good the walls after a repair.
19. **Lighting Upgrade:** Switching to fire-rated LED downlights.
20. **Final Handover:** Explaining the new board functions to the homeowner.

#### 8. Section: The 2025 Smart Meter & Fire Safety Risk
In the UK, the "Smart Meter Rollout" has seen millions of meters installed. However, there have been reports of 'Overheating Terminal Blocks' where the meter connects to the house. If you see a digital display on your meter that is 'faded' or if the enclosure feels hot, the utility wires are loose. This is a fire risk that is NOT the responsibility of your electrician—you must call your **Energy Supplier** immediately.

#### 9. Section: In-Depth Breakdown of Trimethylamine Failure
The "Fishy Smell" is Trimethylamine. The Urea-formaldehyde plastic in older UK sockets begins 'Carbon Tracking'. This forms a path of conductive charcoal across the insulator. Once this path is complete, the electricity flows through the plastic itself, creating a 1,000-degree arc. Modern 2025 sockets are made of "Thermosetting" plastics.

#### 10. Appendix B: UK 12-Month Electrical Safety Roadmap
*   **Jan:** Check portable heaters for frayed cords.
*   **Feb:** Press the 'Test' button on all RCDs.
*   **Mar:** Inspect outdoor lighting for water ingress.
*   **Apr:** Check loft wiring for signs of rodent damage.
*   **May:** Verify all appliances are fused correctly (3A vs 13A).
*   **Jun:** Test lawnmower and power tool RCDs.
*   **Jul:** Inspect electric shower pull-cord switches.
*   **Aug:** Clean kitchen socket faces to prevent grease build-up.
*   **Sep:** Book a formal EICR if your board is >10 years old.
*   **Oct:** Check the earthing clamp on your water main.
*   **Nov:** Audit Christmas lights for safety.
*   **Dec:** Verify battery backups in smoke alarms.

#### 11. FAQ Section (True Depth)
**Q: My lights flicker only when the neighbor uses their power. Why?**
A: This could be a "Neutral Fault" in the street. In the UK, the electricity grid is shared among several houses on a single 'Phase'. If the neutral connection to the street main becomes corroded or loose, it can 'float'. This means your household voltage can swing wildly from 100V to 400V depending on what appliances your neighbors are using. This is a level-one emergency. If you see lights suddenly getting brighter or smelling something burning from your TV or PC, shut off your main switch and call 105 (the national power network number) immediately.

**Q: What is a "Part P" registered electrician?**
A: Part P is a part of the Building Regulations in England and Wales. It requires that most electrical work in dwellings is carried out by a 'Competent Person'. This ensures that the work is not only safe but is also officially recorded with the local authority. If you hire an emergency electrician who is not Part P registered, you may find it difficult to sell your home later as you won't have the 'Compliance Certificate'. In 2025, the penalties for non-compliant electrical work have increased, and insurance companies may refuse to pay out for fires caused by non-certified modifications.

**Q: My consumer unit is "buzzing." Is that normal?**
A: **No.** A buzzing sound (often called 'mains hum' when quiet, but 'crackling' when dangerous) indicates a loose connection or a failing circuit breaker. In UK consumer units, the copper busbar is held in place by screw terminals. Over time, the thermal cycling (heating and cooling) of the electricity can cause these screws to back out slightly. This creates a high-resistance joint that generates heat. If not addressed, the plastic in the consumer unit will eventually melt or catch fire. An emergency electrician will use a 'Torque Screwdriver' to tighten these connections to the manufacturer's exact specification (usually 2.5Nm to 3Nm).
`;

async function insertSingle() {
    console.log('Inserting UK Electrical Guide (Hyper-Expanded)...');
    const { error } = await supabase
        .from('posts')
        .update({ content: content })
        .eq('slug', 'electrical-fire-warning-signs-gb');

    if (error) console.error(error);
    else console.log('Successfully updated.');
}

insertSingle();
