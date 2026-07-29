# Hermes Setup: Emergency Directory Master Sites

You are connected as the main development agent for the emergency directory websites.

These websites are the master hub projects and must be treated as the main source of truth. Inspect the code before making changes. Do not guess, remove working features, replace real data with dummy data, or mix the two websites together.

## Sites

1. EmergencyTradesmen
   - URL: http://localhost:3000/
   - UK website.

2. EmergencyContractors
   - URL: http://localhost:3001/
   - USA website.

These are separate websites. They may share a business idea, design language, and feature structure, but must stay separate in location logic, wording, routes, data, SEO titles, search behaviour, business listings, local terminology, pricing, and offer presentation where needed.

EmergencyTradesmen must use UK towns, cities, counties, tradesmen wording, and UK emergency trade logic.

EmergencyContractors must use USA cities, states, counties, contractors wording, and USA emergency contractor logic.

## Content Quality Gate

All public copy changes for both websites must pass the stop-slop gate before publishing or deployment.

Use:

- `C:\Users\Nick\.codex\skills\stop-slop\SKILL.md`
- `docs/stop-slop-content-gate.md`

Apply this to blog posts, landing pages, hero copy, CTAs, pricing pages, FAQs, service descriptions, forms, modals, SEO titles, meta descriptions, and outreach/email copy. Cut filler, remove formulaic AI phrasing, use active voice, keep regional wording locked, and keep internal publishing notes out of public website text.

## First Inspection

Before making changes, inspect both apps and report:

1. Which files were checked.
2. How the two websites are separated.
3. Where the landing page title is controlled.
4. Where the listing/business filtering is controlled.
5. Where the wanted poster listing cards are controlled.
6. Where the Locate Me button is controlled.
7. Where the Pro sign-up and free website offer are controlled.
8. Where the 3 GitHub website templates are stored.

Check project folders, routes, components, listing/business data files, search logic, location logic, geolocation logic, landing page logic, pricing pages, pro sign-up pages, claim business flow, website template/showroom pages, blog layout, light/dark mode styling, and any shared components.

## Core Purpose

Users visit because they need urgent help from a local tradesperson or contractor. The websites must quickly help them find the correct trade in the correct area.

Core trades:

- Plumber
- Electrician
- Locksmith
- Gas / Heating Engineer
- Drain Specialist
- Roofer
- Builder
- Water Restoration Specialist
- Breakdown Recovery
- HVAC Technician
- Glazier

UK wording examples:

- Find Emergency Tradesmen in Luton
- Find Local Emergency Plumbers in Manchester
- Emergency Electricians Near Dunstable
- Emergency Locksmiths in Accrington

USA wording examples:

- Find Emergency Contractors in Dallas
- Find Local Emergency Plumbers in Miami
- Emergency Electricians Near Chicago
- Emergency HVAC Contractors in New York

Important rule: never mix UK and USA data or logic.

## Priority Fix 1: Dynamic Landing Page Title

The landing page title used to change dynamically depending on the selected area/location, but has become static. Restore this separately on both websites.

Correct behaviour:

1. Detect the selected area, searched area, or geolocation area.
2. Update the landing page title based on that area.
3. Use a fallback title only when no area is available.
4. Do not hard-code one static title.
5. Make sure the title updates when the area changes.
6. Keep UK and USA title logic separate.

## Priority Fix 2: Listing/Business Filtering

Results must be filtered by selected trade and area. Do not show the full database and label it as nearby.

Correct behaviour:

1. User selects a trade.
2. User selects an area.
3. Listings show only businesses in that area or genuinely nearby.
4. Result count matches filtered results.
5. Pagination still shows 9 per page.
6. Every area with data should show 1+ listings again.
7. Do not show random businesses from unrelated towns or cities.
8. Only show large counts if there are truly that many matching listings in or near the selected location.

Example result text:

- Found 4 plumbers in Accrington, Lancashire
- Found 4 plumbers near Accrington, Lancashire

## Priority Fix 3: Wanted Poster Listing Cards

Keep the wanted-poster style and keep the nails. Clean up the cards.

Bring back the red/green open/closed light system:

- Green light = Open / Available
- Red light = Closed / Unavailable

Keep on listing cards:

- Business name
- Trade
- Rating/reviews
- Area/location
- Phone number
- Visit Website button
- View Profile button
- Call button
- WhatsApp button, if available
- Red/green open or closed status light

Move to profile page:

- Request Quote
- Public Listing
- Own this business? Claim this listing
- 24/7 Emergency Service
- Long descriptions
- Extra business details

The View Profile button should sit directly above or below the Visit Website button. Use the Reward section for "Reward: View Profile". Make the brown background behind Reward/View Profile slightly see-through. Restore the old button hover effect with smooth edge expansion, growth, or glow. Every listing card must be the same size.

## Priority Fix 4: Locate Me Button

Move Locate Me out of the chat container and into the sidebar/side panel. There should only be one Locate Me button.

When clicked, it should:

1. Ask for browser location permission.
2. Use the browser Geolocation API.
3. Get latitude and longitude.
4. Use a free reverse-geocoding method if needed.
5. Detect the nearest town/city/area.
6. Update the selected location field.
7. Show nearby emergency trades or contractors.

Use free methods first. Do not use paid APIs unless absolutely necessary.

Handle errors:

- User denies permission
- Location unavailable
- Browser does not support geolocation
- Request times out
- Reverse geocoding fails

If geolocation fails, show manual town/postcode/location input.

## Priority Fix 5: Sidebar and Search Container

Keep the chat/search container clean and focused. Move extra actions into the sidebar.

Sidebar should contain working navigation/action buttons such as:

- Home/Search
- Locate Me
- Claim your business / Claim your trade
- Pro sign-up
- Build website / free website offer
- Website showroom/templates
- Contact
- Blog, if available

Remove buttons that do nothing. Do not leave duplicate buttons.

Light mode must be clean and readable with white/two-tone background, black readable text, and no low-contrast orange text on white.

## Priority Fix 6: Free Website Offer

Businesses that sign up to these plans should get a professional website completely free:

1. Pro Yearly
   - Price: $150 / year
   - Includes a free emergency-ready website.

2. Agency / Multi-Location
   - Includes a free emergency-ready website.

Offer wording:

"Sign up to Pro Yearly or Agency / Multi-Location and we'll build your emergency-ready website completely free."

Add clearly to pricing page, Pro sign-up page, claim-your-business flow, website offer page, and outreach/email copy if used.

## Priority Fix 7: GitHub Website Templates

There are already 3 website templates provided through GitHub. Find and use those templates. Do not create random new templates unless explicitly asked.

The free website should not be built from scratch every time. Use one of the 3 templates and customise it for each business with:

- Business name
- Trade
- Location
- Phone number
- Services
- Logo or image if available
- Emergency call-to-action
- Contact form
- Opening hours
- Website colours if needed

## Priority Fix 8: Blogs

When adding blogs, keep the same layout from the previous blog. Do not redesign the blog layout unless asked.

Rules:

- Keep the same layout from the last blog.
- Use the full blog from start to finish.
- Do not cut content.
- Do not remove important sections.
- Leave placeholders for hero images if told images will be provided later.
- Keep spacing, headings, formatting, and structure consistent.

## Development Rules

1. Inspect first, then fix.
2. Do not guess.
3. Do not remove working features.
4. Do not redesign unrelated sections.
5. Do not use dummy data.
6. Never replace real listings with fake data.
7. Preserve all real UK and USA listings.
8. Keep the two websites separate.
9. Check routes, query parameters, selected trade, selected area, location state, and pagination.
10. Ask first if something appears removable.
11. Make sure light mode and dark mode both work.
12. Keep performance good.
13. Avoid heavy animations that slow the site down.
14. Test both websites after changes.

## Local Test URLs

- UK website: http://localhost:3000/
- USA website: http://localhost:3001/

## Final Report Required

When finished, report:

- What files were inspected.
- What was broken.
- What changed.
- What still needs work.
- What was tested.
- Whether EmergencyTradesmen still works separately.
- Whether EmergencyContractors still works separately.

Do not treat this as a new build. Treat it as a repair, cleanup, and premium upgrade of the existing master websites.
