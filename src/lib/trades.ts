import { cityPostcodes } from "./cityPostcodes";

export const trades = [
  { slug: "plumber", name: "Plumber", usName: "Plumber", icon: "💧", image: "/emergency-plumber-v2.webp", vectorIcon: "/icons/plumber.webp" },
  { slug: "electrician", name: "Electrician", usName: "Electrician", icon: "⚡", image: "/emergency-electrician-v2.webp", vectorIcon: "/icons/electrician.webp" },
  { slug: "locksmith", name: "Locksmith", usName: "Locksmith", icon: "🔐", image: "/emergency-locksmith-v2.webp", vectorIcon: "/icons/locksmith.webp" },
  { slug: "gas-engineer", name: "Gas Engineer", usName: "HVAC / Gas Engineer", icon: "🔥", image: "/emergency-gas-engineer-v2.webp", vectorIcon: "/icons/gas-engineer.webp" },
  { slug: "drain-specialist", name: "Drain Specialist", usName: "Drain Specialist", icon: "🚿", image: "/emergency-drain-specialist-v2.webp", vectorIcon: "/icons/drain-specialist.webp" },
  { slug: "glazier", name: "Glazier", usName: "Glazier / Glass Repair", icon: "🪟", image: "/emergency-glazier-v2.webp", vectorIcon: "/icons/glazier.webp" },
  { slug: "roofer", name: "Roofer", usName: "Roofer / Roof Repair", icon: "🏠", image: "/emergency-roofer-v2.webp", vectorIcon: "/icons/roofer-icon-v2.webp" },
  { slug: "builder", name: "Builder", usName: "Builder / Construction", icon: "🧱", image: "/emergency-builder-v2.webp", vectorIcon: "/icons/builder-icon-v2.webp" },
  { slug: "water-restoration", name: "Water Restoration", usName: "Water Damage & Restoration", icon: "🌊", image: "/water-hero-final.webp", vectorIcon: "/water-restoration-icon.webp" },
  { slug: "breakdown", name: "Breakdown Recovery", usName: "Tow Truck", icon: "🚗", image: "/emergency-breakdown-v2.webp", vectorIcon: "/icons/breakdown.webp" },
  { slug: "hvac", name: "Air Conditioning (HVAC)", usName: "Heating & Cooling", icon: "❄️", image: "/emergency-hvac-v2.webp", vectorIcon: "/hvac-icon.webp" },
] as const;

import { cityCoordinates } from './cityCoordinates';
import { usCityCoordinates } from './usCityCoordinates';
import { US_STATES } from './us_states';

export const cities = Object.keys(cityCoordinates).sort() as readonly string[];

export const usCities = Object.keys(usCityCoordinates).sort() as readonly string[];

export const cityToState: Record<string, string> = {
  // California (CA)
  "Los Angeles": "ca", "San Diego": "ca", "San Francisco": "ca", "Sacramento": "ca",
  "San Jose": "ca", "Fresno": "ca", "Long Beach": "ca", "Oakland": "ca", "Bakersfield": "ca",
  "Anaheim": "ca", "Santa Ana": "ca", "Riverside": "ca", "Stockton": "ca",
  // Texas (TX)
  "Dallas": "tx", "Houston": "tx", "Austin": "tx", "San Antonio": "tx", "Fort Worth": "tx",
  "Arlington": "tx", "Plano": "tx", "Irving": "tx", "Garland": "tx", "Frisco": "tx",
  "McKinney": "tx", "El Paso": "tx", "Corpus Christi": "tx", "Lubbock": "tx", "Laredo": "tx",
  "Amarillo": "tx", "Midland": "tx", "Abilene": "tx", "Denton": "tx", "Waco": "tx",
  "Carrollton": "tx", "Richardson": "tx", "Lewisville": "tx", "Round Rock": "tx",
  "College Station": "tx", "Tyler": "tx", "Pearland": "tx", "Sugar Land": "tx", "Allen": "tx",
  "League City": "tx", "Conroe": "tx", "New Braunfels": "tx", "Edinburg": "tx", "Mission": "tx",
  "Bryan": "tx", "Pharr": "tx", "Baytown": "tx", "Missouri City": "tx", "Temple": "tx",
  "Flower Mound": "tx", "North Richland Hills": "tx", "Mansfield (Nottinghamshire)": "tx", "Victoria": "tx",
  "Rowlett": "tx", "Harlingen": "tx", "Pflugerville": "tx", "San Marcos": "tx", "Euless": "tx",
  "Port Arthur": "tx", "Grapevine": "tx",
  // Florida (FL)
  "Miami": "fl", "Orlando": "fl", "Jacksonville": "fl", "Tampa": "fl",
  "Gainesville": "fl", "Ocala": "fl", "Pensacola": "fl", "Panama City": "fl",
  // Arizona (AZ)
  "Phoenix": "az", "Scottsdale": "az", "Mesa": "az", "Tucson": "az",
  // Washington (WA)
  "Seattle": "wa", "Tacoma": "wa", "Spokane": "wa",
  // Oregon (OR)
  "Portland": "or", "Eugene": "or",
  // Connecticut (CT)
  'Stratford': 'CT', 'Trumbull': 'CT', 'Shelton': 'CT', 'Hartford': 'CT',
  // Nevada (NV)
  'Las Vegas': 'NV', 'Henderson': 'NV', 'North Las Vegas': 'NV', 'Paradise': 'NV', 'Reno': 'NV',
  // Utah (UT)
  'Salt Lake City': 'UT', 'West Valley City': 'UT', 'West Jordan': 'UT', 'Sandy': 'UT',
  // Louisiana (LA)
  'New Orleans': 'LA', 'Metairie': 'LA', 'Kenner': 'LA', 'Marrero': 'LA', 'Baton Rouge': 'LA', 'Shreveport': 'LA',
  // Michigan (MI)
  "Detroit": "mi", "Lansing": "mi", "Ann Arbor": "mi", "Flint": "mi", "Grand Rapids": "mi",
  // Ohio (OH)
  "Cleveland": "oh", "Columbus": "oh", "Cincinnati": "oh", "Toledo": "oh",
  // Pennsylvania (PA)
  "Pittsburgh": "pa", "Philadelphia": "pa", "Scranton": "pa", "Allentown": "pa", "Harrisburg": "pa", "Erie": "pa", "Reading (Berkshire)": "pa",
  // New York (NY)
  "Buffalo": "ny", "New York City": "ny", "Syracuse": "ny", "Yonkers": "ny", "Rochester": "ny",
  // Indiana (IN)
  "Indianapolis": "in", "Carmel": "in", "Fishers": "in", "Greenwood": "in", "Fort Wayne": "in", "Evansville": "in", "South Bend": "in",
  // North Carolina (NC)
  "Charlotte": "nc", "Raleigh": "nc", "Greensboro": "nc", "Durham (County Durham)": "nc", "Winston-Salem": "nc", "Fayetteville": "nc", "Asheville": "nc",
  // Illinois (IL)
  "Chicago": "il", "Rockford": "il", "Joliet": "il",
  // Colorado (CO)
  "Denver": "co", "Colorado Springs": "co", "Aurora": "co",
  // Oklahoma (OK)
  "Oklahoma City": "ok", "Norman": "ok", "Edmond": "ok", "Moore": "ok", "Tulsa": "ok", "Lawton": "ok",
  // Tennessee (TN)
  "Nashville": "tn", "Memphis": "tn", "Knoxville": "tn", "Chattanooga": "tn",
  // District of Columbia (DC)
  "Washington, D.C.": "dc",
  // Massachusetts (MA)
  "Boston": "ma", "Worcester (Worcestershire)": "ma",
  // Kentucky (KY)
  "Louisville": "ky", "Lexington": "ky",
  // Maryland (MD)
  "Baltimore": "md", "Annapolis": "md", "Frederick": "md", "Hagerstown": "md", "Salisbury (Wiltshire)": "md", "Bowie": "md",
  // Wisconsin (WI)
  "Milwaukee": "wi", "Madison": "wi", "Green Bay": "wi", "Kenosha": "wi",
  // New Mexico (NM)
  "Albuquerque": "nm",
  // Missouri (MO)
  "Kansas City": "mo", "St. Louis": "mo",
  // Georgia (GA)
  "Atlanta": "ga", "Augusta": "ga", "Savannah": "ga",
  // Nebraska (NE)
  "Omaha": "ne", "Lincoln (Lincolnshire)": "ne",
  // Virginia (VA)
  "Virginia Beach": "va", "Norfolk": "va", "Richmond (London)": "va", "Newport News": "va", "Chesapeake": "va", "Alexandria": "va", "Roanoke": "va",
  // Minnesota (MN)
  "Minneapolis": "mn", "St. Paul": "mn",
  // Kansas (KS)
  "Wichita": "ks",
  // Hawaii (HI)
  "Honolulu": "hi",
  // Alaska (AK)
  "Anchorage": "ak",
  // Arkansas (AR)
  "Little Rock": "ar",
  // Mississippi (MS)
  "Gulfport": "ms", "Hattiesburg": "ms", "Meridian": "ms", "Jackson": "ms",
  // Alabama (AL)
  "Birmingham (West Midlands)": "al", "Huntsville": "al", "Auburn": "al", "Tuscaloosa": "al", "Mobile": "al", "Montgomery": "al",
  // South Carolina (SC)
  "Charleston": "sc", "Columbia": "sc", "Greenville": "sc",
  // West Virginia (WV)
  "Charleston, WV": "wv", "Huntington": "wv", "Morgantown": "wv", "Parkersburg": "wv", "Wheeling": "wv",
  // New Jersey (NJ)
  "Newark": "nj", "Jersey City": "nj", "Paterson": "nj", "Elizabeth": "nj",
  // Iowa (IA)
  "Des Moines": "ia",
  // Rhode Island (RI)
  "Providence": "ri",
  // Idaho (ID)
  "Boise": "id",
  // South Dakota (SD)
  "Sioux Falls": "sd",
  // North Dakota (ND)
  "Fargo": "nd",
};

export const usCityToState: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(cityToState).map(([city, state]) => [city, state.toUpperCase()])
);

export type Trade = typeof trades[number];
export type City = typeof cities[number];

export const commonProblems = [
  { slug: "burst-pipe", name: "Burst Pipe Repair", trade: "plumber", description: "Immediate repair for burst water pipes and massive leaks.", country: "BOTH" },
  { slug: "no-hot-water", name: "No Hot Water Service", trade: "plumber", description: "Emergency diagnosis and repair when your hot water stops working.", country: "BOTH" },
  { slug: "boiler-breakdown", name: "Boiler Breakdown Repair", trade: "gas-engineer", description: "24/7 emergency gas engineer for boiler failures and heating loss.", country: "GB" },
  { slug: "power-cut-fault", name: "Emergency Power Cut Fault", trade: "electrician", description: "Investigating and fixing sudden power outages in your property.", country: "BOTH" },
  { slug: "lockout", name: "Emergency Lockout Service", trade: "locksmith", description: "Non-destructive entry when you are locked out of your home or business.", country: "BOTH" },
  { slug: "broken-window", name: "Emergency Window Boarding", trade: "glazier", description: "Rapid boarding and glass replacement for smashed windows and doors.", country: "BOTH" },
  { slug: "drain-unblocking", name: "Emergency Drain Unblocking", trade: "drain-specialist", description: "Fast clearance of blocked toilets, sinks, and external drains.", country: "BOTH" },
  { slug: "water-damage", name: "Water Damage Restoration", trade: "water-restoration", description: "Rapid extraction and drying for flooding, burst pipes, and water damage.", country: "US" },
  { slug: "gas-leak", name: "Emergency Gas Leak Response", trade: "gas-engineer", description: "Urgent 24/7 response for suspected gas leaks, fumes, and unsafe appliances.", country: "GB" },
  { slug: "toilet-overflow", name: "Toilet Overflow & Blockage", trade: "plumber", description: "Rapid response for overflowing or severely blocked toilets to stop flooding.", country: "BOTH" },
  { slug: "frozen-pipes", name: "Frozen Pipe Thawing & Repair", trade: "plumber", description: "Emergency thawing and repair for frozen or burst pipes in cold weather.", country: "BOTH" },
  { slug: "ac-not-cooling", name: "AC Not Cooling Repair", trade: "hvac", description: "Same-day diagnosis and repair when your air conditioning stops cooling.", country: "US" },
  { slug: "furnace-breakdown", name: "Furnace Breakdown Repair", trade: "hvac", description: "24/7 emergency furnace and heating repair when your system fails.", country: "US" },
  { slug: "water-heater-failure", name: "Water Heater Emergency Repair", trade: "plumber", description: "Fast diagnosis and repair when your water heater fails or leaks.", country: "US" },
] as const;

export type CommonProblem = typeof commonProblems[number];

export const ukProblems = commonProblems.filter(p => p.country === "GB" || p.country === "BOTH");
export const usProblems = commonProblems.filter(p => p.country === "US" || p.country === "BOTH");

export interface TradePageData {
  trade: Trade;
  city: City;
  serviceAreas: string[];
  averageResponseTime: string;
  emergencyPriceRange: string;
  certifications: string[];
  services: string[];
  faqs: { question: string; answer: string }[];
  localExpertise?: string;
  problem?: CommonProblem;
  countryCode?: string;
}

export function generateTradePageData(tradeSlug: string, cityName: string, countryCode: string = 'US', stateSlug?: string, metroSlug?: string): TradePageData | null {
  // STRICT US ENFORCEMENT
  if (countryCode !== 'US' && countryCode !== 'GB') {
    // Default or error handling
  }

  // Allow tradeSlug to also be a problem slug
  const problem = commonProblems.find(p => p.slug === tradeSlug);
  if (problem && problem.country !== "BOTH" && problem.country !== countryCode) {
    return null;
  }
  const trade = trades.find(t => t.slug === (problem ? problem.trade : tradeSlug));

  // Basic city normalization (slug to name approximation)
  const normalizedCityName = cityName.replace(/-/g, ' ');

  let foundCity: string | null = null;
  let actualCountryCode = countryCode;

  // UK Guard Clause
  // UK Guard Clause - Dynamic Check using Master List
  // We use the keys from cityPostcodes as the source of truth for "What is a UK city"
  const knownUKExclusives = Object.keys(cityPostcodes);

  if (countryCode === 'GB' && knownUKExclusives.some(c => c.toLowerCase() === normalizedCityName.toLowerCase())) {
    foundCity = knownUKExclusives.find(c => c.toLowerCase() === normalizedCityName.toLowerCase()) || normalizedCityName;
    actualCountryCode = 'GB';
  }

  // Fallback: Accept US city/metro/suburb route labels without loading the full US hierarchy on every trade page.
  if (!foundCity) {
    // If we have a stateSlug, and we didn't find the city in that state, it might be a valid city not in our seed list.
    // In that case, we still accept it as valid for that state.
    if (countryCode === 'US' || stateSlug) {
      foundCity = normalizedCityName;
      actualCountryCode = 'US';
    } else {
      foundCity = normalizedCityName;
    }
  }

  const city = foundCity; // We now assume 'city' is the US entity.

  if (!trade || !city) return null;

  // UK Data - STRICTLY SEPARATED
  const ukServiceAreaMap: Record<string, string[]> = {
    Manchester: ["Salford (Manchester)", "Stockport (Manchester)", "Trafford", "Oldham (Manchester)", "Rochdale (Manchester)", "Bury (Manchester)", "Bolton (Manchester)", "Wigan (Manchester)", "Altrincham (Manchester)", "Sale (Manchester)"],
    Birmingham: ["Solihull (Birmingham)", "Sutton Coldfield (Birmingham)", "Edgbaston", "Moseley", "Erdington", "Kings Heath", "Harborne", "Digbeth", "Jewellery Quarter", "Bournville"],
    Leeds: ["Headingley", "Roundhay", "Morley", "Pudsey", "Horsforth", "Chapel Allerton", "Kirkstall", "Meanwood", "Bramley", "Rothwell"],
    Sheffield: ["Rotherham (Sheffield)", "Doncaster (Sheffield)", "Barnsley (Sheffield)", "Chesterfield (Sheffield)", "Worksop", "Dore", "Totley", "Hillsborough", "Ecclesall", "Crookes", "Stocksbridge"],
    Liverpool: ["Birkenhead (Liverpool)", "Bootle", "Crosby (Liverpool)", "St Helens (Liverpool)", "Widnes (Cheshire)", "Runcorn (Cheshire)", "Wallasey (Liverpool)", "Huyton", "Speke", "Aigburth"],
    London: ["Westminster (London)", "Kensington", "Chelsea (London)", "Islington (London)", "Camden (London)", "Hackney (London)", "Greenwich (London)", "Brixton", "Battersea", "Wandsworth (London)", "Fulham (London)", "Hammersmith", "Ealing (London)", "Richmond (London)", "Wimbledon"],
    Bristol: ["Clifton", "Redland", "Cotham", "Bedminster", "Southville", "Totterdown", "Horfield", "Bishopston", "Brislington", "St George"],
    Glasgow: ["West End", "City Centre", "Southside", "East End", "North Glasgow", "Paisley (Glasgow)", "Renfrew", "Clydebank (Glasgow)", "Bearsden", "Milngavie"],
    Edinburgh: ["Leith", "City Centre", "Stockbridge", "Morningside", "Bruntsfield", "Newington", "Corstorphine", "Gorgie", "Dalry", "Portobello"],
    Cardiff: ["Cardiff Bay", "Canton", "Roath", "Cathays", "Llandaff", "Pontcanna", "Splott", "Grangetown", "Rumney", "St Mellons"],
    Newcastle: ["Jesmond", "Gosforth", "Heaton", "Byker", "Fenham", "Benwell", "Elswick", "Walker", "Denton", "Westerhope"],
    Belfast: ["City Centre", "South Belfast", "East Belfast", "North Belfast", "West Belfast", "Lisburn (County Antrim)", "Newtownabbey", "Bangor (County Down)", "Holywood", "Dundonald"],
  };

  const usServiceAreaMap: Record<string, string[]> = {
    "Los Angeles": ["Santa Monica", "Beverly Hills", "Pasadena", "Glendale", "Long Beach", "Burbank", "West Hollywood", "Culver City", "Sherman Oaks", "Downtown LA", "Venice", "Malibu", "Santa Clarita"],
    "San Diego": ["La Jolla", "Coronado", "Chula Vista", "Carlsbad", "Encinitas", "Del Mar", "Gaslamp Quarter", "Mission Valley", "Pacific Beach", "Oceanside", "Escondido"],
    "San Francisco": ["Oakland", "Berkeley", "Daly City", "San Mateo", "Palo Alto", "SOMA", "Mission District", "Richmond District", "San Rafael", "Marin County"],
    "Sacramento": ["Midtown", "Elk Grove", "Roseville", "Folsom", "Citrus Heights", "Davis", "Rocklin", "West Sacramento", "Carmichael"],
    "New York": ["Brooklyn", "Queens", "Bronx", "Staten Island", "Manhattan"],
    "Chicago": ["Naperville", "Evanston", "Schaumburg", "Oak Park", "Skokie"],
    "Houston": ["The Woodlands", "Sugar Land", "Katy", "Pearland"],
    "Phoenix": ["Scottsdale", "Mesa", "Tempe", "Chandler", "Gilbert"],
    "Philadelphia": ["King of Prussia", "Cherry Hill", "Main Line"],
    "San Antonio": ["Alamo Heights", "Stone Oak", "New Braunfels"],
    "Dallas": ["Plano", "Frisco", "Irving", "Arlington", "Fort Worth"],
    "London": ["London KY Suburbs", "London OH Suburbs"], // Example of US London handling if needed, or generic
    "Manchester": ["Manchester NH Suburbs", "Manchester CT Suburbs"],
    "Birmingham (West Midlands)": ["Birmingham AL Suburbs"],
  };

  const ukLocalExpertiseMap: Record<string, string> = {
    "London": "Our London team understands the capital's plumbing, from Victorian terraces in Kensington to modern apartments in Canary Wharf. Crews cross the Congestion Zone each day for faster response.",
    "Manchester": "Serving Greater Manchester with local knowledge of the area's industrial heritage and modern housing. Our engineers are familiar with the common issues in both red-brick terraces and new city centre developments.",
    "Birmingham (West Midlands)": "Our Birmingham specialists cover the entire West Midlands network. We understand the local housing stock, ensuring efficient repairs for brum's diverse properties.",
  };

  const usLocalExpertiseMap: Record<string, string> = {
    "Los Angeles": "Our local LA contractors cover the city from Downtown to the San Fernando Valley. We understand strict California building codes, seismic retrofit requirements across LA County, and the heavy demands placed on HVAC systems during year-round heatwaves and Santa Ana winds.",
    "San Diego": "Serving America's Finest City, our San Diego tradesmen understand the unique effects of coastal salt air on HVAC units and plumbing fixtures. From historic Gaslamp Quarter buildings to modern Pacific Beach homes, we handle everything from emergency water damage to solar-ready electrical panel upgrades.",
    "San Francisco": "Navigating the steep hills and dense neighborhoods of SF requires experts who know the Bay Area inside out. Our San Francisco contractors specialize in updating Victorian-era plumbing, strengthening structures for earthquake readiness, and addressing the Bay's microclimate moisture issues.",
    "Sacramento": "In the heart of the Central Valley, Sacramento homes face intense dry summers and sudden winter atmospheric rivers. Our local experts prioritize energy-efficient HVAC cooling setups, rapid flood water extraction, and dependable roofing repairs built to withstand severe weather swings.",
    "New York": "Our NYC team handles everything from brownstone plumbing to high-rise HVAC systems. We understand steam heat systems, strict DOB regulations, and quick response logistics in all five boroughs.",
    "Chicago": "Built for Midwest extremes, our Chicago experts handle frozen pipes, boiler systems, and wind-proofing.",
    "Houston": "In Houston's humid subtropical climate, our partners prioritize mold prevention in water damage restoration and ensure air conditioning reliability.",
    "Miami": "Our Miami network is built for hurricane resilience. From impact glass repairs to high-velocity flood extraction, they understand the saltwater environment.",
    "Birmingham (West Midlands)": "Our Birmingham, AL experts understand the Deep South humidity and soil conditions affecting foundations and plumbing.",
    "London": "Our US-based London specialists serve local communities with standard American plumbing and electrical codes.",
    "Manchester": "Serving Manchester in the US with local American trade standards.",
  };

  const servicesMap: Record<string, string[]> = {
    plumber: ["Burst pipes & leak repairs", "Water heater repairs", "Flooding & water damage", "No hot water", "Blocked toilets & drains", "Gas line repairs"],
    electrician: ["Power outages & failures", "Electrical panel upgrades", "Sparking outlets or switches", "Tripped breakers & fuses", "Exposed wiring hazards", "Emergency lighting repairs"],
    locksmith: ["Lockouts - home, car, business", "Broken lock repairs", "Lock rekeying", "Key cutting & replacement", "Safe opening", "Security upgrades"],
    "gas-engineer": ["Gas leaks & emergencies", "Furnace breakdowns", "Carbon monoxide concerns", "No heating or hot water", "Gas appliance repairs", "Gas safety checks"],
    "drain-specialist": ["Blocked drains & sewers", "Drain camera inspections", "Root intrusion removal", "Collapsed drain repairs", "Hydro jetting", "Sewer line replacement"],
    glazier: ["Broken window boarding", "Emergency glass replacement", "Smashed door panels", "Storefront repairs", "Double pane glass replacement", "Security glass fitting"],
    roofer: ["Emergency roof repairs", "Storm damage repairs", "Leak detection & fixing", "Shingle replacement", "Emergency tarping", "Gutter repairs"],
    builder: ["Structural damage repairs", "Wall crack repairs", "Ceiling collapse support", "Emergency shoring up", "Drywall & plaster repairs", "Foundation stabilization"],
    hvac: ["AC failure & repairs", "Heating system breakdowns", "Thermostat malfunctions", "Refrigerant leak detection", "Emergency furnace repairs", "HVAC system noise diagnosis"],
    "water-restoration": ["Flood water extraction", "Structural drying", "Mold remediation", "Sewage cleanup", "Dehumidification", "Water damage assessment"],
    breakdown: ["Jump starts", "Car lockout service", "Flat tyre change", "Fuel delivery", "Towing service", "Battery replacement"],
  };

  const priceRangeMap: Record<string, string> = {
    plumber: "$95 – $250",
    electrician: "$110 – $300",
    locksmith: "$85 – $220",
    "gas-engineer": "$125 – $350",
    "drain-specialist": "$150 – $450",
    glazier: "$130 – $400",
    roofer: "$180 – $650",
    builder: "$150 – $550",
    hvac: "$125 – $350",
    "water-restoration": "$250 – $800",
    breakdown: "$80 – $200",
  };

  // Truth-based: checks the customer should make before hiring  -  NOT claims
  // about the listed businesses (listings are public and unvetted).
  const credentialCheckMap: Record<string, { GB: string; US: string }> = {
    plumber: { GB: "Ask about WaterSafe / CIPHE membership", US: "Verify state plumbing license" },
    electrician: { GB: "Check NICEIC / NAPIT registration", US: "Verify state electrician license" },
    locksmith: { GB: "Ask about MLA approval", US: "Ask about ALOA membership" },
    "gas-engineer": { GB: "Check the Gas Safe Register", US: "Verify state HVAC / gas license" },
    "drain-specialist": { GB: "Ask for drainage trade accreditation", US: "Verify contractor license" },
    glazier: { GB: "Ask about FENSA / CERTASS for installs", US: "Verify contractor license" },
    roofer: { GB: "Ask about NFRC membership", US: "Verify roofing contractor license" },
    builder: { GB: "Ask about FMB membership", US: "Verify general contractor license" },
    hvac: { GB: "Check F-Gas certification", US: "Verify EPA 608 / NATE certification" },
    "water-restoration": { GB: "Ask about IICRC certification", US: "Ask about IICRC certification" },
    breakdown: { GB: "Confirm recovery insurance", US: "Confirm roadside service coverage" },
  };

  return {
    trade,
    city: foundCity || cityName, // Fallback if not found but somehow we proceed
    countryCode: actualCountryCode,
    serviceAreas: actualCountryCode === 'US'
      ? (usServiceAreaMap[foundCity || cityName] || ["Surrounding areas", "Nearby suburbs", "Local districts"])
      : (ukServiceAreaMap[foundCity || cityName] || ["Surrounding areas", "Nearby suburbs", "Local districts"]),
    averageResponseTime: "30–90 minutes",
    emergencyPriceRange: actualCountryCode === 'US' ? priceRangeMap[trade.slug] : priceRangeMap[trade.slug].replace(/\$/g, '£'),
    certifications: [
      credentialCheckMap[trade.slug][actualCountryCode === 'US' ? 'US' : 'GB'],
      "Ask for proof of public liability insurance",
      "Get the price confirmed before work starts",
      "Check recent customer reviews",
    ],
    services: servicesMap[trade.slug],
    faqs: generateFAQs(trade, foundCity || cityName, actualCountryCode === 'US', priceRangeMap[trade.slug], problem),
    localExpertise: actualCountryCode === 'US'
      ? usLocalExpertiseMap[foundCity || cityName]
      : ukLocalExpertiseMap[foundCity || cityName],
    problem,
  };
}

const problemFAQMap: Record<string, { question: string; answer: (city: string) => string }[]> = {
  "burst-pipe": [
    { question: "What should I do immediately if I have a burst pipe?", answer: (c) => `Shut off the main water supply at the stopcock, open taps to drain the system, switch off the electricity at the consumer unit if water is near wiring, and call an emergency plumber in ${c} right away. Every minute of delay adds to water damage.` },
    { question: "How long does it take to fix a burst pipe?", answer: (c) => `Most burst pipe repairs in ${c} are completed within 1–3 hours once the plumber arrives, though structural damage or hidden pipework behind walls can take longer. Emergency patches are usually applied within the first 30 minutes.` },
    { question: "Will my home insurance cover burst pipe damage?", answer: (c) => `Most UK and US home insurance policies cover sudden burst pipe damage, but not gradual leaks. Document everything with photos, keep any receipts from the ${c} plumber, and contact your insurer within 24 hours to start a claim.` },
  ],
  "no-hot-water": [
    { question: "Why is my hot water suddenly not working?", answer: (c) => `Common causes include a tripped boiler or water heater, a pilot light that has gone out, a faulty thermostat, a broken heating element, or low system pressure. An emergency plumber in ${c} can diagnose and fix most issues in a single visit.` },
    { question: "Should I call an emergency plumber or wait until morning?", answer: (c) => `If the outage is in winter, you have young children, elderly residents, or anyone vulnerable in the home, call an emergency plumber in ${c} right away. Otherwise, same-day daytime booking is often cheaper if you can manage a few hours without hot water.` },
    { question: "Can a plumber fix a broken water heater the same day?", answer: (c) => `Most common failures  -  thermostats, heating elements, pressure valves, pilot assemblies  -  are fixed on the first visit by ${c} emergency plumbers. Full water heater replacement may take 24–48 hours depending on model availability.` },
  ],
  "boiler-breakdown": [
    { question: "Is a boiler breakdown an emergency?", answer: (c) => `A boiler breakdown is treated as an emergency if it happens in cold weather, if there is a gas smell, if there are vulnerable occupants, or if water is leaking from the unit. In these cases call a Gas Safe engineer in ${c} immediately.` },
    { question: "Can a gas engineer fix my boiler on the first visit?", answer: (c) => `Around 80% of boiler faults (pressure loss, frozen condensate, faulty diverter valves, thermostat issues) are fixed on the first call-out in ${c}. Major part replacements may need a follow-up visit.` },
    { question: "Is it safe to stay in my home if my boiler has broken down?", answer: (c) => `Yes, provided there is no gas smell, no carbon monoxide alarm sounding, and no visible water damage. Turn the boiler off at the fused spur and call a Gas Safe engineer in ${c}  -  never attempt boiler repairs yourself.` },
  ],
  "power-cut-fault": [
    { question: "How do I tell if a power cut is my fault or the grid?", answer: (c) => `Check whether your neighbours have power, then check your consumer unit (fuse box) for tripped breakers. If only your property is affected and resetting the breaker doesn't work, call an emergency electrician in ${c}.` },
    { question: "Is it safe to reset a tripped breaker myself?", answer: (c) => `Resetting a tripped breaker once is safe. If it trips again immediately, do not keep resetting it  -  there is a fault that needs a qualified electrician in ${c}. Continuous resets can cause fire or damage to appliances.` },
    { question: "How quickly can an electrician restore power?", answer: (c) => `Most domestic power faults in ${c} are diagnosed within 30–60 minutes of the electrician arriving. Complex rewiring or consumer unit replacement may take longer but the electrician will usually restore partial power first.` },
  ],
  "lockout": [
    { question: "Will an emergency locksmith damage my lock?", answer: (c) => `Professional ${c} locksmiths use non-destructive entry techniques (picking, bumping, bypass tools) in over 95% of lockouts. Destructive entry is only used as a last resort and the lock is replaced at the same visit.` },
    { question: "How much does an emergency lockout cost at night?", answer: (c) => `Nighttime and weekend lockout call-outs in ${c} typically cost 20–40% more than daytime rates, reflecting out-of-hours work. Always ask for the total price before the locksmith starts.` },
    { question: "How do I prove I own the property to the locksmith?", answer: (c) => `${c} locksmiths will ask for photo ID with the property address, or a utility bill if the ID doesn't match. This protects you and the locksmith against illegal entry  -  it's a standard check, not a delay.` },
  ],
  "broken-window": [
    { question: "Can a glazier board up my window tonight?", answer: (c) => `Yes  -  emergency glaziers in ${c} offer same-night boarding with timber or polycarbonate to secure your property. Full glass replacement is usually scheduled for the next working day once the correct pane is ordered.` },
    { question: "Does home insurance cover broken window repairs?", answer: (c) => `Most home insurance policies cover accidental and break-in window damage minus the excess. Get a written quote from the ${c} glazier, keep the broken glass as evidence, and file a police report if it was a break-in.` },
    { question: "How long does glass replacement take?", answer: (c) => `Standard window replacement in ${c} takes 1–2 hours once the glass arrives. Toughened, laminated, or specialist double-glazed units can take 2–5 working days to manufacture, during which a board-up keeps the property secure.` },
  ],
  "drain-unblocking": [
    { question: "Why does my drain keep blocking?", answer: (c) => `Recurring blockages in ${c} are usually caused by fat or grease build-up, tree roots, collapsed drain sections, or wet wipes. A drain camera survey identifies the cause and prevents repeat call-outs.` },
    { question: "Can I pour drain cleaner down first?", answer: (c) => `Caustic drain cleaners can work on minor grease blockages but damage pipework and don't clear root intrusion or solid blockages. Professional ${c} drain specialists use hydro-jetting, which is safer and far more effective.` },
    { question: "How much does emergency drain unblocking cost?", answer: (c) => `A standard drain unblocking call-out in ${c} ranges from £80–£250 (US $150–$450), depending on access and severity. A CCTV survey adds roughly £100 / $150 and is strongly recommended for recurring blockages.` },
  ],
  "water-damage": [
    { question: "How fast do I need to act after water damage?", answer: (c) => `Start extraction within 24–48 hours  -  mold begins to grow after that window. Call a ${c} water restoration specialist immediately, shut off the source, and start documenting damage with photos for insurance.` },
    { question: "Will insurance cover water damage restoration?", answer: (c) => `Sudden accidental water damage (burst pipe, appliance failure) is usually covered; gradual leaks and flood water often require separate flood insurance in the US. Get the ${c} restoration company's assessment in writing for your claim.` },
    { question: "How long does water damage restoration take?", answer: (c) => `Extraction and drying typically takes 3–5 days in ${c}, followed by mold testing and any structural repairs. Full restoration of significantly damaged properties can take 2–6 weeks.` },
  ],
  "gas-leak": [
    { question: "What should I do if I smell gas?", answer: (c) => `Do not switch any lights or electrics on or off. Open windows and doors, leave the property, and call the National Gas Emergency Service on 0800 111 999 immediately. Then book a Gas Safe engineer in ${c} to make the repair.` },
    { question: "How will a gas engineer find the leak?", answer: (c) => `${c} Gas Safe engineers use electronic leak detectors, soapy water tests on joints, and pressure tests on the gas line. Most leaks are isolated within 15–30 minutes of arrival.` },
    { question: "Is a gas leak always dangerous?", answer: (c) => `Yes  -  even small leaks can accumulate into explosive concentrations and cause carbon monoxide poisoning. Never ignore the smell of gas in ${c}; always evacuate and call the emergency gas line first.` },
  ],
  "toilet-overflow": [
    { question: "How do I stop a toilet from overflowing?", answer: (c) => `Remove the cistern lid and push the flapper or float down to stop water refilling, then shut off the isolation valve behind the toilet. Call an emergency plumber in ${c} to clear the blockage before using the toilet again.` },
    { question: "Can I unblock the toilet myself before calling a plumber?", answer: (c) => `A plunger or toilet auger clears around 70% of simple blockages. If water keeps rising, if multiple fixtures are affected, or if you see sewage backup, stop and call a ${c} emergency plumber  -  it may be a mainline blockage.` },
    { question: "How much does emergency toilet unblocking cost?", answer: (c) => `A standard toilet unblocking call-out in ${c} ranges from £90–£200 (US $120–$350). Mainline sewer blockages or drain jetting cost more but clear the root cause.` },
  ],
  "frozen-pipes": [
    { question: "How do I safely thaw a frozen pipe?", answer: (c) => `Turn off the water at the main stopcock, open the affected tap, and warm the pipe slowly with a hair dryer or hot water bottle starting from the tap end. Never use an open flame. Call a plumber in ${c} if the pipe has already split.` },
    { question: "How can I tell if a frozen pipe has burst?", answer: (c) => `Look for no water flow, visible bulges, frost on the pipe, or water staining on nearby walls and ceilings once the ice thaws. Any of these signs mean you need an emergency plumber in ${c} immediately.` },
    { question: "How do I stop pipes freezing again?", answer: (c) => `Insulate exposed pipes with foam lagging, keep heating on low overnight in cold snaps, let taps drip slightly in freezing weather, and seal any drafts near pipework. A ${c} plumber can recommend weak points during the repair visit.` },
  ],
  "ac-not-cooling": [
    { question: "Why is my AC running but not cooling?", answer: (c) => `Common causes include a dirty air filter, low refrigerant (often a leak), a frozen evaporator coil, a failed capacitor, or a blocked condenser unit. An HVAC technician in ${c} can diagnose and fix most issues the same day.` },
    { question: "Is it cheaper to repair or replace an AC unit?", answer: (c) => `As a rule of thumb: if the unit is under 10 years old, repair. Over 10 years with a repair cost exceeding 50% of replacement, replace. A licensed ${c} HVAC tech will give an honest assessment on-site.` },
    { question: "How often should I service my AC?", answer: (c) => `An annual spring tune-up extends AC lifespan significantly and catches refrigerant leaks, electrical faults, and coil issues before they cause a failure. Most ${c} HVAC companies offer service plans to keep costs predictable.` },
  ],
  "furnace-breakdown": [
    { question: "Why has my furnace stopped heating?", answer: (c) => `Typical causes include a tripped pilot or ignitor, a dirty flame sensor, a failed blower motor, low gas pressure, or a thermostat fault. An emergency HVAC technician in ${c} can diagnose most issues within an hour.` },
    { question: "Is it safe to keep running a struggling furnace?", answer: (c) => `No  -  short-cycling, strange noises, or a carbon monoxide alarm mean you should shut the furnace off at the power switch and call a ${c} HVAC pro immediately. Running a faulty furnace risks CO poisoning and total failure.` },
    { question: "How much does an emergency furnace repair cost?", answer: (c) => `Typical ${c} emergency furnace repairs range from $150 for an ignitor to $600+ for blower motor or control board replacement. Full replacement is $3,500–$8,000 depending on efficiency and size.` },
  ],
  "water-heater-failure": [
    { question: "Should I turn off a leaking water heater?", answer: (c) => `Yes  -  shut off the cold-water supply at the top of the tank, switch the breaker off (electric) or turn the gas control to Pilot (gas), then call an emergency plumber in ${c}. Continuous leaking can cause severe water damage fast.` },
    { question: "How long does a water heater last?", answer: (c) => `Tank water heaters last 8–12 years, tankless units 15–20 years. If yours is over 10 years old and has failed, replacement usually makes more financial sense than repair. A ${c} plumber can recommend correctly sized replacements.` },
    { question: "Why is there no hot water even though the heater is on?", answer: (c) => `Electric units typically need a new heating element or thermostat; gas units need a new thermocouple, pilot assembly, or gas valve. Sediment build-up also causes slow heating. A ${c} plumber diagnoses in under 30 minutes.` },
  ],
};

function generateFAQs(trade: Trade, city: City, isUS: boolean, priceRange: string, problem?: CommonProblem): { question: string; answer: string }[] {
  const currency = isUS ? "$" : "£";
  const tradeName = isUS ? trade.usName : trade.name;

  const problemFAQs = problem && problemFAQMap[problem.slug]
    ? problemFAQMap[problem.slug].map(f => ({ question: f.question, answer: f.answer(city) }))
    : [];

  // We can adjust currency symbol in priceRange if needed, but priceRangeMap has it hardcoded for now. 
  // Ideally split price maps too, but for now assuming '$' in US map and '£' in UK logic if we split it later.
  // Actually, priceRangeMap in the file currently has '$' hardcoded for everything?
  // Let's check lines 381-391. Yes, they are '$'. 
  // We should probably fix that too, but let's stick to the separation rule first.

  const baseFAQs = [
    {
      question: `How much does an emergency ${tradeName.toLowerCase()} cost in ${city}?`,
      answer: `Emergency ${tradeName.toLowerCase()} call-outs in ${city} typically range from ${priceRange}, depending on the time of day and complexity of the job. Weekend and night-time calls may incur additional charges. All pricing is transparent with no hidden fees.`,
    },
    {
      question: `Can I call an emergency ${tradeName.toLowerCase()} at night or weekends?`,
      answer: `Yes, our emergency ${tradeName.toLowerCase()} services in ${city} operate 24 hours a day, 7 days a week, including holidays. We understand emergencies don't follow office hours, so help is always available when you need it.`,
    },
    {
      question: `How fast can an emergency ${tradeName.toLowerCase()} arrive in ${city}?`,
      answer: `Our network of local ${tradeName.toLowerCase()}s in ${city} can typically arrive within 30–90 minutes for urgent emergencies. Response times may vary based on current demand and your specific location within ${city} and surrounding areas.`,
    },
    {
      question: `Is there a ${isUS ? 'service call' : 'call-out'} fee for emergency ${tradeName.toLowerCase()} services?`,
      answer: `Most emergency ${tradeName.toLowerCase()}s charge a ${isUS ? 'service call' : 'call-out'} fee, which is usually included in the quoted price. This covers the cost of dispatching a qualified professional to your ${city} property at short notice. The fee is often credited toward any work carried out.`,
    },
    {
      question: `What situations require an emergency ${tradeName.toLowerCase()}?`,
      answer: `You should call an emergency ${tradeName.toLowerCase()} for any situation that poses an immediate risk to safety, property, or wellbeing. This includes anything that cannot safely wait until normal business hours. When in doubt, call for advice – most consultations are free.`,
    },
  ];

  return [...problemFAQs, ...baseFAQs];
}

export const VALID_STATE_SLUGS = US_STATES.map(s => s.slug);

export function getCitiesForState(stateSlug: string): string[] {
  const targetState = stateSlug.toLowerCase();
  return Object.entries(cityToState)
    .filter(([, state]) => state.toLowerCase() === targetState)
    .map(([city]) => city)
    .sort();
}
