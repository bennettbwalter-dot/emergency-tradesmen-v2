import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function cleanDashes(text) {
    if (!text) return text;
    // Replace em dash, en dash, double dash and single hyphen with space or comma
    return text.replace(/[—–]/g, ', ').replace(/--/g, ', ').replace(/-/g, ' ');
}

const bidetPromo = `
## Experience the Luxury of a Japanese Style Spa
Experience the luxury of a Japanese style spa in your own home. Our UK Standard Certified Smart Bidet Seat isn't just a toilet, it's a lifestyle upgrade.

![Smart Bidet Lifestyle](/images/blog/generated/bidet_lifestyle_correct.jpg)

**Premium Comfort**: Say goodbye to cold shocks with a Heated Seat and Warm Water on demand.

**Total Hygiene**: Advanced Self Cleaning Nozzle and a gentle Warm Air Dryer for a superior clean.

**Intelligent Design**: Built in Soft Nightlight for those late night visits and a sleek, modern finish.

![Smart Bidet Features](/images/blog/generated/bidet_features_correct.jpg)

**Safety Guaranteed**: Fully UK Certified for peace of mind and easy installation.

**Transform your daily routine today.**

[Order Yours Now. Fast UK Delivery](https://www.amazon.co.uk/TokyoSeat-Standard-Certified-Self-Cleaning-Nightlight/dp/B0CQVTQ21G?crid=5AQCJXTQL3D&dib=eyJ2IjoiMSJ9.CUKwjbVW3QiqJQTWs3ZuUlNdV2eNgTkF7JsPfAy6KfTgO-43X56ZNQz6VLooCq0Ry8fO9s-9peWbbPODoUxagQrypr33OogjgTAIoqnr8slYEGnkDlXOJ6K7BYNRZoNY9oG1KSz6I-td0TxtyDnXHw6NQXK3UvK-tOrBjpINrk48F8cAfuOtq-nCLjVPocJzUy0xBhHyrM9qzsKQHAwT1RI1LS0Tl3pfpIt1v5ULTRU.D4jUOqduOZbtsXmFr7ChU2AowlTT1RozSB3hauu-ITE&dib_tag=se&keywords=toilet%2Btech&qid=1773310116&s=diy&sprefix=toilet%2Btech%2Cdiy%2C212&sr=1-2-spons&aref=ZZzDbKt9Tp&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=et0a8-21&linkId=f4a16efc6d03c65f84b3b53a10d5da23&ref_=as_li_ss_tl)
`;

const ukContent = `
# Toilet Won't Stop Running? The 2026 Emergency Guide to the 5 Minute Fix
It is the middle of the night, and you can hear it: that persistent, ghostly hiss coming from the bathroom. You jiggle the handle, it stops for a second, and then it starts again. A running toilet might seem like a minor annoyance, but as we navigate the water efficiency standards of 2026, it is actually a domestic emergency hiding in plain sight. A constantly running toilet can waste up to 750 litres of water per day, that’s enough to fill three large bathtubs every single day. If you are on a water meter, this "minor leak" could add hundreds of pounds to your annual bill.

In this guide, we will break down why your toilet won't stop running, the structural risks involved, and the "5 minute fix" that could save you a fortune before you need to call an emergency plumber.

![Toilet Won't Stop Running](/images/blog/generated/running_toilet_hero.png)

## Why a Running Toilet is a Financial Emergency
Many homeowners ignore a running toilet because "it’s just a bit of water." However, in 2026, with rising utility costs and a global focus on sustainability, ignoring water waste is no longer an option.

1. The Water Bill Impact
A toilet that runs continuously can waste more water in a month than a typical family of four uses in that same period. In the UK, with average water and sewerage rates, a significant leak can easily add £60 or £100 to a monthly bill.

2. Plumbing Wear and Tear
Constant water flow means constant mineral buildup. Limescale will accumulate faster in the fill valve and the flush mechanism if it never gets a chance to dry or settle. This leads to the eventual failure of the entire system, turning a 5 minute fix into a full toilet replacement.

3. Humidity and Mould Risks
While the water is contained within the porcelain, a constantly running toilet keeps the bathroom air more humid than it should be. This can lead to condensation on the outside of the tank, which eventually drips onto the floor, rotting subfloors and encouraging mould growth behind the skirting boards.

## 5 Warning Signs Your Toilet is About to Fail
Don't wait for the "ghost flush" at 2 AM. Watch for these early indicators:

The Ghost Flush: If your toilet suddenly refills for a few seconds even though nobody has used it, you have a slow leak from the tank into the bowl.
The Jiggle Requirement: If you have to jiggle the handle after every flush to make the noise stop, your internal chain or flush valve is already misaligned.
Visual Ripples: If you can see constant ripples or a small stream of water at the back of the toilet bowl, the seal is broken.
Trickling Sound: A high pitched hissing or trickling sound coming from inside the tank means the fill valve isn't shutting off properly.
Condensation on the Tank: Constant cold water flowing through the tank cools the porcelain down, causing warm bathroom air to condense on the outside, a sure sign of continuous flow.

## The 5 Minute Fix: Step by Step
Before you call a local plumber, try these three most common fixes. 90% of running toilets can be solved with just your hands and no tools.

![Inside a Toilet Tank Mechanism](/images/blog/generated/toilet_tank_mechanism.png)

Step 1: Check the Flapper Chain (The 30 Second Fix)
Take the lid off the tank. Look at the chain connecting the handle to the "flapper".

Too tight? The flapper won't seal properly.
Too loose? It can get caught under the flapper seal. The Fix: Adjust the clip on the chain so there is about half an inch of slack.

Step 2: Clean the Flapper Seal (The 2 Minute Fix)
Over time, minerals and "tank slime" build up on the rubber flapper or the rim it sits on. This prevents a watertight seal. The Fix: Turn off the water at the isolation valve, flush to empty the tank, and wipe the bottom of the flapper and the rim with a cloth. If the flapper feels stiff or cracked, it’s time for a £10 replacement from the hardware store.

Step 3: Adjust the Float Height (The 2 Minute Fix)
If water is flowing into the "overflow tube", your float is set too high. The fill valve thinks it needs to keep filling. The Fix: Look for the adjustment screw on the top of the fill valve or the sliding clip on the float arm. Lower the float until the water level sits about an inch below the top of the overflow tube.

## Rules & Regulations: What Homeowners Need to Know
**In the UK:**
The Water Supply (Water Fittings) Regulations 1999 mandate that all plumbing fixtures must be installed and maintained to prevent the "undue consumption or misuse of water." While fixing a toilet flapper is a DIY task, if you are replacing the internal "syphon" or fill valve, ensure the parts carry WRAS approval.

${bidetPromo}

## When to Call a Professional
If you’ve tried the steps above and the noise persists, you might have a hidden hairline crack in the fill valve or a failed syphon unit that requires specialized tools to remove.

You should call an emergency plumber immediately if:
Water is leaking from the outside of the toilet onto the floor.
You cannot turn off the isolation valve behind the toilet.
The toilet is backed up and running simultaneously, this is a flood risk!

## Find a Verified Plumber in Minutes
If your 5 minute fix didn't do the trick, don't let your water bill spiral out of control. We connect you with local, vetted plumbers who can be at your door within the hour.

**Internal Links:**
* [Find Emergency Plumbers Near Me](https://emergencytradesmen.net/services/plumbing)
* [How to Find Your Stopcock Before It's Too Late](https://emergencytradesmen.net/blog/find-stopcock-emergency)
* [Emergency Plumber London](https://emergencytradesmen.net/location/london/plumber)
* [The Real Cost of Ignoring a Small Leak](https://emergencytradesmen.net/blog/cost-of-leaks)
* [Our Vetting Process for Tradespeople](https://emergencytradesmen.net/about)
`;

const usContent = ukContent
    .replace('750 litres', '200 gallons')
    .replace('£60 or £100', '$100 or $150')
    .replace('£10', '$15')
    .replace('skirting boards', 'baseboards')
    .replace('syphon', 'flush valve')
    .replace('Mould', 'Mold')
    .replace('pounds', 'dollars')
    .replace('hardware store', 'home improvement store')
    .replace('emergency plumber London', 'emergency plumber NYC')
    .replace('**In the UK:**\nThe Water Supply (Water Fittings) Regulations 1999 mandate that all plumbing fixtures must be installed and maintained to prevent the "undue consumption or misuse of water." While fixing a toilet flapper is a DIY task, if you are replacing the internal "syphon" or fill valve, ensure the parts carry WRAS approval.', 
             '**In the USA:**\nMany states, particularly California and Texas, have strict "Low-Flow" requirements under the Energy Policy Act. If you replace your toilet components, 2026 standards often require them to be compatible with WaterSense certified fixtures.');

async function updatePost(slug, content) {
    console.log(`Updating post: ${slug}`);
    const finalContent = cleanDashes(content);
    const { error } = await supabase
        .from('posts')
        .update({ content: finalContent.trim() })
        .eq('slug', slug);
    if (error) console.error(`Error updating ${slug}:`, error);
    else console.log(`Successfully updated ${slug}`);
}

async function run() {
    await updatePost('toilet-wont-stop-running-2026-fix-gb', ukContent);
    await updatePost('toilet-wont-stop-running-2026-fix-us', usContent);
}

run();
