import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Baseball through the living room window? Hurricane warning? Leaving your home vulnerable is an invitation to thieves and water damage. Here is the US homeowner's guide to Emergency Boarding Up.**

---

#### 1. The Material Standard: 5/8" CDX Plywood
Do not use cardboard. Do not use plastic wrap.
*   **Why Plywood?** It provides structural rigidity and security. "CDX" is the grade (C-face one side, D-face other, X for Exterior glue). It withstands rain for months.
*   **Thickness:** 5/8 inch is the minimum for security. 1/2 inch can be kicked through. 3/4 inch is too heavy for one person to lift safely on a ladder.

#### 2. Installation Method 1: The "Hurricane Clip" (Plylox)
If you have brick or masonry siding, you cannot nail into it easily.
*   **The Tech:** Use H-shaped carbon steel tension clips (e.g., Plylox). You push them onto the edge of the plywood and then push the plywood into the window recess. The teeth bite into the brickwork.
*   **The Benefit:** No drilling, no holes, removal takes seconds (from the inside).
*   **The Cost:** ~$1 per clip. You need 4 per window minimum.

#### 3. Installation Method 2: The "Stud Main" Screw
If you have wood or vinyl siding:
*   **The Error:** Do NOT screw into the vinyl frame. You will destroy the thermal seal and the window is ruined.
*   **The Correct Way:** Cut the plywood 4 inches wider than the window. Screw *through* the plywood into the structural studs *around* the window frame. Use 3-inch deck screws to bite deep into the wood framing.

#### 4. Legal Context: "Attractive Nuisance"
Why must you board up?
*   **The Law:** Under the "Attractive Nuisance" doctrine, property owners can be held liable if a child trespasses and gets hurt on your property (e.g., cuts themselves on broken glass).
*   **Insurance:** Most Homeowners policies (HO-3) have a "Duty to Mitigate" clause. If a window breaks and you leave it open, and rain ruins your hardwood floors, the insurance will pay for the window but **DENY** the floor claim because you failed to mitigate.

#### 5. Safety First: Handling Shards
*   **PPE:** Heavy leather work gloves (not gardening gloves). Safety goggles.
*   **The Tape Trick:** Before removing jagged glass still in the frame, cover it with duct tape in a criss-cross pattern. This holds the shards together so they don't explode in your face when you pull.

#### 6. The 12-Month Security & Storm Calendar
*   **Jan:** Audit window locks. Do they latch fully?
*   **Feb:** Check basement windows (often forgotten/rotted).
*   **Mar:** Test glass break sensors on your alarm system.
*   **Apr:** Buy 2 sheets of plywood *before* hurricane season starts. Store them in the garage.
*   **May:** Trim bushes covering windows (Burglar cover).
*   **Jun:** Check the sliding door "anti-lift" block.
*   **Jul:** Inspect window screens (keep bugs out, but offer zero security).
*   **Aug:** Practice installing one board if you live in a hurricane zone.
*   **Sep:** Check storm window weeping holes.
*   **Oct:** Locking check before winter.
*   **Nov:** Holiday travel prep (timers on lights).
*   **Dec:** Verify your insurance deductible for "Wind/Hail."

#### 7. Glossary of US Boarding Terms
1.  **CDX:** Exterior grade plywood.
2.  **Glazing:** The glass pane.
3.  **Impact Glass:** Laminated glass that resists shattering (Miami-Dade Code).
4.  **Lite:** A single pane of glass.
5.  **Mullion:** The vertical bar separating windows.
6.  **OSB:** Oriented Strand Board (Chipboard - swells when wet, avoid if possible).
7.  **Sash:** The movable part of the window.
8.  **Tempered Glass:** Safety glass that crumbles into cubes (Door glass).
9.  **Tapcon:** Blue screw for concrete/brick.
10. **Plylox:** Tension clips for brick windows.

#### 9. Case Study: The "Hurricane Ian" Failure (Florida)
*   **The Scenario:** A homeowner used 1/4 inch plywood (too thin) and drywall screws (too brittle) to board up for a Cat 4 storm.
*   **The Failure:** The wind pressure snapped the screws. The plywood flew off, smashed into the neighbor's car, and the window broke anyway.
*   **The Damage:** Rain entered the home for 6 hours. $40,000 in mold/water damage.
*   **The Lesson:** Use 5/8 inch CDX ply and 3-inch Deck Screws (or Plylox clips).

#### 10. Cost Breakdown: Boarding vs. New Glass (2025)
| Item | Cost (Material) | Pro Install Cost | Total |
| :--- | :--- | :--- | :--- |
| **Emergency Board Up** | $50 (2 sheets) | $300 - $500 (After Hours) | $350 - $550 |
| **Single Pane Replace**| $100 | $200 | $300 |
| **Double Pane (IGU)** | $200 - $400 | $300 | $500 - $700 |
| **Sliding Door Glass** | $500+ | $600 | $1,100+ |
| **Impact Glass (Cane)** | $800+ | $500 | $1,300+ |

#### 11. Insurance Note: "Loss of Use"
If the broken window makes the home uninhabitable (e.g., freezing temp, security risk):
*   **Coverage D (Loss of Use):** Pays for your hotel while the glass is on order (which can take 3 weeks).
*   **Requirement:** You must board it up ("mitigate") to protect the rest of the house to trigger this coverage.

#### 12. FAQ Section
**Q: Can I use the "Blue Film" I see on construction sites?**
A: **Temporary only.** That is "Collision Film." It keeps rain out but offers zero security against a burglar with a knife. Use plywood for overnight security.

**Q: My window is double pane. Only the outside broke. Do I board it?**
A: **Yes.** The inner pane is not designed to withstand wind load or impact alone. It is now structurally compromised. Board it up to protect the seal and the inner glass.

**Q: Do I need to paint the plywood?**
A: **Yes.** If it will be up for more than 2 weeks, rain will delaminate the wood. A quick coat of cheap exterior paint prevents warping.
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Panel smashed in the front door? Sash window broken? An unsecured home invalidates your insurance. Here is the UK guide to Emergency Glazing and Boarding.**

---

#### 1. The UK Context: uPVC and Thermal Breaks
90% of UK homes use white uPVC double glazing.
*   **The Golden Rule:** Never, ever drill directly into the uPVC frame. It contains steel reinforcement and multi-chamber thermal breaks. Once drilled, water will get in, the steel will rust, and the unit is ruined.
*   **The Solution:** You must use the "Sandwich Method" or "Batten Method."

#### 2. The Batten Method (Non-Destructive)
How to secure a window without screws:
1.  **Cut two boards:** One for the inside, one for the outside. They should be slightly larger than the opening.
2.  **Drill Holes:** Drill matching holes through both boards.
3.  **The Bolt:** Pass a "Carriage Bolt" (rounded head) from the outside, through the gap where the glass was (or through the broken glass), and tighten a nut on the inside board.
4.  **The Clench:** This sandwiches the frame between the wood blocks. It is secure, watertight, and leaves no holes in the plastic.

#### 3. Legal Context: Squatters (LASPO Act 2012)
Why board up empty properties?
*   **The Law:** Since 2012, squatting in a *residential* building is a criminal offense (Section 144 of LASPO). Police can arrest them.
*   **The Loophole:** Squatting in *commercial* property is still a civil matter. If you have an empty shop with a broken window, get it boarded instantly, or you face a 6-month eviction battle.
*   **Section 6:** A "Section 6 Notice" on the door warns that there are people living inside and entry without a warrant is a crime. Boarding prevents them getting in to put the notice up!

#### 4. Safety Film (The Invisible Board)
If you can't stand the look of plywood (e.g., a shop front):
*   **The Tech:** 175-micron Safety Film.
*   **Application:** It sticks the shards together and holds them in the frame. It turns standard glass into "Laminated Glass."
*   **Security:** It prevents "Reach Through" burglary. You can smash the glass, but you can't push it in.

#### 5. Insurance: The "Key Operated Lock" Clause
Check your policy.
*   **The Clause:** "All accessible windows must be fitted with key-operated locks."
*   **The Reality:** If a burglar smashes a small pane, reaches in, and opens the handle because you didn't lock it with the key, your claim is **VOID**.
*   **Boarding Up:** If you board up, you are technically "securing" the opening, re-validating the policy until the glazier arrives.

#### 6. The 12-Month UK Security Calendar
*   **Jan:** Check shed windows (often weak spots).
*   **Feb:** Inspect extensive storm damage to greenhouse glass.
*   **Mar:** Test window keys. Do you know where they are? (Fire risk if lost).
*   **Apr:** Lubricate uPVC hinges (WD-40 Specialist Silicone, NOT standard WD-40).
*   **May:** Check for "Misted Units" (failed seals). Replace glass, not frames.
*   **Jun:** Secure "Sash Jammers" to vulnerable back doors.
*   **Jul:** Leave vent windows locked in "Night Vent" position, not wide open.
*   **Aug:** Holiday check: Ask a neighbor to park in your drive.
*   **Sep:** Check outdoor security lights (PIR).
*   **Oct:** Close curtains at dusk (don't display goods).
*   **Nov:** Bonfire night safety (Keep windows closed).
*   **Dec:** Don't put presents under the tree in view of the window.

#### 7. Glossary of UK Glazing Terms
1.  **Beading:** The plastic strip holding the glass in.
2.  **Casement:** A hinged window opening outwards.
3.  **Double Glazed Unit (DGU):** The sealed glass packet.
4.  **Espag:** The metal locking strip inside the frame.
5.  **Float Glass:** Standard dangerous glass (breaks into shards).
6.  **K-Glass:** Thermal efficiency coating (Pilkington).
7.  **Laminated:** Glass with plastic middle (doesn't shatter).
8.  **Sash Jammer:** Extra rotating lock arm.
9.  **Spacer Bar:** The silver/black strip between panes.
10. **Toughened:** Safety glass (crumbles).
11. **Trickle Vent:** Air vent at the top of the frame.
12. **uPVC:** Unplasticized Polyvinyl Chloride (The white plastic).

#### 9. Case Study: The "Squatter Nightmare" in Bristol
*   **The Scenario:** A landlord had a rental property empty for 2 weeks between tenants. A brick was thrown through the back door window.
*   **The Mistake:** He taped cardboard over it, thinking "I'll fix it next week."
*   **The Outcome:** Squatters saw the vulnerability, peeled the tape, reached in, opened the door, and moved in.
*   **The Law:** Because they entered without "force" (through the hole), it was a civil matter. It took 4 months and £5,000 in legal fees to evict them.
*   **The Lesson:** Board up immediately and securely (Coach bolts).

#### 10. UK Emergency Glazing Costs (2025)
| Service | Material | After Hours Labour | Total |
| :--- | :--- | :--- | :--- |
| **Emergency Boarding** | £30 (OSB) | £150 - £250 | £180 - £280 |
| **Replace DGU (Small)**| £60 | £100 | £160 |
| **Replace DGU (Large)**| £120 | £150 | £270 |
| **Toughened Door Glass**| £200+ | £200 | £400+ |
| **Laminated Safety** | £150 | £150 | £300 |

#### 11. Insurance Note: "Unoccupied Clause"
*   **The 30-Day Rule:** Most policies downgrade cover if the home is empty for >30 days.
*   **Inspection Condition:** You must visit the property every 7 days and ensure it is "secure." A broken window = not secure = **No Cover**.

#### 12. FAQ Section
**Q: Can I just tape a bin bag over it?**
A: **No.** Police advise against it. It signals "This house is empty/vulnerable." It also provides zero insulation, meaning your pipes could freeze if it's winter.

**Q: How much does emergency boarding cost?**
A: **Expensive.** An emergency locksmith/glazier at 2 AM will charge £150 - £300. Doing it yourself with a sheet of OSB costs £20.

**Q: Will the glazier clean up the glass?**
A: **Yes.** But check if they take it away. Some charge extra for disposal. If you do it yourself, put it in a cardboard box, tape it shut, and write "BROKEN GLASS" on it before putting in the bin.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 4 Insertion (Boarding Up) ---');

    // 1. Handle US Version (Insert NEW)
    console.log('Inserting US Version...');
    const { error: errorInsertUS } = await supabase
        .from('posts')
        .upsert({
            slug: 'emergency-boarding-up-plywood-us',
            title: "Broken Window? The US Homeowner's Guide to Emergency Boarding Up",
            content: us_content,
            excerpt: "Glass smashed? Don't use cardboard. Step-by-step guide to 5/8\" Plywood, 'Plylox' hurricane clips, and 'Attractive Nuisance' insurance laws.",
            cover_image: "/blog/windows/boarding-up.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);

    // 2. Handle UK Version (Insert NEW)
    console.log('Inserting UK Version...');
    const { error: errorInsertUK } = await supabase
        .from('posts')
        .upsert({
            slug: 'emergency-boarding-up-glazing-gb',
            title: "Smashed Window? The UK Guide to Emergency Glazing & Boarding",
            content: gb_content,
            excerpt: "Break-in or storm damage? How to board up uPVC windows without drilling the frame (Batten Method). Plus Squatters rights and Safety Film.",
            cover_image: "/blog/windows/boarding-up-uk.png",
            published: true
        }, { onConflict: 'slug' });

    if (errorInsertUK) console.error('Error inserting UK:', errorInsertUK);

    console.log('--- Batch 4 (Boarding Up) Complete ---');
}

insertRegionalBatch();
