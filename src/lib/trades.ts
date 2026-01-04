export const trades = [
  { slug: "plumber", name: "Plumber", usName: "Plumber", icon: "💧", image: "/emergency-plumber-v2.jpg", vectorIcon: "/icons/plumber.png" },
  { slug: "electrician", name: "Electrician", usName: "Electrician", icon: "⚡", image: "/emergency-electrician-v2.png", vectorIcon: "/icons/electrician.png" },
  { slug: "locksmith", name: "Locksmith", usName: "Locksmith", icon: "🔐", image: "/emergency-locksmith-v2.jpg", vectorIcon: "/icons/locksmith.png" },
  { slug: "gas-engineer", name: "Gas Engineer", usName: "HVAC / Gas Engineer", icon: "🔥", image: "/emergency-gas-engineer-v2.png", vectorIcon: "/icons/gas-engineer.png" },
  { slug: "drain-specialist", name: "Drain Specialist", usName: "Drain Specialist", icon: "🚿", image: "/emergency-drain-specialist-v2.jpg", vectorIcon: "/icons/drain-specialist.png" },
  { slug: "glazier", name: "Glazier", usName: "Glazier / Glass Repair", icon: "🪟", image: "/emergency-glazier-v2.jpg", vectorIcon: "/icons/glazier.png" },
  { slug: "roofer", name: "Roofer", usName: "Roofer / Roof Repair", icon: "🏠", image: "/emergency-roofer-v2.jpg", vectorIcon: "/icons/roofer-icon-v2.png" },
  { slug: "builder", name: "Builder", usName: "Builder / Construction", icon: "🧱", image: "/emergency-builder-v2.png", vectorIcon: "/icons/builder-icon-v2.png" },
  { slug: "breakdown", name: "Breakdown Recovery", usName: "Tow Truck", icon: "🚗", image: "/emergency-breakdown-v2.jpg", vectorIcon: "/icons/breakdown.png" },
] as const;

import ukCityList from './uk_cities.json';
import usCityList from './us_cities.json';

export const cities = ukCityList as const;
export const usCities = usCityList as const;

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
}

export function generateTradePageData(tradeSlug: string, cityName: string, countryCode: string = 'GB'): TradePageData | null {
  // Allow tradeSlug to also be a problem slug
  const problem = commonProblems.find(p => p.slug === tradeSlug);
  const trade = trades.find(t => t.slug === (problem ? problem.trade : tradeSlug));

  // Basic city normalization
  const normalizedCityName = cityName.replace(/-/g, ' ');

  // Try to find in UK cities first (default)
  let foundCity = (cities as readonly string[]).find(c => c.toLowerCase() === normalizedCityName.toLowerCase());
  let actualCountryCode = countryCode;

  // If not found and countryCode is GB (default), try US cities
  if (!foundCity && countryCode === 'GB') {
    foundCity = (usCities as readonly string[]).find(c => c.toLowerCase() === normalizedCityName.toLowerCase());
    if (foundCity) {
      actualCountryCode = 'US';
    }
  } else if (countryCode === 'US') {
    foundCity = (usCities as readonly string[]).find(c => c.toLowerCase() === normalizedCityName.toLowerCase());
  }

  const city = foundCity || (actualCountryCode === 'US' ? normalizedCityName : null);

  if (!trade || !city) return null;

  const serviceAreaMap: Record<string, string[]> = {
    Manchester: ["Salford", "Stockport", "Trafford", "Oldham", "Rochdale", "Bury", "Bolton", "Wigan", "Altrincham", "Sale"],
    Birmingham: ["Solihull", "Sutton Coldfield", "Edgbaston", "Moseley", "Erdington", "Kings Heath", "Harborne", "Digbeth", "Jewellery Quarter", "Bournville"],
    Leeds: ["Headingley", "Roundhay", "Morley", "Pudsey", "Horsforth", "Chapel Allerton", "Kirkstall", "Meanwood", "Bramley", "Rothwell"],
    Sheffield: ["Rotherham", "Doncaster", "Barnsley", "Chesterfield", "Worksop", "Dore", "Totley", "Hillsborough", "Ecclesall", "Crookes", "Stocksbridge"],
    Liverpool: ["Birkenhead", "Bootle", "Crosby", "St Helens", "Widnes", "Runcorn", "Wallasey", "Huyton", "Speke", "Aigburth"],
    Nottingham: ["Beeston", "Arnold", "Carlton", "West Bridgford", "Hucknall", "Sherwood", "Mapperley", "Lenton", "Wollaton"],
    London: ["Westminster", "Kensington", "Chelsea", "Islington", "Camden", "Hackney", "Greenwich", "Brixton", "Battersea", "Wandsworth", "Fulham", "Hammersmith", "Ealing", "Richmond", "Wimbledon"],
    Bristol: ["Clifton", "Bedminster", "Filton", "Horfield", "Redland", "Stoke Bishop", "Brislington", "Keynsham", "Kingswood", "Portishead"],
    Glasgow: ["West End", "City Centre", "Southside", "Govan", "Partick", "Hillhead", "Shawlands", "Gorbals", "Dennistoun", "Bearsden"],
    Edinburgh: ["Leith", "Morningside", "Bruntsfield", "Stockbridge", "New Town", "Old Town", "Portobello", "Corstorphine", "Gorgie", "Dalry"],
    Cardiff: ["Cardiff Bay", "Canton", "Roath", "Cathays", "Llandaff", "Pontcanna", "Splott", "Grangetown", "Penylan", "Cyncoed"],
    Newcastle: ["Jesmond", "Gosforth", "Heaton", "Byker", "Fenham", "Walker", "Benwell", "Kenton", "Wallsend", "Gateshead"],
    "Stoke-on-Trent": ["Hanley", "Burslem", "Tunstall", "Longton", "Fenton", "Stoke", "Newcastle-under-Lyme", "Trentham", "Meir"],
    Leicester: ["Oadby", "Wigston", "Evington", "Aylestone", "Braunstone", "Glenfield", "Birstall", "Syston", "Narborough"],
    Coventry: ["Earlsdon", "Cheylesmore", "Stoke", "Foleshill", "Radford", "Coundon", "Binley", "Willenhall", "Tile Hill"],
    Sunderland: ["Hendon", "Ryhope", "Silksworth", "Pallion", "Southwick", "Fulwell", "Castletown", "Seaburn", "Whitburn"],
    Brighton: ["Hove", "Kemptown", "Preston Park", "Hanover", "Patcham", "Withdean", "Moulsecoomb", "Hollingbury", "Woodingdean"],
    Hull: ["Hessle", "Cottingham", "Anlaby", "Willerby", "Hedon", "Bilton", "Sutton-on-Hull", "Kingswood", "Orchard Park"],
    Plymouth: ["Plympton", "Plymstock", "Devonport", "Mutley", "Stoke", "Keyham", "Crownhill", "Eggbuckland", "Efford"],
    Derby: ["Allestree", "Mickleover", "Littleover", "Chaddesden", "Spondon", "Alvaston", "Chellaston", "Sinfin", "Normanton"],
    Southampton: ["Shirley", "Portswood", "Bitterne", "Woolston", "Totton", "Eastleigh", "Chandler's Ford", "Romsey", "Hythe"],
    Portsmouth: ["Southsea", "Fratton", "Cosham", "Drayton", "Farlington", "Paulsgrove", "Port Solent", "Hilsea", "Copnor"],
    "Milton Keynes": ["Bletchley", "Wolverton", "Stony Stratford", "Newport Pagnell", "Shenley Brook End", "Loughton", "Bradwell", "Campbell Park"],
    Northampton: ["Abington", "Kingsthorpe", "Duston", "Far Cotton", "Delapre", "Hardingstone", "Wootton", "Grange Park", "Moulton"],
    Luton: ["Leagrave", "Stopsley", "Wigmore", "Bury Park", "Marsh Farm", "Sundon Park", "Limbury", "Challney", "Round Green"],
    Norwich: ["Thorpe St Andrew", "Sprowston", "Hellesdon", "Catton", "Eaton", "Bowthorpe", "Lakenham", "Trowse", "Cringleford"],
    Aberdeen: ["Dyce", "Bridge of Don", "Peterculter", "Cove Bay", "Torry", "Kincorth", "Mastrick", "Northfield", "Seaton"],
    Bournemouth: ["Boscombe", "Winton", "Charminster", "Kinson", "Southbourne", "Westbourne", "Moordown", "Wallisdown", "Pokesdown"],
    Swindon: ["Old Town", "Gorse Hill", "Pinehurst", "Penhill", "Moredon", "Stratton St Margaret", "Wroughton", "Highworth", "Blunsdon"],
    Cambridge: ["Cherry Hinton", "Chesterton", "Trumpington", "Grantchester", "Fen Ditton", "Girton", "Histon", "Milton", "Teversham"],
    Oxford: ["Headington", "Cowley", "Iffley", "Summertown", "Wolvercote", "Botley", "Jericho", "Blackbird Leys", "Littlemore"],
    Belfast: ["Titanic Quarter", "Falls Road", "Shankill", "Ballyhackamore", "Lisburn Road", "Malone Road", "Castlereagh", "Dundonald", "Newtownabbey"],
    York: ["Acomb", "Clifton", "Heworth", "Holgate", "Hull Road", "Micklegate", "Rawcliffe", "Tang Hall", "Westfield"],
    Ipswich: ["Chantry", "Gainsborough", "Hazlewood", "Maidenhall", "Pinewood", "Racecourse", "Rushmere", "Stoke Park", "Warren Heath"],
    Blackpool: ["North Shore", "South Shore", "Bispham", "Layton", "Marton", "Stanley Park", "Warbreck", "Anchorsholme", "Norbreck"],
    Middlesbrough: ["Linthorpe", "Acklam", "Marton", "Nunthorpe", "Coulby Newham", "Hemlington", "Stainton", "Thorntree", "Brambles Farm"],
    Bolton: ["Farnworth", "Horwich", "Westhoughton", "Kearsley", "Little Lever", "Blackrod", "Breightmet", "Great Lever", "Halliwell"],
    Stockport: ["Cheadle", "Gatley", "Bramhall", "Hazel Grove", "Marple", "Romiley", "Reddish", "Heaton Mersey", "Heaton Moor"],
    Preston: ["Fulwood", "Penwortham", "Bamber Bridge", "Lostock Hall", "Ribbleton", "Ashton-on-Ribble", "Lea", "Ingol", "Grimsargh"],
    Reading: ["Caversham", "Tilehurst", "Whitley", "Earley", "Woodley", "Coley", "Katesgrove", "Southcote", "Norcot"],
    Wolverhampton: ["Tettenhall", "Wednesfield", "Bilston", "Penn", "Whitmore Reans", "Heath Town", "Oxley", "Bushbury", "Fallings Park"],
    Huddersfield: ["Lindley", "Marsh", "Milnsbridge", "Golcar", "Slaithwaite", "Holmfirth", "Almondbury", "Dalton", "Kirkheaton"],
    Slough: ["Langley", "Cippenham", "Chalvey", "Upton", "Wexham", "Manor Park", "Britwell", "Haymill", "Colnbrook"],
    Luton: ["Leagrave", "Stopsley", "Wigmore", "Bury Park", "Marsh Farm", "Sundon Park", "Limbury", "Challney", "High Town"],
    "Milton Keynes": ["Bletchley", "Wolverton", "Stony Stratford", "Newport Pagnell", "Shenley Brook End", "Loughton", "Bradwell", "Central Milton Keynes"],
    Northampton: ["Abington", "Kingsthorpe", "Duston", "Far Cotton", "Delapre", "Hardingstone", "Wootton", "Grange Park", "Moulton"],
    Norwich: ["Thorpe St Andrew", "Sprowston", "Hellesdon", "Catton", "Eaton", "Bowthorpe", "Lakenham", "Trowse", "Golden Triangle"],
    Aberdeen: ["Dyce", "Bridge of Don", "Peterculter", "Cove Bay", "Torry", "Kincorth", "Mastrick", "Northfield", "Old Aberdeen"],
    Bournemouth: ["Boscombe", "Winton", "Charminster", "Kinson", "Southbourne", "Westbourne", "Moordown", "Wallisdown", "Lansdowne"],
    Swindon: ["Old Town", "Gorse Hill", "Pinehurst", "Penhill", "Moredon", "Stratton St Margaret", "Wroughton", "Highworth", "West Swindon"],
    Cambridge: ["Cherry Hinton", "Chesterton", "Trumpington", "Grantchester", "Fen Ditton", "Girton", "Histon", "Milton", "Newnham"],
    Oxford: ["Headington", "Cowley", "Iffley", "Summertown", "Wolvercote", "Botley", "Jericho", "Blackbird Leys", "Littlemore"],
    Belfast: ["Titanic Quarter", "Falls Road", "Shankill", "Ballyhackamore", "Lisburn Road", "Malone Road", "Castlereagh", "Dundonald", "City Centre"],
    York: ["Acomb", "Clifton", "Heworth", "Holgate", "Hull Road", "Micklegate", "Rawcliffe", "Tang Hall", "South Bank"],
    Blackpool: ["North Shore", "South Shore", "Bispham", "Layton", "Marton", "Stanley Park", "Warbreck", "Anchorsholme", "Cleveleys"],
    Preston: ["Fulwood", "Penwortham", "Bamber Bridge", "Lostock Hall", "Ribbleton", "Ashton-on-Ribble", "Lea", "Ingol", "Deepdale"],
    Reading: ["Caversham", "Tilehurst", "Whitley", "Earley", "Woodley", "Coley", "Katesgrove", "Southcote", "West Reading"],
    Wolverhampton: ["Tettenhall", "Wednesfield", "Bilston", "Penn", "Whitmore Reans", "Heath Town", "Oxley", "Bushbury", "Compton"],
    Huddersfield: ["Lindley", "Marsh", "Milnsbridge", "Golcar", "Slaithwaite", "Holmfirth", "Almondbury", "Dalton", "Birkby"],
    // US Cities - California
    "Los Angeles": ["Santa Monica", "Beverly Hills", "Pasadena", "Glendale", "Long Beach", "Burbank", "West Hollywood", "Culver City", "Manhattan Beach", "Venice"],
    "San Diego": ["La Jolla", "Coronado", "Chula Vista", "Carlsbad", "Encinitas", "Del Mar", "Pacific Beach", "Mission Valley", "Point Loma", "Ocean Beach"],
    "San Francisco": ["Oakland", "Berkeley", "Daly City", "South San Francisco", "San Mateo", "Palo Alto", "Mountain View", "Sunnyvale", "San Jose", "Fremont"],
    "Sacramento": ["Roseville", "Folsom", "Elk Grove", "Davis", "Citrus Heights", "Rancho Cordova", "West Sacramento", "Rocklin", "Lincoln", "Auburn"],
  };

  const localExpertiseMap: Record<string, string> = {
    London: "Our London partners are fully ULEZ compliant and experts at navigating Congestion Charge zones and complex borough parking permit requirements (Camden, Islington, Westminster) to ensure the fastest possible arrival, even in heavy traffic.",
    Manchester: "Specialists in Manchester's unique property mix, from Victorian terrace lead pipe replacements and cast-iron drainage to modern city-centre apartment plumbing. We understand local 'pipe belly' issues common in older Greater Manchester homes.",
    Birmingham: "Experts at operating within Birmingham's Clean Air Zone (CAZ) and navigating the A4540 Middleway Ring Road. Our tradesmen use compliant vehicles to provide 24/7 service without passing CAZ daily charges onto you.",
    Sheffield: "While Sheffield's 'Seven Hills' terrain can be challenging, our local network is strategically positioned for rapid response across the city's steep geography, including the Peak District foothills and areas like Blake Street.",
    Leeds: "Navigating Leeds city centre's parking shortages and pavement restrictions is standard for our local team. We maintain a strong presence across West Leeds and Headingley to beat the typical 5-week city wait times.",
    // US Cities - California
    "Los Angeles": "Our LA partners navigate the city's complex geography from Downtown to the Valley, understanding earthquake retrofit requirements, HVAC demands for year-round climate control, and strict California building codes. We're experienced with both historic properties and modern developments across all LA neighborhoods.",
    "San Diego": "Specialists in coastal property maintenance, from saltwater corrosion prevention to earthquake preparedness. Our San Diego network understands the unique challenges of beach communities and inland valleys, with expertise in energy-efficient HVAC for the Mediterranean climate and water conservation systems.",
    "San Francisco": "Experts in San Francisco's Victorian and Edwardian architecture, seismic retrofitting, and navigating the city's strict building codes. Our partners understand the challenges of steep terrain, limited parking, and the unique plumbing systems in historic SF homes, plus modern high-rise requirements.",
    "Sacramento": "Our Sacramento team handles the valley's extreme temperature swings (100°F+ summers, freezing winters), understanding the critical importance of reliable HVAC and the impact of drought conditions on plumbing systems. We're experts in energy-efficient solutions for California's capital region.",
  };

  const servicesMap: Record<string, string[]> = {
    plumber: [
      "Burst pipes & leak repairs",
      "Boiler breakdowns & repairs",
      "Flooding & water damage",
      "No hot water or heating",
      "Blocked toilets & drains",
      "Water heater emergencies",
    ],
    electrician: [
      "Power outages & failures",
      "Electrical fires & burns",
      "Sparking outlets or switches",
      "Tripped breakers & fuses",
      "Exposed wiring hazards",
      "Emergency lighting repairs",
    ],
    locksmith: [
      "Lockouts - home, car, business",
      "Broken lock repairs",
      "Lock changes after break-in",
      "Key cutting & replacement",
      "Safe opening",
      "Security upgrades",
    ],
    "gas-engineer": [
      "Gas leaks & emergencies",
      "Boiler breakdowns",
      "Carbon monoxide concerns",
      "No heating or hot water",
      "Gas appliance repairs",
      "Gas safety checks",
    ],
    "drain-specialist": [
      "Blocked drains & sewers",
      "Drain CCTV surveys",
      "Root ingress removal",
      "Collapsed drain repairs",
      "Drain jetting",
      "Septic tank emergencies",
    ],
    glazier: [
      "Broken window boarding",
      "Emergency glass replacement",
      "Smashed door panels",
      "Shopfront repairs",
      "Double glazing emergencies",
      "Security glass fitting",
    ],
    roofer: [
      "Emergency roof repairs",
      "Storm damage repairs",
      "Leak detection & fixing",
      "Tile & shingle replacement",
      "Emergency tarping",
      "Gutter repairs",
    ],
    builder: [
      "Structural damage repairs",
      "Wall crack repairs",
      "Ceiling collapse support",
      "Emergency shoring up",
      "Masonry & brickwork repairs",
      "Subsidence investigation",
    ],
  };

  const priceRangeMap: Record<string, Record<string, string>> = {
    plumber: { GB: "£80 – £200", US: "$95 – $250" },
    electrician: { GB: "£90 – £250", US: "$110 – $300" },
    locksmith: { GB: "£70 – £180", US: "$85 – $220" },
    "gas-engineer": { GB: "£100 – £280", US: "$125 – $350" },
    "drain-specialist": { GB: "£120 – £350", US: "$150 – $450" },
    glazier: { GB: "£100 – £300", US: "$130 – $400" },
    roofer: { GB: "£150 – £500", US: "$180 – $650" },
    builder: { GB: "£120 – £400", US: "$150 – $550" },
  };

  const certificationsMap: Record<string, string[]> = {
    plumber: countryCode === 'GB' ? ["Water Safe registered", "City & Guilds qualified", "Fully insured"] : ["Licensed & Bonded", "Master Plumber Certified", "Fully Insured"],
    electrician: countryCode === 'GB' ? ["NICEIC approved", "Part P certified", "Fully insured"] : ["NEC Compliant", "Licensed Electrician", "Fully Insured"],
    locksmith: countryCode === 'GB' ? ["MLA approved", "DBS checked", "Fully insured"] : ["ALOA Member", "Background Checked", "Fully Insured"],
    "gas-engineer": countryCode === 'GB' ? ["Gas Safe registered", "OFTEC certified", "Fully insured"] : ["HVAC Certified", "EPA Universal", "Fully Insured"],
    "drain-specialist": countryCode === 'GB' ? ["NADC accredited", "SafeContractor approved", "Fully insured"] : ["IICRC Certified", "Licensed Contractor", "Fully Insured"],
    glazier: countryCode === 'GB' ? ["FENSA registered", "GGF member", "Fully insured"] : ["NGA Certified", "Safety Glass Qualified", "Fully Insured"],
    roofer: countryCode === 'GB' ? ["NFRC registered", "TrustMark approved", "Fully insured"] : ["Licensed Roofer", "OSHA Certified", "Fully Insured"],
    builder: countryCode === 'GB' ? ["FMB member", "NHBC registered", "Fully insured"] : ["Licensed General Contractor", "Licensed & Bonded", "Fully Insured"],
  };

  return {
    trade,
    city,
    serviceAreas: serviceAreaMap[city] || ["Surrounding areas", "Nearby suburbs", "Local districts"],
    averageResponseTime: "30–90 minutes",
    emergencyPriceRange: priceRangeMap[trade.slug]?.[countryCode] || (countryCode === 'GB' ? "£80 – £200" : "$95 – $250"),
    certifications: certificationsMap[trade.slug] || ["Fully insured", "Certified"],
    services: servicesMap[trade.slug] || ["Emergency repairs", "Same day service", "24/7 availability"],
    faqs: generateFAQs(trade, city, priceRangeMap[trade.slug]?.[countryCode] || (countryCode === 'GB' ? "£80 – £200" : "$95 – $250"), countryCode),
    localExpertise: localExpertiseMap[city],
    problem,
  };
}

function generateFAQs(trade: Trade, city: City, priceRange: string, countryCode: string = 'GB'): { question: string; answer: string }[] {
  const baseFAQs = [
    {
      question: `How much does an emergency ${trade.name.toLowerCase()} cost in ${city}?`,
      answer: `Emergency ${trade.name.toLowerCase()} call-outs in ${city} typically range from ${priceRange}, depending on the time of day and complexity of the job. Weekend and night-time calls may incur additional charges. All pricing is transparent with no hidden fees.`,
    },
    {
      question: `Can I call an emergency ${trade.name.toLowerCase()} at night or weekends?`,
      answer: `Yes, our emergency ${trade.name.toLowerCase()} services in ${city} operate 24 hours a day, 7 days a week, including bank holidays. We understand emergencies don't follow office hours, so help is always available when you need it.`,
    },
    {
      question: `How fast can an emergency ${trade.name.toLowerCase()} arrive in ${city}?`,
      answer: `Our network of local ${trade.name.toLowerCase()}s in ${city} can typically arrive within 30–90 minutes for urgent emergencies. Response times may vary based on current demand and your specific location within ${city} and surrounding areas.`,
    },
    {
      question: `Is there a call-out fee for emergency ${trade.name.toLowerCase()} services?`,
      answer: `Most emergency ${trade.name.toLowerCase()}s charge a call-out fee, which is usually included in the quoted price. This covers the cost of dispatching a qualified professional to your ${city} property at short notice. The fee is waived if work is carried out.`,
    },
    {
      question: `What situations require an emergency ${trade.name.toLowerCase()}?`,
      answer: `You should call an emergency ${trade.name.toLowerCase()} for any situation that poses an immediate risk to safety, property, or wellbeing. This includes anything that cannot safely wait until normal business hours. When in doubt, call for advice – most consultations are free.`,
    },
  ];

  const localFAQs: Record<string, { question: string; answer: string }> = {
    London: {
      question: "Do I have to pay for the tradesman's ULEZ or Congestion Charge?",
      answer: `No. In London, our partners typically use ULEZ-compliant vehicles. Any necessary congestion charges or borough-specific parking fees are usually managed by the tradesperson, though it's always worth confirming if specialized permits are needed for your specific mews or controlled zone.`,
    },
    Manchester: {
      question: "Can you handle old Victorian lead pipes common in Manchester?",
      answer: `Yes. Many Manchester properties in areas like Stockport or Salford still have legacy lead piping. Our local ${trade.name.toLowerCase()}s are experts in modern bypass and replacement techniques that meet current UK water safety standards.`,
    },
    Birmingham: {
      question: "Do you service houses inside the Birmingham Clean Air Zone?",
      answer: `Absolutely. We have a dedicated fleet of CAZ-compliant vehicles that operate 24/7 inside the Middleway Ring Road. You won't face delays or hidden surcharges due to city-centre emission restrictions.`,
    },
    Sheffield: {
      question: "Is your response time affected by Sheffield's hilly terrain?",
      answer: `We account for the local geography. By positioning our network across different elevations, we can maintain a 30-90 minute arrival window even for steep residential areas and the Peak District boundaries.`,
    },
    Leeds: {
      question: "What if there is no parking available at my Leeds property?",
      answer: `Our Leeds-based ${trade.name.toLowerCase()}s are accustomed to the city's parking challenges. If you live in a high-density area like Headingley or the city centre, just let us know in advance so the technician can plan their equipment drop-off accordingly.`,
    },
    // US Cities - California
    "Los Angeles": {
      question: "Are your LA contractors experienced with earthquake safety requirements?",
      answer: `Yes. All our Los Angeles partners are trained in California's seismic safety codes, including gas line earthquake valves, water heater strapping, and foundation bolt inspections. They understand the unique requirements for both pre-1978 buildings and modern construction.`,
    },
    "San Diego": {
      question: "Can you handle saltwater corrosion issues common in coastal San Diego?",
      answer: `Absolutely. Our San Diego ${trade.name.toLowerCase()}s specialize in coastal property maintenance, understanding how salt air affects plumbing, electrical systems, and HVAC equipment. We use corrosion-resistant materials and techniques specific to beach communities.`,
    },
    "San Francisco": {
      question: "Do you work on San Francisco's historic Victorian homes?",
      answer: `Yes. Our SF partners are experts in Victorian and Edwardian architecture, understanding the unique plumbing, electrical, and structural requirements of historic homes. We're experienced with seismic retrofitting and navigating SF's strict preservation codes.`,
    },
    "Sacramento": {
      question: "How do you handle Sacramento's extreme temperature swings?",
      answer: `Our Sacramento team specializes in HVAC systems designed for the valley's extreme climate (100°F+ summers, freezing winters). We understand the critical importance of reliable air conditioning and heating, plus water conservation during California's drought periods.`,
    },
  };

  const cityFAQ = localFAQs[city];
  return cityFAQ ? [cityFAQ, ...baseFAQs] : baseFAQs;
}
