
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const post = {
  title: 'What to Do in a Home Emergency Before Help Arrives',
  slug: 'what-to-do-in-home-emergency-before-help-arrives',
  excerpt: 'Home emergencies can be frightening. This guide helps you stay calm, stay safe, and take the right steps in the first few minutes before professional help arrives.',
  content: `Home emergencies can be frightening. One moment everything is fine — the next you’re dealing with a power cut, a burst pipe, a gas smell, or something that just doesn’t feel right.

In these moments, many homeowners panic and rush into action. Unfortunately, panic often leads to the wrong decisions — and sometimes makes the situation worse.

This guide is here to help you stay calm, stay safe, and take the right steps in the first few minutes of any home emergency, before professional help arrives.

![Assess the situation](/blog/home-emergency/assess.png)

## 1. Stop, Breathe, and Assess the Situation

The very first thing to do is pause.

A few seconds spent assessing the situation can prevent serious mistakes.

**Ask yourself:**

*   Is anyone in immediate danger?
*   Is there fire, flooding, sparks, smoke, or a strong gas smell?
*   Is the problem getting worse quickly?

**If there is immediate danger:**

*   Get everyone out of the property.
*   Take children and pets with you.
*   Leave doors open if safe to do so
*   Move to a safe distance.
*   Call emergency services if required.

Your home can be repaired. People cannot.

## 2. Put Safety Before Property

It’s natural to want to protect your home, but your safety always comes first.

Do not take risks to save possessions or stop damage if it puts you in danger.

**Avoid:**

*   Walking through standing water, if electricity may be involved
*   Touching switches or sockets if you smell gas
*   Standing under ceilings that are sagging or leaking
*   Using ladders or climbing into unstable areas

If something feels unsafe, trust your instinct and step away.

![Shut off utilities](/blog/home-emergency/utilities.png)

## 3. When to Shut Off Utilities (and When Not To)

Shutting off utilities can stop a problem from escalating — but only if it’s safe to do so.

### Electricity

Turn off the power at the fuse box if:

*   Only your home has lost power.
*   You smell burning or see sparks.
*   Water is leaking near the sockets or appliances.
*   Lights flicker repeatedly before failing.

⚠️ **Do not touch the fuse box if it’s wet or you’re standing on a damp surface.**

### Water

Turn off the main water supply if:

*   A pipe has burst
*   Water is pouring through the ceilings or walls.
*   An appliance is flooding the property.

This simple action can prevent thousands of pounds in damage within minutes.

### Gas

Gas emergencies should always be treated seriously.

**If you smell gas:**

*   Do not use phones, switches, or naked flames.
*   Open doors and windows if safe
*   Leave the property immediately.
*   Turn off the gas at the meter only if you know how and it is safe.

If in doubt, leave and get professional help.

## 4. What NOT to Touch During a Home Emergency

Trying to “quickly fix” the issue is one of the biggest mistakes homeowners make.

**Avoid touching:**

*   Exposed wires or damaged sockets
*   Wet electrical appliances
*   Boilers, fuse boxes, or meters, if you are unsure
*   Gas pipes or fittings
*   Cracked ceilings, walls, or structural damage

Waiting for a qualified professional is always safer than guessing.

![Reduce damage safely](/blog/home-emergency/safety.png)

## 5. Reduce Damage Only If It’s Safe

Once you’re confident there is no immediate danger, small actions can help limit damage.

**You can:**

*   Place buckets or towels under leaks.
*   Move furniture and valuables away from affected areas.
*   Turn off appliances connected to the issue.
*   Ventilate rooms if appropriate

Never do this at the expense of your safety.

![Get help fast](/blog/home-emergency/help.jpg)

## 6. Get Help Fast Without Panic

When something goes wrong, many people start frantically searching online or calling random numbers. This often leads to:

*   Unverified tradespeople
*   Long wait times
*   Inflated emergency prices
*   Missed appointments

A faster, safer option is using [emergencytradesmen](https://emergencytradesmen.net/) to find trusted emergency professionals near you.

With [emergencytradesmen](https://emergencytradesmen.net/), you can:

*   Find emergency electricians, plumbers, gas engineers, and more.
*   Access help 24/7, including nights and weekends
*   Avoid unreliable call-outs
*   Get connected to local professionals quickly and easily.

When every minute matters, knowing exactly where to go makes all the difference.

## 7. While You’re Waiting for the Tradesperson

Once help is on the way:

*   Keep the affected area clear.
*   Do not attempt further repairs.
*   Keep children and pets away.
*   Take photos if safe (useful for insurance)
*   Make note of what happened and when

This helps the professional fix the issue faster and more effectively.

## 8. Prepare Now for the Next Emergency

Emergencies are unpredictable — but preparation reduces panic. Resources like [Citizens Advice](https://www.citizensadvice.org.uk/housing/) can offer further help on dealing with home issues.

**Take a few minutes today to:**

*   Locate your fuse box, gas meter, and water stopcock.
*   Keep a torch easily accessible.
*   Save [emergencytradesmen](https://emergencytradesmen.net/) so it’s ready when needed.
*   Make sure everyone in the household knows basic safety steps.

Preparation turns a stressful situation into a manageable one.

## Final Thoughts

Home emergencies are stressful, but you don’t have to face them unprepared or alone.

By staying calm, putting safety first, and knowing exactly where to turn for help, you can protect your home and the people inside it.

When you need fast, reliable emergency assistance, [emergencytradesmen](https://emergencytradesmen.net/) is there to connect you with trusted professionals — exactly when you need them most.

## FAQ

### What should I do first in a home emergency?

**First, pause and assess immediate danger.** If there is fire, flooding near electrics, smoke, sparks, or a strong gas smell, **get everyone out** and move to a safe distance. If it’s safe, contain the problem by shutting off the relevant utility (electric, water, or gas) and then contact a qualified professional for urgent help.

### When should I shut off electricity during an emergency?

**Shut off electricity at the fuse box** if you notice sparks, burning smells, repeated flickering, a power outage affecting only your home, or any water near sockets or appliances. **Do not touch the fuse box** if you are standing on a wet surface or there is standing water nearby. For detailed electrical safety advice, consult [Electrical Safety First](https://www.electricalsafetyfirst.org.uk/).

### When should I shut off the main water supply?

**Turn off the main water supply** if a pipe bursts, water is pouring through ceilings or walls, an appliance is flooding the property, or a leak is rapidly spreading. This can reduce damage significantly while you wait for a professional.

### What should I do if I smell gas in my home?

**If you smell gas, avoid using switches, phones, or open flames.** Open doors and windows if safe, leave the property immediately, and contact the gas emergency service (National Gas Emergency Service). Only turn off the gas at the meter if you know how and it is safe to do so. See [Gas Safe Register](https://www.gassaferegister.co.uk/) for more.

### What should I avoid touching during a home emergency?

**Avoid touching exposed wiring, wet electrical appliances, sockets,** fuse boxes if you are unsure, gas pipes or fittings, and any areas with structural damage such as cracked ceilings or unstable walls. If you are uncertain, **do not touch it** and wait for a qualified tradesperson.

### Should I try to fix an emergency myself before help arrives?

**Only take simple, safe steps** such as switching off utilities (if safe), placing buckets under leaks, and moving valuables away from danger. **Avoid DIY repairs** involving electrics, gas, boilers, or structural issues. If there is any risk, step away and wait for professional help.

### When should I call emergency services (999) instead of a tradesperson?

**Call emergency services if there is an immediate threat to life or safety,** such as a fire, serious smoke, suspected carbon monoxide exposure, a person injured, or a dangerous structural collapse. For urgent repairs without immediate life-threatening danger, contact a qualified emergency tradesperson.

### How can I get emergency help quickly for plumbing, electrics, or heating?

Use [emergencytradesmen](https://emergencytradesmen.net/) to quickly find the right emergency professional in your area, such as an electrician, plumber, gas engineer, or other urgent repair specialist. This helps reduce panic searching and connects you to help faster when time matters.`,
  cover_image: '/blog/home-emergency/cover.png',
  published: true,
  published_at: new Date().toISOString()
};

async function publishPost() {
  console.log('Publishing blog post...');

  const { data, error } = await supabase
    .from('posts')
    .upsert(post, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error('Error publishing post:', error.message);
  } else {
    console.log('Successfully published post:', post.title);
  }
}

publishPost();
