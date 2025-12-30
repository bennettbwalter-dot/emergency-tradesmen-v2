export const trades = [
  { slug: "plumber", name: "Plumber", icon: "💧", image: "/emergency-plumber-v2.jpg", vectorIcon: "/icons/plumber.png" },
  { slug: "electrician", name: "Electrician", icon: "⚡", image: "/emergency-electrician-v2.png", vectorIcon: "/icons/electrician.png" },
  { slug: "locksmith", name: "Locksmith", icon: "🔐", image: "/emergency-locksmith-v2.jpg", vectorIcon: "/icons/locksmith.png" },
  { slug: "gas-engineer", name: "Gas Engineer", icon: "🔥", image: "/emergency-gas-engineer-v2.png", vectorIcon: "/icons/gas-engineer.png" },
  { slug: "drain-specialist", name: "Drain Specialist", icon: "🚿", image: "/emergency-drain-specialist-v2.jpg", vectorIcon: "/icons/drain-specialist.png" },
  { slug: "glazier", name: "Glazier", icon: "🪟", image: "/emergency-glazier-v2.jpg", vectorIcon: "/icons/glazier.png" },
  { slug: "breakdown", name: "Breakdown Recovery", icon: "🚗", image: "/emergency-breakdown-v2.jpg", vectorIcon: "/icons/breakdown.png" },
] as const;

export const cities = [
  "Manchester",
  "Birmingham",
  "Leeds",
  "Sheffield",
  "Nottingham",
  "Leicester",
  "Derby",
  "Coventry",
  "Wolverhampton",
  "Stoke-on-Trent",
  "Liverpool",
  "Preston",
  "Bolton",
  "Oldham",
  "Rochdale",
  "Bradford",
  "Huddersfield",
  "York",
  "Hull",
  "Doncaster",
  "Northampton",
  "Milton Keynes",
  "Luton",
  "Bedford",
  "Peterborough",
  "Cambridge",
  "Norwich",
  "Ipswich",
  "Reading",
  "Oxford",
  "Swindon",
  "Cheltenham",
  "Gloucester",
  "Worcester",
  "Hereford",
  "Shrewsbury",
  "Telford",
  "Cannock",
  "Tamworth",
  "Nuneaton",
  "Rugby",
  "Bath",
  "Brighton & Hove",
  "Bristol",
  "Canterbury",
  "Carlisle",
  "Chelmsford",
  "Chester",
  "Chichester",
  "Colchester",
  "Durham",
  "Ely",
  "Exeter",
  "Lancaster",
  "Lichfield",
  "Lincoln",
  "London",
  "Newcastle-upon-Tyne",
  "Plymouth",
  "Portsmouth",
  "Ripon",
  "Salford",
  "Salisbury",
  "Southampton",
  "Southend-on-Sea",
  "St Albans",
  "Sunderland",
  "Truro",
  "Wakefield",
  "Wells",
  "Winchester",
  "Westminster",
  "Warrington",
  "Wigan",
  "Middlesbrough",
  "Blackpool",
  "Barnsley",
  "Cardiff",
  "Swansea",
  "Newport",
  "Edinburgh",
  "Glasgow",
  "Aberdeen",
  "Dundee",
  "Belfast",
  "Slough",
  "Bournemouth",
  "Poole",
  "Stockport",
  "Dudley",
  "Walsall",
  "Solihull",
  "Basildon",
  "Crawley",
  "Basingstoke",
  "Woking",
  "Guildford",
  "High Wycombe",
  "Hemel Hempstead",
  "Stevenage",
  "Harlow",
  "Watford",
  "Staines",
  "Maidstone",
  "Gillingham",
  "Chatham",
  "Ashford",
  "Dartford",
  "Tunbridge Wells",
  "Hastings",
  "Eastbourne",
  "Worthing",
  "Harrogate",
  "Darlington",
  "Hartlepool",
  "Mansfield",
  "Chesterfield",
  "Burton upon Trent",
  "Stafford",
  "Kidderminster",
  "Redditch",
  "Bromsgrove",
  "Loughborough",
  "Grantham",
  "Scunthorpe",
  "Grimsby",
  "Rotherham",
] as const;

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

export function generateTradePageData(tradeSlug: string, cityName: string): TradePageData | null {
  // Allow tradeSlug to also be a problem slug
  const problem = commonProblems.find(p => p.slug === tradeSlug);
  const trade = trades.find(t => t.slug === (problem ? problem.trade : tradeSlug));
  const city = cities.find(c => c.toLowerCase() === cityName.toLowerCase());

  if (!trade || !city) return null;

  const serviceAreaMap: Record<string, string[]> = {
    Manchester: ["Salford", "Stockport", "Trafford", "Oldham", "Rochdale", "Bury", "Bolton"],
    Birmingham: ["Solihull", "Sutton Coldfield", "Edgbaston", "Moseley", "Erdington", "Kings Heath"],
    Leeds: ["Headingley", "Roundhay", "Morley", "Pudsey", "Horsforth", "Chapel Allerton"],
    Sheffield: ["Rotherham", "Doncaster", "Barnsley", "Chesterfield", "Worksop", "Dore", "Totley", "Hillsborough", "Ecclesall", "Crookes", "Stocksbridge"],
    Liverpool: ["Birkenhead", "Bootle", "Crosby", "St Helens", "Widnes", "Runcorn"],
    Nottingham: ["Beeston", "Arnold", "Carlton", "West Bridgford", "Hucknall"],
  };

  const localExpertiseMap: Record<string, string> = {
    London: "Our London partners are fully ULEZ compliant and experts at navigating Congestion Charge zones and complex borough parking permit requirements (Camden, Islington, Westminster) to ensure the fastest possible arrival, even in heavy traffic.",
    Manchester: "Specialists in Manchester's unique property mix, from Victorian terrace lead pipe replacements and cast-iron drainage to modern city-centre apartment plumbing. We understand local 'pipe belly' issues common in older Greater Manchester homes.",
    Birmingham: "Experts at operating within Birmingham's Clean Air Zone (CAZ) and navigating the A4540 Middleway Ring Road. Our tradesmen use compliant vehicles to provide 24/7 service without passing CAZ daily charges onto you.",
    Sheffield: "While Sheffield's 'Seven Hills' terrain can be challenging, our local network is strategically positioned for rapid response across the city's steep geography, including the Peak District foothills and areas like Blake Street.",
    Leeds: "Navigating Leeds city centre's parking shortages and pavement restrictions is standard for our local team. We maintain a strong presence across West Leeds and Headingley to beat the typical 5-week city wait times.",
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
  };

  const priceRangeMap: Record<string, string> = {
    plumber: "£80 – £200",
    electrician: "£90 – £250",
    locksmith: "£70 – £180",
    "gas-engineer": "£100 – £280",
    "drain-specialist": "£120 – £350",
    glazier: "£100 – £300",
  };

  const certificationsMap: Record<string, string[]> = {
    plumber: ["Water Safe registered", "City & Guilds qualified", "Fully insured"],
    electrician: ["NICEIC approved", "Part P certified", "Fully insured"],
    locksmith: ["MLA approved", "DBS checked", "Fully insured"],
    "gas-engineer": ["Gas Safe registered", "OFTEC certified", "Fully insured"],
    "drain-specialist": ["NADC accredited", "SafeContractor approved", "Fully insured"],
    glazier: ["FENSA registered", "GGF member", "Fully insured"],
  };

  return {
    trade,
    city,
    serviceAreas: serviceAreaMap[city] || ["Surrounding areas", "Nearby suburbs", "Local districts"],
    averageResponseTime: "30–60 minutes",
    emergencyPriceRange: priceRangeMap[trade.slug] || "£80 – £200",
    certifications: certificationsMap[trade.slug] || ["Fully insured", "DBS checked", "Certified"],
    services: servicesMap[trade.slug] || ["Emergency repairs", "Same day service", "24/7 availability"],
    faqs: generateFAQs(trade, city, priceRangeMap[trade.slug] || "£80 – £200"),
    localExpertise: localExpertiseMap[city],
    problem,
  };
}

function generateFAQs(trade: Trade, city: City, priceRange: string): { question: string; answer: string }[] {
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
      answer: `Our network of local ${trade.name.toLowerCase()}s in ${city} can typically arrive within 30–60 minutes for urgent emergencies. Response times may vary based on current demand and your specific location within ${city} and surrounding areas.`,
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
      answer: `We account for the local geography. By positioning our network across different elevations, we can maintain a 30-60 minute arrival window even for steep residential areas and the Peak District boundaries.`,
    },
    Leeds: {
      question: "What if there is no parking available at my Leeds property?",
      answer: `Our Leeds-based ${trade.name.toLowerCase()}s are accustomed to the city's parking challenges. If you live in a high-density area like Headingley or the city centre, just let us know in advance so the technician can plan their equipment drop-off accordingly.`,
    },
  };

  const cityFAQ = localFAQs[city];
  return cityFAQ ? [cityFAQ, ...baseFAQs] : baseFAQs;
}
