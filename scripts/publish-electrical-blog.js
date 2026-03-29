
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
    title: 'Electrical Emergencies Every Homeowner Should Know and How to Handle Them',
    slug: 'electrical-emergencies-every-homeowner-should-know',
    excerpt: 'Electrical emergencies can happen at any time. Learn how to identify and safely handle tripped breakers, sparking outlets, and more before calling a professional.',
    content: `Electrical emergencies are more common than many homeowners realise and they often happen at the worst possible time. Storms, cold winter nights, power surges, and overloaded circuits can all cause sudden electrical problems. These issues can quickly become dangerous if handled incorrectly.

This guide explains the most common electrical emergencies, what they mean, how to respond safely, and when to seek professional help. If at any point the situation feels unsafe or beyond your control, you can use [emergencytradesmen](https://emergencytradesmen.net/) to quickly find a verified emergency electrician available 24 hours a day.

![Electrical emergency cover](/blog/electrical-emergencies/cover.png)

## Common Electrical Emergencies at a Glance

| Electrical Issue | Risk Level | Immediate Action |

| Tripped breaker | Low to Medium | Reduce load and reset once |
| Burning smell from outlet | High | Turn power off and call electrician |
| Sparking sockets | High | Switch off circuit and stop using |
| Electrical fire | Critical | Evacuate and call emergency services |
| Power outage | Low to Medium | Check breakers and stay safe |

If you are unsure which category your problem fits into, do not guess. Use [emergencytradesmen](https://emergencytradesmen.net/) to get expert help fast.

## Tripped Circuit Breakers

![Tripped circuit breaker](/blog/electrical-emergencies/breaker.png)

A tripped circuit breaker is one of the most common electrical issues in homes. It usually happens when a circuit is overloaded or when a faulty appliance causes a safety shut off. While inconvenient, breakers tripping is a safety feature designed to protect your home.

### How to help and what to do

*   Switch off and unplug some appliances on the affected circuit
*   Locate your fuse box and identify the tripped breaker
*   Turn the breaker fully off and then back on once
*   Restore power slowly by turning devices back on one at a time
*   Monitor the circuit for further trips

### When to get professional help

*   The breaker trips repeatedly
*   Power cuts out immediately after resetting
*   You notice heat, buzzing, or burning smells

At this point, use [emergencytradesmen](https://emergencytradesmen.net/) to find a 24/7 emergency electrician near you.

## Burning Smell from an Outlet

![Burning smell from outlet](/blog/electrical-emergencies/wiring.png)

A burning or fishy smell from an outlet is a serious warning sign. It often indicates overheating wires or melting insulation inside the wall. This can lead to electrical fires if ignored.

### How to help and what to do

*   Turn off the power to the affected circuit immediately
*   Unplug devices only if it is safe to do so
*   Open windows to ventilate the area
*   Keep the outlet switched off
*   Monitor for smoke or visible damage

### What not to do

*   Do not continue using the outlet
*   Do not plug anything back in
*   Do not ignore the smell even if it stops

A burning outlet always requires professional inspection. Use [emergencytradesmen](https://emergencytradesmen.net/) to contact an emergency electrician immediately.

## Sparking Plugs or Sockets

Occasional small sparks can happen, but large or repeated sparks are dangerous. Sparking usually indicates loose wiring, damaged sockets, or faulty appliances.

### How to help and what to do

*   Stop using the socket or appliance immediately
*   Turn off power to the socket at the fuse box
*   Check for visible damage once power is off
*   Keep the socket unused until inspected

### Signs it is an emergency

*   Sparks accompanied by crackling sounds
*   Black marks around the socket
*   Burning smells
*   Heat coming from the outlet

For safe repairs, use [emergencytradesmen](https://emergencytradesmen.net/) to find a qualified emergency electrician.

## Electrical Fires

Electrical fires are extremely dangerous and can spread rapidly inside walls. They often start due to overheating, faulty wiring, or overloaded circuits.

### How to help and what to do

*   Turn off the power source if it is safe
*   Use a suitable fire extinguisher only if the fire is small
*   Evacuate the property immediately if the fire grows
*   Call emergency services from a safe location
*   Do not re enter the property until declared safe

### Never do the following

*   Never throw water on an electrical fire
*   Never try to fight a large fire yourself
*   Never restore power until inspected. See [GOV.UK fire safety](https://www.gov.uk/workplace-fire-safety-your-responsibilities) for more general advice.

After any electrical fire, professional inspection is essential. Use [emergencytradesmen](https://emergencytradesmen.net/) to arrange emergency electrical repairs.

## Power Outages and Power Cuts

![Power outage](/blog/electrical-emergencies/outage.png)

Power outages can be caused by storms, grid faults, or internal electrical issues. While not always dangerous, they still require careful handling.

### How to help and what to do

*   Check if neighbouring homes also lost power
*   Inspect your fuse box for tripped switches
*   Reset breakers once only if safe
*   Use torches instead of candles
*   Unplug sensitive electronics

### Staying safe during outages

*   Keep fridge and freezer doors closed
*   Layer clothing in cold weather
*   Avoid indoor use of outdoor heaters or grills
*   Stay away from downed power lines

If power will not restore or keeps cutting out, use [emergencytradesmen](https://emergencytradesmen.net/) to find an emergency electrician.

## When to Call an Emergency Electrician

Use professional help immediately if you experience any of the following.

| Warning Sign | Action Required |

| Burning smells | Call electrician now |
| Repeated breaker trips | Professional inspection |
| Sparks from sockets | Switch off and call |
| Electrical fire | Emergency services |
| Power loss with no clear cause | Electrician needed |

You can find trusted electricians fast at [emergencytradesmen](https://emergencytradesmen.net/).

## Why Use EmergencyTradesmen.net

EmergencyTradesmen.net helps homeowners during urgent situations by making it easy to find reliable professionals quickly.

### Key benefits

*   Verified local emergency electricians
*   Available 24 hours a day
*   Fast response times
*   Easy search by trade and location. Look for qualifications like [NICEIC](https://www.niceic.com/) registration.
*   No guessing or unsafe DIY decisions

When safety matters, [emergencytradesmen](https://emergencytradesmen.net/) gives you peace of mind.

## Final Safety Advice

Electrical emergencies should never be taken lightly. Acting quickly, avoiding risky fixes, and knowing when to call a professional can prevent serious damage and injury.

If you are ever unsure, the safest decision is to stop, switch off power if possible, and use [emergencytradesmen](https://emergencytradesmen.net/) to find expert help immediately.

Being prepared today protects your home and family tomorrow.`,
    cover_image: '/blog/electrical-emergencies/cover.png',
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
        console.error(`Error publishing post "${post.title}": `, error.message);
    } else {
        console.log(`Successfully published post: ${post.title} `);
    }
}

publishPost();
