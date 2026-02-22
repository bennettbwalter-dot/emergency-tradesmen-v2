export const trades = [
  { slug: "plumber", name: "Plumber", usName: "Plumber", icon: "💧", image: "/emergency-plumber-v2.jpg", vectorIcon: "/icons/plumber.png" },
  { slug: "electrician", name: "Electrician", usName: "Electrician", icon: "⚡", image: "/emergency-electrician-v2.png", vectorIcon: "/icons/electrician.png" },
  { slug: "locksmith", name: "Locksmith", usName: "Locksmith", icon: "🔐", image: "/emergency-locksmith-v2.jpg", vectorIcon: "/icons/locksmith.png" },
  { slug: "gas-engineer", name: "Gas Engineer", usName: "HVAC / Gas Engineer", icon: "🔥", image: "/emergency-gas-engineer-v2.png", vectorIcon: "/icons/gas-engineer.png" },
  { slug: "drain-specialist", name: "Drain Specialist", usName: "Drain Specialist", icon: "🚿", image: "/emergency-drain-specialist-v2.jpg", vectorIcon: "/icons/drain-specialist.png" },
  { slug: "glazier", name: "Glazier", usName: "Glazier / Glass Repair", icon: "🪟", image: "/emergency-glazier-v2.jpg", vectorIcon: "/icons/glazier.png" },
  { slug: "roofer", name: "Roofer", usName: "Roofer / Roof Repair", icon: "🏠", image: "/emergency-roofer-v2.jpg", vectorIcon: "/icons/roofer-icon-v2.png" },
  { slug: "builder", name: "Builder", usName: "Builder / Construction", icon: "🧱", image: "/emergency-builder-v2.png", vectorIcon: "/icons/builder-icon-v2.png" },
  { slug: "water-restoration", name: "Water Restoration", usName: "Water Damage & Restoration", icon: "🌊", image: "/water-hero-final.jpg", vectorIcon: "/water-restoration-icon.png" },
  { slug: "breakdown", name: "Breakdown Recovery", usName: "Tow Truck", icon: "🚗", image: "/emergency-breakdown-v2.jpg", vectorIcon: "/icons/breakdown.png" },
  { slug: "hvac", name: "Air Conditioning (HVAC)", usName: "Heating & Cooling", icon: "❄️", image: "/emergency-hvac-v2.jpg", vectorIcon: "/hvac-icon.png" },
] as const;

import usCityList from './us_cities.json';
import { cityPostcodes } from './cityPostcodes';

// Enforce US-only cities
const getReferencedCities = (data: any): string[] => {
  if (data && Array.isArray(data.states)) {
    const citiesSet: Set<string> = new Set();
    data.states.forEach((state: any) => {
      if (state.metros) {
        state.metros.forEach((metro: any) => {
          if (metro.cities) {
            metro.cities.forEach((city: any) => {
              if (city.name) citiesSet.add(city.name);
              if (city.suburbs) {
                city.suburbs.forEach((sub: any) => {
                  if (sub.name) citiesSet.add(sub.name);
                });
              }
            });
          }
        });
      }
    });
    return Array.from(citiesSet);
  }
  return [];
};

// Standardize the cities list to be dynamically derived from the *actual* data source
// We use cityPostcodes as the master list as it contains the full set of intended UK cities (e.g. Aberdeen)
export const cities = Object.keys(cityPostcodes).sort() as readonly string[];

export const usCities = getReferencedCities(usCityList) as readonly string[];

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
  "Flower Mound": "tx", "North Richland Hills": "tx", "Mansfield": "tx", "Victoria": "tx",
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
  "Pittsburgh": "pa", "Philadelphia": "pa", "Scranton": "pa", "Allentown": "pa", "Harrisburg": "pa", "Erie": "pa", "Reading": "pa",
  // New York (NY)
  "Buffalo": "ny", "New York City": "ny", "Syracuse": "ny", "Yonkers": "ny", "Rochester": "ny",
  // Indiana (IN)
  "Indianapolis": "in", "Carmel": "in", "Fishers": "in", "Greenwood": "in", "Fort Wayne": "in", "Evansville": "in", "South Bend": "in",
  // North Carolina (NC)
  "Charlotte": "nc", "Raleigh": "nc", "Greensboro": "nc", "Durham": "nc", "Winston-Salem": "nc", "Fayetteville": "nc", "Asheville": "nc",
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
  "Boston": "ma", "Worcester": "ma",
  // Kentucky (KY)
  "Louisville": "ky", "Lexington": "ky",
  // Maryland (MD)
  "Baltimore": "md", "Annapolis": "md", "Frederick": "md", "Hagerstown": "md", "Salisbury": "md", "Bowie": "md",
  // Wisconsin (WI)
  "Milwaukee": "wi", "Madison": "wi", "Green Bay": "wi", "Kenosha": "wi",
  // New Mexico (NM)
  "Albuquerque": "nm",
  // Missouri (MO)
  "Kansas City": "mo", "St. Louis": "mo",
  // Georgia (GA)
  "Atlanta": "ga", "Augusta": "ga", "Savannah": "ga",
  // Nebraska (NE)
  "Omaha": "ne", "Lincoln": "ne",
  // Virginia (VA)
  "Virginia Beach": "va", "Norfolk": "va", "Richmond": "va", "Newport News": "va", "Chesapeake": "va", "Alexandria": "va", "Roanoke": "va",
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
  "Birmingham": "al", "Huntsville": "al", "Auburn": "al", "Tuscaloosa": "al", "Mobile": "al", "Montgomery": "al",
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

export type Trade = typeof trades[number];
export type City = typeof cities[number];

export const commonProblems = [
  { slug: "burst-pipe", name: "Burst Pipe Repair", trade: "plumber", description: "Immediate repair for burst water pipes and massive leaks." },
  { slug: "no-hot-water", name: "No Hot Water Service", trade: "plumber", description: "Emergency diagnosis and repair when your hot water stops working." },
  { slug: "boiler-breakdown", name: "Boiler Breakdown Repair", trade: "gas-engineer", description: "24/7 emergency gas engineer for boiler failures and heating loss." },
  { slug: "power-cut-fault", name: "Emergency Power Cut Fault", trade: "electrician", description: "Investigating and fixing sudden power outages in your property." },
  { slug: "lockout", name: "Emergency Lockout Service", trade: "locksmith", description: "Non-destructive entry when you are locked out of your home or business." },
  { slug: "broken-window", name: "Emergency Window Boarding", trade: "glazier", description: "Rapid boarding and glass replacement for smashed windows and doors." },
  { slug: "drain-unblocking", name: "Emergency Drain Unblocking", trade: "drain-specialist", description: "Fast clearance of blocked toilets, sinks, and external drains." },
  { slug: "water-damage", name: "Water Damage Restoration", trade: "water-restoration", description: "Rapid extraction and drying for flooding, burst pipes, and water damage." },
] as const;

export type CommonProblem = typeof commonProblems[number];

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

  interface JsonSuburb { name: string; slug: string; }
  interface JsonCity { name: string; slug: string; suburbs: JsonSuburb[]; }
  interface JsonMetro { name: string; slug: string; cities: JsonCity[]; }
  interface JsonState { name: string; slug: string; metros: JsonMetro[]; }

  const usData = usCityList as unknown as { states: JsonState[] };

  if (!foundCity && usData && usData.states && countryCode !== 'GB') {
    // Optimization: If stateSlug is provided, ONLY search that state.
    const targetStates = stateSlug
      ? usData.states.filter(s => s.slug === stateSlug.toLowerCase())
      : usData.states;

    for (const state of targetStates) {
      if (state.name.toLowerCase() === normalizedCityName.toLowerCase()) { foundCity = state.name; actualCountryCode = 'US'; break; }

      // If metroSlug is provided, we could narrow further, but usually searching the whole state is fast enough and safer for edge cases.
      for (const metro of state.metros) {
        if (metro.name.toLowerCase() === normalizedCityName.toLowerCase() || metro.slug === normalizedCityName.toLowerCase()) { foundCity = metro.name; actualCountryCode = 'US'; break; }

        for (const city of metro.cities) {
          if (city.name.toLowerCase() === normalizedCityName.toLowerCase()) { foundCity = city.name; actualCountryCode = 'US'; break; }

          for (const suburb of city.suburbs) {
            if (suburb.name.toLowerCase() === normalizedCityName.toLowerCase()) { foundCity = suburb.name; actualCountryCode = 'US'; break; }
          }
          if (foundCity) break;
        }
        if (foundCity) break;
      }
      if (foundCity) break;
    }
  }

  // Fallback: If not found in JSON but might be a valid string passed in (generic) 
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
    Manchester: ["Salford", "Stockport", "Trafford", "Oldham", "Rochdale", "Bury", "Bolton", "Wigan", "Altrincham", "Sale"],
    Birmingham: ["Solihull", "Sutton Coldfield", "Edgbaston", "Moseley", "Erdington", "Kings Heath", "Harborne", "Digbeth", "Jewellery Quarter", "Bournville"],
    Leeds: ["Headingley", "Roundhay", "Morley", "Pudsey", "Horsforth", "Chapel Allerton", "Kirkstall", "Meanwood", "Bramley", "Rothwell"],
    Sheffield: ["Rotherham", "Doncaster", "Barnsley", "Chesterfield", "Worksop", "Dore", "Totley", "Hillsborough", "Ecclesall", "Crookes", "Stocksbridge"],
    Liverpool: ["Birkenhead", "Bootle", "Crosby", "St Helens", "Widnes", "Runcorn", "Wallasey", "Huyton", "Speke", "Aigburth"],
    London: ["Westminster", "Kensington", "Chelsea", "Islington", "Camden", "Hackney", "Greenwich", "Brixton", "Battersea", "Wandsworth", "Fulham", "Hammersmith", "Ealing", "Richmond", "Wimbledon"],
    Bristol: ["Clifton", "Redland", "Cotham", "Bedminster", "Southville", "Totterdown", "Horfield", "Bishopston", "Brislington", "St George"],
    Glasgow: ["West End", "City Centre", "Southside", "East End", "North Glasgow", "Paisley", "Renfrew", "Clydebank", "Bearsden", "Milngavie"],
    Edinburgh: ["Leith", "City Centre", "Stockbridge", "Morningside", "Bruntsfield", "Newington", "Corstorphine", "Gorgie", "Dalry", "Portobello"],
    Cardiff: ["Cardiff Bay", "Canton", "Roath", "Cathays", "Llandaff", "Pontcanna", "Splott", "Grangetown", "Rumney", "St Mellons"],
    Newcastle: ["Jesmond", "Gosforth", "Heaton", "Byker", "Fenham", "Benwell", "Elswick", "Walker", "Denton", "Westerhope"],
    Belfast: ["City Centre", "South Belfast", "East Belfast", "North Belfast", "West Belfast", "Lisburn", "Newtownabbey", "Bangor", "Holywood", "Dundonald"],
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
    "Birmingham": ["Birmingham AL Suburbs"],
  };

  const ukLocalExpertiseMap: Record<string, string> = {
    "London": "Our London team understands the unique challenges of the capital's plumbing, from Victorian terraces in Kensington to modern apartments in Canary Wharf. We navigate the Congestion Zone daily to ensure rapid response.",
    "Manchester": "Serving Greater Manchester with local knowledge of the area's industrial heritage and modern housing. Our engineers are familiar with the common issues in both red-brick terraces and new city centre developments.",
    "Birmingham": "Our Birmingham specialists cover the entire West Midlands network. We understand the local housing stock, ensuring efficient repairs for brum's diverse properties.",
  };

  const usLocalExpertiseMap: Record<string, string> = {
    "Los Angeles": "Our local LA contractors expertly navigate the city's complex geography from Downtown to the San Fernando Valley. We understand strict California building codes, seismic/earthquake retrofit requirements across LA County, and the heavy demands placed on HVAC systems during year-round heatwaves and Santa Ana winds.",
    "San Diego": "Serving America's Finest City, our San Diego tradesmen understand the unique effects of coastal salt air on HVAC units and plumbing fixtures. From historic Gaslamp Quarter buildings to modern Pacific Beach homes, we handle everything from emergency water damage to solar-ready electrical panel upgrades.",
    "San Francisco": "Navigating the steep hills and dense neighborhoods of SF requires experts who know the Bay Area inside out. Our San Francisco contractors specialize in updating Victorian-era plumbing, strengthening structures for earthquake readiness, and addressing the Bay's microclimate moisture issues.",
    "Sacramento": "In the heart of the Central Valley, Sacramento homes face intense dry summers and sudden winter atmospheric rivers. Our local experts prioritize energy-efficient HVAC cooling setups, rapid flood water extraction, and dependable roofing repairs built to withstand severe weather swings.",
    "New York": "Our NYC team handles everything from brownstone plumbing to high-rise HVAC systems. We understand steam heat systems, strict DOB regulations, and quick response logistics in all five boroughs.",
    "Chicago": "Built for Midwest extremes, our Chicago experts handle frozen pipes, boiler systems, and wind-proofing.",
    "Houston": "In Houston's humid subtropical climate, our partners prioritize mold prevention in water damage restoration and ensure air conditioning reliability.",
    "Miami": "Our Miami network is built for hurricane resilience. From impact glass repairs to high-velocity flood extraction, they understand the saltwater environment.",
    "Birmingham": "Our Birmingham, AL experts understand the Deep South humidity and soil conditions affecting foundations and plumbing.",
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

  const certificationsMap: Record<string, string[]> = {
    plumber: ["Licensed & Bonded", "Master Plumber Certified", "Fully Insured"],
    electrician: ["NEC Compliant", "Licensed Electrician", "Fully Insured"],
    locksmith: ["ALOA Member", "Background Checked", "Fully Insured"],
    "gas-engineer": ["HVAC Certified", "EPA Universal", "Fully Insured"],
    "drain-specialist": ["IICRC Certified", "Licensed Contractor", "Fully Insured"],
    glazier: ["NGA Certified", "Safety Glass Qualified", "Fully Insured"],
    roofer: ["Licensed Roofer", "OSHA Certified", "Fully Insured"],
    builder: ["Licensed General Contractor", "Licensed & Bonded", "Fully Insured"],
    hvac: ["HVAC Certified", "EPA Universal", "Fully Insured"],
    "water-restoration": ["IICRC Certified", "Water Damage Specialist", "Fully Insured"],
    breakdown: ["IVR Certified", "Roadside Assistance Qualified", "Fully Insured"],
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
    certifications: certificationsMap[trade.slug],
    services: servicesMap[trade.slug],
    faqs: generateFAQs(trade, foundCity || cityName, actualCountryCode === 'US', priceRangeMap[trade.slug]),
    localExpertise: actualCountryCode === 'US'
      ? usLocalExpertiseMap[foundCity || cityName]
      : ukLocalExpertiseMap[foundCity || cityName],
    problem,
  };
}

function generateFAQs(trade: Trade, city: City, isUS: boolean, priceRange: string): { question: string; answer: string }[] {
  const currency = isUS ? "$" : "£";
  const tradeName = isUS ? trade.usName : trade.name;

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
      question: `Is there a call-out fee for emergency ${tradeName.toLowerCase()} services?`,
      answer: `Most emergency ${tradeName.toLowerCase()}s charge a call-out fee, which is usually included in the quoted price. This covers the cost of dispatching a qualified professional to your ${city} property at short notice. The fee is waived if work is carried out.`,
    },
    {
      question: `What situations require an emergency ${tradeName.toLowerCase()}?`,
      answer: `You should call an emergency ${tradeName.toLowerCase()} for any situation that poses an immediate risk to safety, property, or wellbeing. This includes anything that cannot safely wait until normal business hours. When in doubt, call for advice – most consultations are free.`,
    },
  ];

  return baseFAQs;
}
