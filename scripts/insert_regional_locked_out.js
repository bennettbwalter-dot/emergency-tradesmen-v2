import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------------------------------------------------------
// US CONTENT
// ------------------------------------------------------------------
const us_content = `**Getting locked out at 2 AM is a nightmare. Finding out your 'locksmith' is a scammer who drilled your $300 smart lock is a tragedy. Learn the 2025 rules of engagement.**

---

#### 1. The "Scammer" Warning: The Drill & Grill
The locksmith industry in the US is plagued by "Lead Gen" call centers. You call a local number, but it routes to a call center in another state. They quote "$29 service call," but send an untrained subcontractor.
*   **The Scam:** The technician arrives in an unmarked car. They look at your standard Schlage deadbolt and say, "This is a high-security lock, nobody can pick this. I have to drill it."
*   **The Truth:** 90% of residential locks in the US (Kwikset, Schlage, Defiant) can be picked or "bumped" in under 2 minutes by a real pro.
*   **The Check:** Look for a marked vehicle. Ask for their state Locksmith License (required in states like CA, TX, NC). If they drill perfectly good locks immediately, **fire them on the spot.**

#### 2. Non-Destructive Entry Methods
Pro locksmiths pride themselves on "Zero Damage" entry.
*   **Picking:** Using a tension wrench and rake/hook to align the pins.
*   **Bumping:** Using a specially cut "Bump Key" and a mallet to kinetic-shock the pins open. (Note: High-security locks like Medeco are bump-proof).
*   **Loiding:** The "Credit Card" trick. Only works on spring-latch knobs, NOT deadbolts. If you only locked the doorknob, you're in luck.

#### 3. Smart Locks: The 2025 Challenge
With 40% of US homes using Smart Locks (August, Yale, Schlage Encode), battery failure is the #1 lockout cause.
*   **The 9V Jump:** Most keyless smart locks have two small terminals on the bottom of the exterior keypad. Touch a standard 9V battery to these terminals to give it enough juice to unlock locally.
*   **The Hidden Cylinder:** Many smart locks have a magnetic faceplate that pops off to reveal a standard keyhole. Did you keep the backup key?

#### 4. Cost Guide (2025 US National Average)
*   **Service Call (Trip Charge):** $75 - $150 (Higher on nights/weekends).
*   **Standard Re-Key:** $25 - $50 per cylinder (Cost to change the key, not the lock).
*   **Lockout Service:** $100 - $200 total.
*   **Drill & Replace:** $300+.

#### 5. Section: Auto Lockouts (Slim Jim is Dead)
If you lock your keys in a 2025 Ford F-150, a "Slim Jim" will destroy the side airbags and disconnect the door logic board. Modern pros use "Lishi" picks to decode the door lock purely through the keyhole, or use a "Long Reach" tool with an air-wedge.

#### 6. Appendix A: 50-Item Master US Locksmith Glossary
1.  **ANSI Grade 1:** Commercial security (Highest).
2.  **ANSI Grade 3:** Residential standard (Lowest).
3.  **Backset:** Distance from door edge to hole center (2-3/8" or 2-3/4").
4.  **Bitting:** The cut depth of a key.
5.  **Bump Key:** 999-depth key for kinetic entry.
6.  **Cam:** The tailpiece allowing lock rotation.
7.  **Code Cutting:** Making a key from a numeric code.
8.  **Cylinder:** The part the key enters.
9.  **Deadbolt:** Lock bolt that cannot be "shimmed".
10. **Deadlatch:** Spring latch with anti-shim plunger.
11. **Defiant:** Entry-level Home Depot brand.
12. **Double Sided Deadbolt:** Keyed on both sides (Fire risk).
13. **Drill Point:** Specific spot to drill pins.
14. **Dummy Knob:** Non-functional decorative handle.
15. **Escutcheon:** Decorative plate around the lock.
16. **Extractor:** Tool to remove broken keys.
17. **Hook Pick:** Tool for single-pin picking.
18. **IC Core:** Interchangeable Core (Commercial).
19. **Impressioning:** Making a key by markings.
20. **Jamb:** The door frame leg.
21. **Key Alike (KA):** One key for all locks.
22. **Keyed Different (KD):** Unique keys.
23. **Keyway:** The shape of the plug entry.
24. **Kwikset:** Common US residential brand.
25. **Latch:** The spring-loaded bolt.
26. **Lishi:** Tool to decode auto locks.
27. **Lockout:** Enclosure of keys inside.
28. **Master Key:** Opens multiple disparate locks.
29. **Mortise Cylinder:** Threaded commercial cylinder.
30. **Night Latch:** Surface mounted auto-lock.
31. **Passage Knob:** Non-locking handle.
32. **Pins (Bottom):** Pins aimed by the key.
33. **Pins (Top):** Driver pins blocking the shear line.
34. **Plug:** The part that rotates.
35. **Privacy Knob:** Bathroom lock (coin open).
36. **Rake:** Tool for fast scrubbing entry.
37. **Rekey:** Changing pins, keeping hardware.
38. **Rim Cylinder:** Surface mount tailpiece type.
39. **Rose:** Round plate behind knob.
40. **Schlage:** Premium US residential brand.
41. **Shear Line:** Where pins align to turn.
42. **Shell:** The outer body of the cylinder.
43. **Shim:** Thin metal to bypass latch.
44. **Smart Key:** Kwikset's re-keyable technology.
45. **Spool Pin:** Security pin to stop picking.
46. **Strike Plate:** Metal plate on the jamb.
47. **Tailpiece:** Metal bar connecting lock to latch.
48. **Tension Wrench:** Tool to apply rotation torque.
49. **Thumbturn:** Interior twist knob.
50. **Tubular Lock:** Circle key (Vending machines).

#### 8. Section: The History of Lockpicking in America
From the warded locks of the Wild West to the pin-tumbler revolution of Linus Yale Jr. in 1861, American security has always been a race between the locksmith and the thief. The "Yale" lock changed everything by using varying pin lengths to prevent a simple skeleton key from turning the plug. However, in the 1920s, the "Bump Key" method was discovered by Danish locksmiths and later adopted by US criminals. Today, the rise of "Lishi" tools—originally designed for honest locksmiths to decode car doors—has made picking accessible to anyone with YouTube. This is why 2025 security relies not just on the lock, but on the **Door Jamb Armour**. A lock is only as strong as the wood it is bolted to.

#### 9. Technical Deep Dive: Smart Lock Vulnerabilities
Smart locks are convenient, but they introduce new risks.
*   **The Solenoid Bypass:** Some cheap smart locks use a solenoid to engage the clutch. A strong magnet placed on the outside of the lock can sometimes manipulate this solenoid, unlocking the door without a code.
*   **The Firmware Hack:** If your Wi-Fi lock hasn't been updated, it may be vulnerable to a "Replay Attack" where a hacker records your unlock signal and plays it back.
*   **Battery Acid Leak:** A forgotten alkaline battery can leak acid onto the circuit board, permanently disabling the electronic entry. 2025 Locking Protocols recommend Lithium AA batteries for all smart locks.

#### 10. The 12-Month Home Security Calendar
*   **Jan:** Lubricate all deadbolts with Graphite (Never WD-40).
*   **Feb:** Check strike plate screws. Replace 1-inch screws with 3-inch screws to hit the stud.
*   **Mar:** Test your Smart Lock battery level.
*   **Apr:** Clean the tracks of your sliding patio door (the weakest entry point).
*   **May:** Verify window locks are functional.
*   **Jun:** Trim hedges blocking the view of your front door.
*   **Jul:** Check garage door auto-reverse safety sensors.
*   **Aug:** Re-key locks if you gave a spare to a contractor.
*   **Sep:** Audit outdoor motion sensor lights.
*   **Oct:** Inspect door weatherstripping for gaps.
*   **Nov:** Test the "deadlatch" plunger on the front door (anti-shim test).
*   **Dec:** Verify your safe/lockbox combination is still known.

#### 11. FAQ Section
**Q: My key is stuck in the lock. Should I pull it with pliers?**
A: **No.** If you pull hard, the brass key will snap off inside the cylinder. Wiggle it gently while pushing the door in and out to relieve pressure on the bolt. If it snaps, you need a key extractor tool.

**Q: Is it illegal to own lockpicks?**
A: In most US states (like CA, NY), possession is legal *unless* intent to burglarize is proven. However, in states like TN or OH, possession of "burglar tools" can be stricter. Check your state penal code.

**Q: Can a locksmith open a safe?**
A: Yes, but it requires a specialized "Safe & Vault" certification. They will drill a microscopic scope hole to align the wheels. It is expensive ($300+).
`;

// ------------------------------------------------------------------
// UK CONTENT
// ------------------------------------------------------------------
const gb_content = `**Locked out? Before you agree to let someone drill your door, check if they are MLA approved. 95% of UK locks can be opened without damage.**

---

#### 1. The "Rogue Trader" Warning
The UK is seeing an epidemic of "Sticker Scammers" - fake locksmiths who slap stickers on every door in the neighborhood.
*   **The Drill:** Rogue traders love to drill locks because they can then sell you a cheap replacement cylinder for £100 (worth £10).
*   **The MLA Check:** A genuine expert will be a member of the **Master Locksmiths Association**. This means they are vetted, qualified, and CRB/DBS checked. Always ask to see the badge.

#### 2. UK Lock Types: Know Your Security
*   **Euro Cylinder:** The standard lock found on 90% of uPVC and composite doors.
*   **Mortice Lock (Chubb):** The heavy-duty lock found on wooden doors. Insurers require this to be **BS3621** rated (look for the British Standard Kitemark on the faceplate).
*   **Nightlatch (Yale):** The "slam" lock on the surface of the door.

#### 3. The "Lock Snapping" Threat (and the Fix)
Standard Euro Cylinders have a design flaw: they snap in half if twisted with mole grips. Burglars use this to open doors in 15 seconds.
*   **The Fix:** You must upgrade to **Anti-Snap** cylinders. Look for the **TS007 3-Star** rating or the **Sold Secure Diamond** standard. These cylinders have a "Sacrificial Cut" that breaks off the front tip, leaving the secure mechanism intact.

#### 4. Cost Guide (2025 UK Average)
*   **Call Out:** £65 - £120 (More in London/Out of Hours).
*   **Gain Entry (NDO):** £70 - £100.
*   **Replacement Cylinder:** £25 (Standard) to £65 (3-Star High Security).
*   **Mortice Lock Change:** £60+.

#### 5. Section: Tenant Rights
If you rent your home and the lock breaks due to wear and tear, the Landlord is responsible for the repair bill under Section 11 of the Landlord & Tenant Act. However, if YOU lost the key, you pay.

#### 6. Appendix A: 50-Item Master UK Locksmith Glossary
1.  **Anti-Bump:** Pins designed to resist kinetic attack.
2.  **Anti-Pick:** Spool/Mushroom pins.
3.  **Anti-Snap:** Sacrificial cut technology.
4.  **Backset:** Edge to keyhole distance (44mm/57mm).
5.  **Banham:** High-security London brand.
6.  **BS 3621:** British Standard for thief-resistant locks.
7.  **BS 8621:** Keyless egress (for flats/fire safety).
8.  **BS 10621:** Lockable egress (cannot open from inside).
9.  **Cam:** Rotating centre of Eurolock.
10. **Case:** The metal body of a mortice lock.
11. **Centres:** Distance between handle and keyhole (92mm/68mm).
12. **Chubb:** Traditional brand (Now Union/Yale).
13. **Claw Bolt:** Hook bolt for sliding doors.
14. **Code Lock:** Digital push button lock.
15. **Curtain Pick:** Tool for lever locks.
16. **Cylinder:** The barrel.
17. **Deadlock:** No latch, holding bolt only.
18. **Deadlocking Nightlatch:** Yale lock that can be double-turned.
19. **Detainer:** Moving discs (instead of levers).
20. **Diff:** The key difference number.
21. **Digital Lock:** Mechanical keypad.
22. **Double Glazing:** uPVC door/window context.
23. **Escutcheon:** Keyhole cover.
24. **Euro Cylinder:** Profile cylinder.
25. **Faceplate:** The metal strip on door edge.
26. **Follower:** Square hole for handle spindle.
27. **Gearbox:** The central mechanism of a Multipoint lock.
28. **Hinge Bolt:** Dog bolt protection.
29. **Hook Bolt:** Security bolt on uPVC.
30. **Keep:** The hole in the frame.
31. **Keyed Alike:** One key for front/back door.
32. **Kitemark:** BSI safety symbol.
33. **Latch:** Bevelled bolt.
34. **Lever:** Brass plate inside mortice lock.
35. **Lift Lever:** Handling requirement (Lift to lock).
36. **Master Key:** Opens suite of locks.
37. **MLA:** Master Locksmiths Association.
38. **Mortice:** The pocket cut into wood.
39. **Multipoint:** Strip lock with rollers/hooks.
40. **Nightlatch:** Rim lock.
41. **Oval Cylinder:** Oval shaped profile.
42. **Pass Key:** Skeleton key (historic).
43. **Rack Bolt:** Concealed bolts for windows.
44. **Rebate:** Doorframes with overlap.
45. **Rim Cylinder:** Round cylinder for nightlatch.
46. **Sashlock:** Latch + Deadbolt combined.
47. **Screw-in Cylinder:** Old metal door type.
48. **Snib:** Button to hold latch back.
49. **Sold Secure:** Testing house (Bronze/Silver/Gold/Diamond).
50. **Spindle:** Bar connecting handles.

#### 8. Section: The Great Train Robbery & The Chubb Lock
The name "Chubb" is synonymous with British security. In 1818, Jeremiah Chubb invented the "Detector Lock" which would jam if an unauthorized key was used, alerting the owner to an attempted break-in. This legacy continues today. The UK insurance industry's obsession with the **BS3621 Mortice Lock** stems from this tradition of heavy, physical engineering. Unlike American cylindrical locks, a British 5-lever Mortice lock is built like a tank inside the door itself, making it almost impervious to kicking.

#### 9. Technical Deep Dive: TS007 3-Star Accreditation
What does "3-Star" actually mean? It is a promise that the cylinder can withstand a sustained attack.
*   **Snap Resistance:** The cylinder must not snap to reveal the cam.
*   **Drill Resistance:** It must have hardened steel pins that shatter drill bits.
*   **Bump Resistance:** It must have "Trap Pins" that fire if a kinetic bump key is used.
*   **Pick Resistance:** It must use mushroom or spool pins to confuse a tension tool.
If your lock does not have the "3 Stars" (or the Sold Secure Diamond) stamped on the face, it is likely a standard "Budget" cylinder installed by the builder 10 years ago.

#### 10. The 12-Month UK Home Security Calendar
*   **Jan:** Spray PTFE lubricant into the Euro Cylinder (Dry lube only).
*   **Feb:** Check the "Keep" (metal hole) on the door frame for movement.
*   **Mar:** Tighten the grub screw on door handles.
*   **Apr:** Test the multipoint locking strip—does it engage smoothly?
*   **May:** Clean the bottom runner of uPVC doors.
*   **Jun:** Check window keys are available (Fire egress).
*   **Jul:** Inspect garden gate hasps and staples.
*   **Aug:** Verify shed locks are secure (tools used to break into house).
*   **Sep:** Check for "dropped" doors (catching on the frame).
*   **Oct:** Test the nightlatch "snib" function.
*   **Nov:** Upgrade to Anti-Snap if not already done.
*   **Dec:** Ensure letterbox has a guard to stop "fishing".

#### 11. FAQ Section
**Q: I'm locked out. Can I break a window?**
A: **Don't.** Glazing is far more expensive than a locksmith. A typical double-glazed unit costs £200+ to replace, whereas a locksmith entry is £80. Plus, you leave your home insecure overnight.

**Q: My key turns but the door won't open (uPVC).**
A: This is a "Multipoint Gearbox Failure." The spindle inside the strip has shattered. A locksmith can open this using a special "Spreader" tool to retract the hooks manually. It requires a new gearbox, not a new door.

**Q: Are digital smart locks safe?**
A: Yes, if installed correctly. However, in the UK, make sure any smart lock you choose (like the Ultion Nuki) still has a 3-Star cylinder core. If the smart lock relies on a cheap 1-star cylinder, it can still be snapped in 15 seconds.
`;

async function insertRegionalBatch() {
    console.log('--- Starting Batch 3 Insertion (Locked Out) ---');

    // --------------------------------------------------------------
    // 1. Handle UK Version (RENAME existing '...costs-london...' -> '-gb')
    // --------------------------------------------------------------
    // Since the original was focused on London, we map it to the UK version.
    console.log('Inserting/Updating UK Version...');

    const { data: baseData } = await supabase.from('posts').select('id').eq('slug', 'emergency-locksmith-costs-london-2025').single();

    if (baseData) {
        console.log('Found base London post. Renaming to GB version...');
        const { error: errorUpdateBase } = await supabase
            .from('posts')
            .update({
                content: gb_content,
                slug: 'emergency-locksmith-guide-gb', // RENAME
                title: "Locked Out? The UK Guide to Non-Destructive Entry & British Standard Locks",
                excerpt: "Locked out? Avoid 'rogue traders'. Guide to BS3621 locks, Anti-Snap cylinders, and Master Locksmiths Association (MLA) vetting."
            })
            .eq('slug', 'emergency-locksmith-costs-london-2025');
        if (errorUpdateBase) console.error('Error renaming base:', errorUpdateBase);
    } else {
        // Base not found, check if GB already exists due to re-run
        console.log('Base post not found. Checking for existing GB version...');
        const { error: errorUpdateGB } = await supabase
            .from('posts')
            .update({
                content: gb_content,
                title: "Locked Out? The UK Guide to Non-Destructive Entry & British Standard Locks",
                excerpt: "Locked out? Avoid 'rogue traders'. Guide to BS3621 locks, Anti-Snap cylinders, and Master Locksmiths Association (MLA) vetting."
            })
            .eq('slug', 'emergency-locksmith-guide-gb');
        if (errorUpdateGB) {
            // If update failed (maybe it didn't exist?), try insert.
            // But usually update just returns no rows if not found.
            // Let's do a select to be sure.
            const { data: gbCheck } = await supabase.from('posts').select('id').eq('slug', 'emergency-locksmith-guide-gb').single();
            if (!gbCheck) {
                await supabase.from('posts').insert([{
                    slug: 'emergency-locksmith-guide-gb',
                    title: "Locked Out? The UK Guide to Non-Destructive Entry & British Standard Locks",
                    content: gb_content,
                    excerpt: "Locked out? Avoid 'rogue traders'. Guide to BS3621 locks, Anti-Snap cylinders, and Master Locksmiths Association (MLA) vetting.",
                    cover_image: "/blog/emergency-locksmith/cover.png",
                    published: true
                }]);
            }
        }
    }

    // --------------------------------------------------------------
    // 2. Handle US Version (Insert NEW)
    // --------------------------------------------------------------
    console.log('Inserting US Version...');

    const { data: usData } = await supabase.from('posts').select('id').eq('slug', 'emergency-locksmith-guide-us').single();

    if (usData) {
        console.log('US Version exists. Updating...');
        const { error: errorUpdateUS } = await supabase
            .from('posts')
            .update({
                content: us_content,
                title: "Locked Out? The US Homeowner's Guide to Emergency Entry (and Scams)",
                excerpt: "Locked out at 2 AM? Don't let a scammer drill your deadbolt. Learn the 'Bump Key' truth, 2025 pricing, and how to verify a locksmith's license."
            })
            .eq('slug', 'emergency-locksmith-guide-us');
        if (errorUpdateUS) console.error('Error updating US:', errorUpdateUS);
    } else {
        console.log('US Version missing. Inserting new row...');
        const { error: errorInsertUS } = await supabase
            .from('posts')
            .insert([{
                slug: 'emergency-locksmith-guide-us',
                title: "Locked Out? The US Homeowner's Guide to Emergency Entry (and Scams)",
                content: us_content,
                excerpt: "Locked out at 2 AM? Don't let a scammer drill your deadbolt. Learn the 'Bump Key' truth, 2025 pricing, and how to verify a locksmith's license.",
                cover_image: "/blog/emergency-locksmith/cover.png",
                published: true
            }]);
        if (errorInsertUS) console.error('Error inserting US:', errorInsertUS);
    }

    console.log('--- Batch 3 (Locked Out) Complete ---');
}

insertRegionalBatch();
