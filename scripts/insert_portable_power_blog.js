import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const amazonLink = "https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?aref=uIM4EIqZ7A&content-id=amzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023%3Aamzn1.sym.0cf85714-a5b0-4d96-9050-d0dce9037023&crid=33I8EKKA1HPI8&cv_ct_cx=electric%2Bgenerator%2Bportable%2Bsolar&keywords=electric%2Bgenerator%2Bportable%2Bsolar&pd_rd_i=B0BZZ47J4T&pd_rd_r=0e0b0557-3eed-4335-9b29-e6a1477815e4&pd_rd_w=8jmdZ&pd_rd_wg=XzQgM&pf_rd_p=0cf85714-a5b0-4d96-9050-d0dce9037023&pf_rd_r=G6R413H7YTF4ZQ5HY81S&qid=1773084003&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=portable%2Belectric%2Bsolar%2Caps%2C239&sr=1-1-9131241a-a358-4619-a7b8-0f5a65d91d81&th=1&linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl";

const post = {
    slug: 'why-every-home-should-have-a-portable-power-station',
    title: 'Why Every Home Should Have a Portable Power Station',
    excerpt: 'Power cuts can happen when you least expect them. A portable power station gives you instant, safe, silent backup power for lights, devices, and medical equipment — no fumes, no noise, no chaos.',
    cover_image: '/images/blog/portable-power/bluetti-solar-outdoor.webp',
    published: true,
    published_at: new Date().toISOString(),
    content: `Power cuts can happen when you least expect them. Storms, maintenance work, grid issues, or unexpected faults can leave homes without electricity for hours or even days. When this happens, simple things like lighting a room, charging your phone, or keeping the internet running suddenly become difficult.

This is where a portable power station can make a huge difference. Many people think these devices are only useful for camping or outdoor trips, but they are actually incredibly practical to have around the home.

A portable power station is essentially a large rechargeable battery with multiple outlets, allowing you to power everyday devices when your normal electricity supply is unavailable.

---

## Backup Power When You Need It Most

![BLUETTI AC180 portable power station in use outdoors with solar panel and laptop](/images/blog/portable-power/bluetti-solar-outdoor.webp)

<a href="${amazonLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; border-radius: 8px; color: #111; padding: 12px 24px; font-weight: bold; text-decoration: none; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Buy on Amazon →</a>

*Stay connected, stay productive — even when the grid goes down.*

One of the biggest benefits of a portable power station is having instant backup power during an outage. When the electricity goes down, you can still keep essential items running.

**Devices you can power include:**
- Mobile phones
- Internet routers and Wi-Fi
- Laptops and tablets
- LED lights and lamps
- Small kitchen appliances
- Medical devices
- Power tools

This means you can stay connected, keep working, and maintain some comfort until the power returns.

> [!TIP]
> Keep your power station fully charged and ready, especially during storm seasons or winter months when outages are more common.

---

## Safe and Quiet for Indoor Use

Unlike traditional petrol or diesel generators, portable power stations run on rechargeable batteries, which means they are much safer for home use.

They produce:
- **No fumes**
- **No carbon monoxide**
- **No loud engine noise**

Because of this, they can be used safely indoors in places such as living rooms, bedrooms, home offices, and kitchens.

> [!TIP]
> Use energy-efficient devices like LED lights during an outage to make your battery last much longer.

---

## Solar Charging Makes Them Even Better

![BLUETTI AC180 powering multiple devices and lights in a remote outdoor setting](/images/blog/portable-power/bluetti-camping-multiconnect.webp)

<a href="${amazonLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; border-radius: 8px; color: #111; padding: 12px 24px; font-weight: bold; text-decoration: none; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Buy on Amazon →</a>

*Multiple devices, one power source — the BLUETTI AC180 handles them all simultaneously.*

Many modern portable power stations can be connected to solar panels, allowing them to recharge using sunlight.

**Benefits of solar charging include:**
- The battery can recharge during the day
- Devices can continue running while charging
- You rely less on the electrical grid

If you have a large battery capacity and good solar panels, it is possible to keep important equipment running throughout the day while the battery slowly recharges.

> [!TIP]
> If you plan to use solar panels, place them where they receive the most sunlight to maximise charging speed.

---

## Easy to Charge at Home

Even without solar panels, portable power stations are very easy to recharge. Most people simply charge them using a normal household plug.

**Common charging options include:**
- Standard wall socket
- Car charging socket
- Solar panels
- USB charging (for smaller units)

> [!TIP]
> Recharge the unit after every use so it is always ready for the next emergency.

---

## Ideal for Home Offices

![BLUETTI AC180 powering a laptop and lamp in a home office during an overnight outage](/images/blog/portable-power/bluetti-home-office-night.webp)

<a href="${amazonLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; border-radius: 8px; color: #111; padding: 12px 24px; font-weight: bold; text-decoration: none; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Buy on Amazon →</a>

*Never lose a working day to a power cut again.*

With more people working from home, losing power can mean losing valuable work time. A portable power station can keep your laptop, monitor, and internet router running, allowing you to continue working during a blackout.

> [!TIP]
> During an outage, prioritise essential devices first, such as your router and laptop.

---

## Extremely Useful Around the House

![BLUETTI AC180 on a kitchen counter powering a laptop and phone, with solar panels visible outside](/images/blog/portable-power/bluetti-kitchen-solar.webp)

<a href="${amazonLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; border-radius: 8px; color: #111; padding: 12px 24px; font-weight: bold; text-decoration: none; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Buy on Amazon →</a>

*From the kitchen to the garden — a portable power station fits seamlessly into everyday life.*

Portable power stations are not just for emergencies. Many people use them regularly for everyday tasks around the home.

**Common uses include:**
- Running tools in the garden
- Powering equipment in sheds or garages
- Charging devices during DIY projects
- Running outdoor lighting
- Backup power for home offices

> [!TIP]
> Keep your power station in an easy-to-access location, so it is quick to grab when you need it.

---

## Our Recommendation: BLUETTI AC180

The **BLUETTI AC180** is one of the best portable power stations available in 2026. With 1,152Wh of LiFePO4 battery capacity and 2× 1800W AC outlets, it can power your fridge, router, lights, and medical devices simultaneously. It charges from 0–80% in just 45 minutes and connects to solar panels for off-grid resilience.

<a href="${amazonLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f0c14b; border: 1px solid #a88734; border-radius: 8px; color: #111; padding: 12px 24px; font-weight: bold; text-decoration: none; margin-top: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">Buy on Amazon →</a>

---

*Published by the Emergency Tradesmen Content Team.*`
};

async function insertPost() {
    console.log(`Upserting post: ${post.slug}`);
    const { data, error } = await supabase
        .from('posts')
        .upsert(post, { onConflict: 'slug' })
        .select();
    if (error) {
        console.error('Error upserting post:', error);
    } else {
        console.log('Successfully upserted post:', data[0].slug);
    }
}

insertPost();
