
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    {
        slug: 'what-to-do-in-home-emergency-before-help-arrives',
        content: `**A home emergency — like a burst pipe, gas leak, or power cut — requires immediate action to protect your safety and property.** This guide outlines the critical first steps: shutting off utilities, ensuring family safety, and calling a trusted emergency tradesman before the damage escalates.

## 1. Stop, Breathe, and Assess the Situation

The very first thing to do is pause. A few seconds spent assessing the situation can prevent serious mistakes.

**Ask yourself:**
*   Is anyone in immediate danger?
*   Is there fire, flooding, sparks, smoke, or a strong gas smell?
*   Is the problem getting worse quickly?

**If there is immediate danger:**
*   Get everyone out of the property.
*   Take children and pets with you.
*   Leave doors open if safe to do so.
*   Move to a safe distance.
*   Call emergency services (999) if required.

Your home can be repaired. People cannot.

## 2. Put Safety Before Property

It’s natural to want to protect your home, but your safety always comes first. Do not take risks to save possessions or stop damage if it puts you in danger.

**Avoid:**
*   Walking through standing water if electricity may be involved.
*   Touching switches or sockets if you smell gas.
*   Standing under ceilings that are sagging or leaking.
*   Using ladders or climbing into unstable areas.

## 3. When to Shut Off Utilities (and When Not To)

Shutting off utilities can stop a problem from escalating — but only if it’s safe to do so.

### Electricity
Turn off the power at the consumer unit (fuse box) if:
*   Only your home has lost power.
*   You smell burning or see sparks.
*   Water is leaking near sockets or appliances.
*   Lights flicker repeatedly before failing.

⚠️ **Do not touch the fuse box if it’s wet or you’re standing on a damp surface.**

### Water
Turn off the main water supply (stopcock) if:
*   A pipe has burst.
*   Water is pouring through ceilings or walls.
*   An appliance is flooding the property.

### Gas
**If you smell gas:**
*   Do not use phones, switches, or naked flames.
*   Open doors and windows if safe.
*   Leave the property immediately.
*   Call the National Gas Emergency Service.

## 4. What NOT to Touch During a Home Emergency

Trying to “quickly fix” the issue is one of the biggest mistakes homeowners make.

**Avoid touching:**
*   Exposed wires or damaged sockets.
*   Wet electrical appliances.
*   Boilers, fuse boxes, or meters if you are unsure.
*   Gas pipes or fittings.

## 5. Get Help Fast Without Panic

When something goes wrong, a faster, safer option is using **[Emergency Tradesmen](https://emergencytradesmen.net/)** to find trusted emergency professionals near you.

With **[Emergency Tradesmen](https://emergencytradesmen.net/)**, you can:
*   Find emergency electricians, plumbers, gas engineers, and more.
*   Access help 24/7, including nights and weekends.
*   Avoid unreliable call-outs.`
    },
    {
        slug: '5-signs-you-need-emergency-plumber',
        content: `**Recognising the signs of a plumbing emergency, such as a burst pipe, sewage backup, or gas leak, is vital for minimizing water damage.** This article explains the 5 critical warning signs that mean you need to call an emergency plumber immediately to protect your home.

## Sign #1: Burst or Severely Leaking Pipes

When pipes burst or leak badly, you must act fast. This helps prevent a lot of damage and keeps your home safe. Burst pipes can cause a lot of water damage, destroying property and leading to mould.

### Immediate Steps
*   Turn off the main water supply (stopcock).
*   Open taps to drain the system.
*   Call an **[emergency plumber](https://emergencytradesmen.net/)** immediately.

## Sign #2: No Heating or Hot Water in Cold Weather

Not having heating in winter is a health risk. If your boiler fails during a cold snap, it requires urgent attention.

### Common Causes
*   Frozen condensate pipe.
*   Low boiler pressure.
*   Pilot light failure.

## Sign #3: Suspected Gas Leak

You can't ignore signs of a gas leak. It can lead to explosions or carbon monoxide poisoning.

### Warning Signs
*   Rotten egg smell.
*   Hissing sounds near appliances.
*   Feeling dizzy or nauseous.

**Action:** Evacuate and call the National Gas Emergency Service, then a **[Gas Safe engineer](https://emergencytradesmen.net/)**.

## Sign #4: Severe Drain Blockages and Sewage Backups

Sewage backups pose serious health risks. If water is coming back up your drains, do not use any water appliances.

### Health Risks
Sewage contains harmful bacteria and viruses. Professional cleanup is often required.

## Sign #5: Flooding

Whether from a burst pipe or heavy rain, standing water damages floors and walls rapidly.

**[Find an emergency plumber near you](https://emergencytradesmen.net/)** to stop the water and limit the damage.`
    },
    {
        slug: 'emergency-at-home-guide',
        content: `**Managing a home crisis requires a clear plan for plumbing, electrical, and gas emergencies.** This comprehensive guide provides step-by-step instructions for handling urgent repairs, locating shut-off valves, and contacting the right emergency tradesmen 24/7 to secure your home.

## Emergency Plumber Available 24 Hours a Day

Plumbing emergencies often escalate quickly because water spreads through floors, walls, and ceilings.

### What to do:
*   Turn off the nearest water valve or main stopcock.
*   Switch off the boiler if hot water pipes are affected.
*   Avoid using electrical appliances near standing water.
*   Use **[Emergency Tradesmen](https://emergencytradesmen.net/)** to find a plumber fast.

## Emergency Electrician Available 24 Hours a Day

Electrical faults can be dangerous. Burning smells, sparks, or repeated power failures may indicate overheating cables.

### What to do:
*   Turn off power at the consumer unit if safe.
*   Never use water on electrical fires.
*   Unplug sensitive electronics during power cuts.
*   Find an **[emergency electrician](https://emergencytradesmen.net/)** near you.

## Emergency Locksmith Available 24 Hours a Day

Lock emergencies can leave you exposed.

### What to do:
*   Assess if another entry point is accessible.
*   Avoid forcing doors or windows.
*   Call a verified **[emergency locksmith](https://emergencytradesmen.net/)** for non-destructive entry.

## Emergency Gas Engineer Available 24 Hours a Day

Gas emergencies are life-threatening.

### What to do:
*   Do not use flames or electrical switches.
*   Open doors and windows.
*   Evacuate and call the emergency service.
*   Find a **[Gas Safe engineer](https://emergencytradesmen.net/)** for repairs.`
    },
    {
        slug: 'electrical-emergencies-every-homeowner-should-know',
        content: `**Electrical emergencies, from tripping breakers to burning smells, pose serious fire risks and require urgent professional attention.** Learn how to identify dangerous faults, safely isolate power, and when to call an emergency electrician to prevent injury and fire damage.

## Common Electrical Emergencies at a Glance

| Electrical Issue | Risk Level | Immediate Action |
|---|---|---|
| Tripped breaker | Low to Medium | Reduce load and reset once |
| Burning smell | High | Turn power off and call electrician |
| Sparking sockets | High | Switch off circuit and stop using |
| Electrical fire | Critical | Evacuate and call 999 |

## Tripped Circuit Breakers

A tripped breaker protects your home from overload.
*   **Fix:** Unplug appliances, reset the breaker once.
*   **Emergency:** If it trips again or you smell burning, leave it off and call an **[emergency electrician](https://emergencytradesmen.net/)**.

## Burning Smell from an Outlet

A fishy or burning smell indicates overheating wires.
*   **Action:** Turn off the circuit immediately. Do not use the outlet. Call a professional.

## Sparking Plugs or Sockets

Large or continuous sparks indicate dangerous faults.
*   **Action:** Isolate the circuit at the consumer unit.

## Power Outages

If only your home has lost power, the fault is likely in your fuse box.
*   **Action:** Check your consumer unit. If you can't restore power, find a local **[electrician](https://emergencytradesmen.net/)**.`
    },
    {
        slug: 'how-we-verify-tradespeople',
        content: `**Hiring a tradesperson during an emergency requires trust in their identity, insurance, and qualifications.** We explain our rigorous 5-step verification process — including ID checks, insurance audits, and mystery shopping — ensuring you only connect with safe, verified local professionals.

## Step 1: Identity Check – Knowing Who’s Who

We use advanced technology to perform a forensic identity check, including document analysis and liveness checks, to ensure every tradesperson is who they say they are.

## Step 2: Insurance Verification – Your Safety Net

We verify Public Liability Insurance directly with insurers to ensure cover is active and sufficient for the specific trade.

## Step 3: Address Confirmation – Truly Local Pros

To speed up response times, we verify that tradespeople are truly local using utility bills and GPS checks.

## Step 4: Review Audit – Feedback You Can Trust

Our Closed-Loop Review System ensures only real customers can leave feedback, preventing fake reviews.

## Step 5: Test Calls – Professionalism Matters

We mystery shop our pros to ensure they are professional, transparent about pricing, and helpful.

### Ready to find a verified pro?
Use **[Emergency Tradesmen](https://emergencytradesmen.net/)** to connect with a verified expert today.`
    },
    {
        slug: 'emergency-locksmith-costs-london-2025',
        content: `**Getting locked out or suffering a broken lock compromises your home's security and demands a fast response.** Discover how an emergency locksmith can provide non-destructive entry, repair faulty locks, and restore your safety 24/7, usually arriving within 60 minutes.

## What Is an Emergency Locksmith?

An emergency locksmith provides urgent services 24/7, specialising in lockouts, lost keys, and burglary repairs.

## Common Situations
*   Locked out of house or flat.
*   Key snapped in lock.
*   Door won't lock.
*   Burglary damage.

## How Quickly Can They Arrive?
Most local locksmiths on **[Emergency Tradesmen](https://emergencytradesmen.net/)** aim to arrive within **30–60 minutes**.

## Can They Open a Door Without Damage?
**Yes.** Professional locksmiths use non-destructive entry methods (picking, decoding) whenever possible.

## How Much Does It Cost?
Costs vary by time and location, but reputable locksmiths provide clear upfront pricing.

## Why Use a Verified Locksmith?
Security is critical. We verify all locksmiths are insured and vetted.

**[Find a reliable emergency locksmith near you](https://emergencytradesmen.net/)** now.`
    },
    {
        slug: 'blocked-drains-vs-flooded-sewers-danger-guide',
        content: `**Distinguishing between a simple blocked drain and a major sewer flood is crucial for your health and wallet.** This guide clarifies the signs of a main sewer backup, the health risks of sewage, and whether you need a plumber or your water company.

## 1. Is it a Blockage or a Backup?

### The "Local" Blockage
*   **One fixture:** Sink blocked but toilet fine.
*   **Smell:** Localised odour near the plughole.
*   **Fix:** Usually your responsibility. Plunger or **[drain specialist](https://emergencytradesmen.net/)**.

### The Sewer Flood
*   **Multiple fixtures:** Toilet flushes and water comes up the shower.
*   **External signs:** Manhole cover lifting or sewage outside.
*   **Fix:** If it's the public sewer, call your Water Company. If it's your private drain, call a **[drain specialist](https://emergencytradesmen.net/)**.

## 2. Why You Shouldn't Touch Sewage
Sewage is "Black Water" (Category 3) containing E. coli and other pathogens. Do not attempt to clean major spills without protective gear.

## 3. Who Do I Call?
*   **Lateral Drain/Public Sewer:** Water Company.
*   **Within Property Boundary:** You need a private tradesperson. Use **[Emergency Tradesmen](https://emergencytradesmen.net/)** to find one fast.

## 4. What to Do Right Now
*   **Stop using water.**
*   **Check neighbours** (if they have it too, it's public).
*   **Call for help.**`
    },
    {
        slug: 'can-you-legally-stay-in-home-without-electricity',
        content: `**Living without electricity raises legal and safety questions regarding fitness for habitation and frozen pipes.** We answer your panic questions about tenant rights, food safety, and preventing damage during a power cut, ensuring you stay safe in the dark.

## The Legal Bit: Can You Stay?
A home without power or heating can be "unfit for human habitation" under the **Homes (Fitness for Human Habitation) Act 2018**. Landlords must maintain electrical installations.

## The Safety Bit: Should You Stay?
Risks increase when temps drop below 18°C.
*   **Carbon Monoxide:** Never use outdoor grills or generators indoors.
*   **Fire:** Use torches, not candles.

## Answering the "Panic Questions"

### 1. "My boiler won't start!"
Could be a frozen condensate pipe. Thaw it with warm water.

### 2. "Will my pipes burst?"
If heating is off, open the loft hatch. If leaving, turn off the water at the stopcock and drain the system.

### 3. "Is the food safe?"
Fridge: Safe for 4 hours.
Freezer: Safe for 24-48 hours.

**Need help?** Find an **[emergency electrician](https://emergencytradesmen.net/)** or **[gas engineer](https://emergencytradesmen.net/)** to restore your home's safety.`
    },
    {
        slug: 'water-leaking-through-ceiling-first-steps',
        content: `**Water leaking through your ceiling is a "Golden Minute" emergency requiring immediate isolation of the water supply.** Follow our step-by-step guide to stop the flow, drain the ceiling bulge safely, and protect your electrics before the emergency plumber arrives.

## 1. The "Golden Minute": Immediate Action Plan

### Step 1: Electricity Check
**Do not touch** wet light switches or fittings. Turn off the lighting circuit at the consumer unit.

### Step 2: The "Bulge" Trick
If the ceiling is bulging, place a bucket underneath and carefully poke a hole to release the water. This prevents a ceiling collapse.

### Step 3: Stop the Flow
Turn off the **main stopcock** (usually under the kitchen sink).

## 2. Where is it Coming From?
*   **Constant flow:** Supply pipe burst.
*   **Intermittent/Dirty:** Waste pipe or shower seal.
*   **Only when raining:** Roof leak.

## 3. Know Your Rights
*   **Renters:** Landlord must fix structural/water issues.
*   **Homeowners:** Check insurance for "Escape of Water" cover.

## 4. Who to Call?
*   **[Emergency Plumber](https://emergencytradesmen.net/):** For pipes and tanks.
*   **[Roofer](https://emergencytradesmen.net/):** For rain leaks.
*   **[Electrician](https://emergencytradesmen.net/):** If water hit the wiring.`
    },
    {
        slug: 'domestic-electrical-interruption-protocol',
        content: `**A sudden power cut demands a logical response to diagnose if the fault is yours or the grid's.** The Domestic Electrical Interruption Protocol guides you through checking your fuse box, testing appliances, and contacting the network operator, ensuring a safe and swift resolution.

## 1. Is It Just You?
*   **Window Test:** Are streetlights on? If yes, it's your problem.
*   **Smart Meter:** Blank screen = Grid issue. Zero usage = Your fuse box.

## 2. The Fuse Box: Finding the Fault
*   **MCB (Circuit Breaker):** Protects wires. Trips on overload.
*   **RCD:** Protects you. Trips on earth faults.

**To Fix:** Unplug all appliances on the circuit. Reset the switch. Plug back in one by one to find the faulty device.

## 3. Grid Issues
If the street is dark, call **105** to reach your Distribution Network Operator.

## 4. Staying Safe
*   **Keep fridge closed.**
*   **One room rule:** Keep heat in one room.
*   **No candles.**

**Need an electrician?** Find one fast at **[Emergency Tradesmen](https://emergencytradesmen.net/)**.`
    },
    {
        slug: 'emergency-plumber-london-guide',
        content: `**Hiring an emergency plumber in London requires specific checks to avoid scams and high costs.** This checklist covers the 5 essential verifications: Gas Safe ID, local area knowledge, transparent pricing, and navigating the capital's unique plumbing challenges.

## 1. Check for "London-Specific" Charges
Verify if Congestion Charge or parking is included. Ask for a fixed price upfront.

## 2. Verify "Gas Safe" ID
Always check their card, even for water leaks, as boilers are often nearby.

## 3. Ask About Local Knowledge
Ensure they are actually in London to avoid long travel delays.

## 4. The "Victorian Plumbing" Factor
Mention if you have an older property so they bring the right fittings.

## 5. Get a Proper Receipt
Ensure it has a physical address, not just a PO Box.

**Need a verified London plumber?** **[Find one now](https://emergencytradesmen.net/emergency-plumber/london)**.`
    }
];

async function updatePosts() {
    console.log('Starting bulk update of blog posts...');

    for (const update of updates) {
        console.log(`Updating slug: ${update.slug}`);
        const { error } = await supabase
            .from('posts')
            .update({ content: update.content })
            .eq('slug', update.slug);

        if (error) {
            console.error(`Error updating ${update.slug}:`, error);
        } else {
            console.log(`Successfully updated ${update.slug}`);
        }
    }
    console.log('All updates completed.');
}

updatePosts();
