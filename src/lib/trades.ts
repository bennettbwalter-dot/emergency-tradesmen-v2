export const trades = [
  { slug: "plumber", name: "Plumber", icon: "💧" },
  { slug: "electrician", name: "Electrician", icon: "⚡" },
  { slug: "locksmith", name: "Locksmith", icon: "🔐" },
  { slug: "gas-engineer", name: "Gas Engineer", icon: "🔥" },
  { slug: "drain-specialist", name: "Drain Specialist", icon: "🚿" },
  { slug: "glazier", name: "Glazier", icon: "🪟" },
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
] as const;

export type Trade = typeof trades[number];
export type City = typeof cities[number];

export interface TradePageData {
  trade: Trade;
  city: City;
  serviceAreas: string[];
  averageResponseTime: string;
  emergencyPriceRange: string;
  certifications: string[];
  services: string[];
  faqs: { question: string; answer: string }[];
}

export function generateTradePageData(tradeSlug: string, cityName: string): TradePageData | null {
  const trade = trades.find(t => t.slug === tradeSlug);
  const city = cities.find(c => c.toLowerCase() === cityName.toLowerCase());
  
  if (!trade || !city) return null;

  const serviceAreaMap: Record<string, string[]> = {
    Manchester: ["Salford", "Stockport", "Trafford", "Oldham", "Rochdale", "Bury", "Bolton"],
    Birmingham: ["Solihull", "Sutton Coldfield", "Edgbaston", "Moseley", "Erdington", "Kings Heath"],
    Leeds: ["Headingley", "Roundhay", "Morley", "Pudsey", "Horsforth", "Chapel Allerton"],
    Sheffield: ["Rotherham", "Doncaster", "Barnsley", "Chesterfield", "Worksop"],
    Liverpool: ["Birkenhead", "Bootle", "Crosby", "St Helens", "Widnes", "Runcorn"],
    Nottingham: ["Beeston", "Arnold", "Carlton", "West Bridgford", "Hucknall"],
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
  };
}

function generateFAQs(trade: Trade, city: City, priceRange: string): { question: string; answer: string }[] {
  return [
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
}
