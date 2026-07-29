/**
 * EMERGENCY BRAIN  -  Internal Knowledge Base & Offline Decision Layer
 * ─────────────────────────────────────────────────────────────────
 * Operates WITHOUT any external API calls.
 * Uses stored knowledge, rules, and safety guidance to generate
 * accurate and safe responses entirely offline.
 */

// ─── TYPES ────────────────────────────────────────────────────

export interface Diagnostic {
  symptom: string;
  likely: string;
  urgency: 'EMERGENCY' | 'URGENT' | 'GENERAL';
}

export interface TradeKnowledge {
  name: string;
  usName: string;
  icon: string;
  emergencyKeywords: string[];
  diagnostics: { uk: Diagnostic[]; us: Diagnostic[] };
  typicalFaults: { uk: string[]; us: string[] };
  safetyGuidance: {
    emergency: { uk: string; us: string };
    general: { uk: string; us: string };
  };
  regulations: { uk: string[]; us: string[] };
  repairPractices: { uk: string[]; us: string[] };
}

export type UrgencyLevel = 'EMERGENCY' | 'URGENT' | 'GENERAL' | 'UNKNOWN';

export interface EmergencyClassification {
  level: UrgencyLevel;
  matchedPattern?: string;
  matchedTrade?: string | null;
}

export interface OfflineResponse {
  type: 'EMERGENCY' | 'URGENT' | 'GENERAL' | 'NO_MATCH';
  trade: string | null;
  tradeName: string | null;
  urgency: UrgencyLevel;
  message: string;
  safetyAdvice: string | null;
  diagnostics?: Diagnostic[];
  typicalFaults?: string[];
  repairPractices?: string[];
  regulations?: string[];
  guideToProfessional: boolean;
  professionalMessage: string;
}

// ─── CRITICAL DANGER PATTERNS ─────────────────────────────────

const CRITICAL_DANGER_PATTERNS: string[] = [
  'gas leak', 'smell gas', 'smell of gas', 'hissing gas', 'gas hissing',
  'carbon monoxide', 'co alarm', 'co detector', 'fumes', 'feeling dizzy',
  'fire', 'flames', 'smoke', 'burning smell', 'explosion',
  'electric shock', 'electrocuted', 'sparking', 'live wire', 'exposed wire',
  'flooding', 'water everywhere', 'burst pipe', 'water pouring',
  'collapsed', 'collapsing', 'ceiling collapsed', 'wall collapsed', 'structural collapse',
  'sewage', 'sewage flooding', 'sewage backup',
  'trapped', 'locked in', 'break in', 'broke in', 'intruder', 'burglary',
  'roof blown off', 'tree fallen on', 'storm damage',
  'refrigerant leak', 'chemical smell from ac',
  'car on fire', 'accident', 'stuck on motorway', 'stranded on highway',
  'smashed window', 'window smashed', 'smashed glass', 'glass smashed', 'shattered', 'smashed',
];

// ─── INTERNAL KNOWLEDGE BASE ───────────────────────────────────

export const INTERNAL_KNOWLEDGE: Record<string, TradeKnowledge> = {
  plumbing: {
    name: 'Plumber', usName: 'Plumber', icon: '🚰',
    emergencyKeywords: [
      'burst pipe', 'flooding', 'water leak', 'no hot water', 'frozen pipe', 'leaking pipe',
      'water pouring', 'stopcock', 'overflow', 'cistern', 'radiator leak', 'boiler leak',
      'water heater', 'dripping tap', 'toilet leaking', 'water damage', 'pipe burst',
      'water shut off', 'tap', 'plumber', 'plumbing', 'shower', 'sink', 'toilet',
      'radiator', 'boiler breakdown', 'hot water', 'cold water', 'ballcock', 'immersion',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Water pooling under boiler', likely: 'Pressure relief valve or internal seal failure', urgency: 'URGENT' },
        { symptom: 'No hot water but heating works', likely: 'Diverter valve stuck or failed', urgency: 'GENERAL' },
        { symptom: 'Banging pipes (water hammer)', likely: 'Loose pipework or too-high pressure', urgency: 'GENERAL' },
        { symptom: 'Low water pressure throughout', likely: 'Mains issue, PRV failure, or internal leak', urgency: 'URGENT' },
        { symptom: 'Brown or discoloured water', likely: 'Corroded pipes or disturbed mains sediment', urgency: 'GENERAL' },
        { symptom: 'Constant running toilet', likely: 'Float valve or flapper seal worn', urgency: 'GENERAL' },
        { symptom: 'Damp patch on ceiling', likely: 'Leaking pipe or fitting in floor above', urgency: 'URGENT' },
      ],
      us: [
        { symptom: 'Water pooling under water heater', likely: 'Temperature and pressure (T&P) relief valve or tank leak', urgency: 'URGENT' },
        { symptom: 'No hot water', likely: 'Pilot light out, heating element failure, or gas valve issue', urgency: 'GENERAL' },
        { symptom: 'Banging pipes (water hammer)', likely: 'Missing air chambers or high water pressure', urgency: 'GENERAL' },
        { symptom: 'Low water pressure throughout', likely: 'Pressure reducing valve (PRV) failure or main line leak', urgency: 'URGENT' },
        { symptom: 'Brown or discolored water', likely: 'Sediment in water heater or corroded galvanized pipes', urgency: 'GENERAL' },
        { symptom: 'Constant running toilet', likely: 'Fill valve or flapper seal worn', urgency: 'GENERAL' },
        { symptom: 'Damp patch on ceiling', likely: 'Leaking pipe or supply line in floor above', urgency: 'URGENT' },
      ],
    },
    typicalFaults: {
      uk: [
        'Burst copper pipe at soldered joint', 'Failed flexi-hose under sink',
        'Seized stopcock valve', 'Corroded radiator valve', 'Faulty immersion heater element',
        'Blocked condensate pipe (boiler lockout)', 'Cracked toilet cistern', 'Failed shower mixer cartridge',
      ],
      us: [
        'Burst copper or PEX pipe at fitting', 'Failed supply line under sink',
        'Seized main shut-off valve', 'Corroded shut-off valve at fixture', 'Faulty electric water heater element',
        'Sediment buildup in water heater', 'Cracked toilet tank', 'Failed shower cartridge/valve',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 Turn off your main **stopcock** immediately (usually under the kitchen sink). Open all taps to drain the system. Turn off your boiler. Do NOT touch electrics if water is near sockets or fuse boxes. Call a qualified emergency **plumber** now.',
        us: '🚨 Shut off your main **water shut-off valve** immediately (usually in the basement, garage, or outside). Open faucets to drain pressure. Turn off the water heater. Avoid electrical panels if water is nearby. Call a licensed emergency **plumber** now.',
      },
      general: {
        uk: 'Locate your stopcock and test it every 6 months. Bleed radiators annually. Book an annual boiler service (Gas Safe registered engineer). Know where your cold water tank is. Keep a plumber\'s number saved.',
        us: 'Locate your main shut-off valve and test it twice a year. Flush your water heater annually. Schedule a plumbing inspection every 2 years. Know where your pressure relief valves are. Keep a licensed plumber\'s number on hand.',
      },
    },
    regulations: {
      uk: ['Building Regs Part G (hot water safety)', 'Water Supply Regulations 1999', 'WRAS approved fittings', 'Approved Document H (drainage)'],
      us: ['International Plumbing Code (IPC)', 'Uniform Plumbing Code (UPC)', 'EPA Safe Drinking Water Act', 'PHCC Standards'],
    },
    repairPractices: {
      uk: [
        'Isolate water supply before any repair', 'Push-fit or compression fittings for emergency repairs',
        'PTFE tape on all threaded connections', 'System pressure: 1-1.5 bar cold for combi boilers',
        'Lag exposed pipes to prevent freezing', 'Annual boiler service recommended',
      ],
      us: [
        'Isolate water supply before any repair', 'Push-fit or shark-bite fittings for emergency repairs',
        'Teflon tape or pipe dope on all threaded connections', 'Maintain expansion tank pressure',
        'Insulate exposed pipes in unheated spaces', 'Schedule plumbing inspection biennially',
      ],
    },
  },

  electrical: {
    name: 'Electrician', usName: 'Electrician', icon: '⚡',
    emergencyKeywords: [
      'power cut', 'no electricity', 'sparking', 'electric shock', 'burning smell',
      'fuse box', 'tripped fuse', 'circuit breaker', 'exposed wire', 'buzzing',
      'flickering lights', 'blackout', 'socket not working', 'smoke from socket',
      'live wire', 'electrical fire', 'consumer unit', 'rcd tripping', 'electrician', 'electrical',
      'light', 'lights',
    ],
    diagnostics: {
      uk: [
        { symptom: 'RCD trips repeatedly', likely: 'Earth fault on a circuit  -  faulty appliance or wiring', urgency: 'URGENT' },
        { symptom: 'Burning or fishy smell from outlet', likely: 'Overheating wiring, melting insulation', urgency: 'EMERGENCY' },
        { symptom: 'Lights flicker in one room', likely: 'Loose connection in lighting circuit', urgency: 'URGENT' },
        { symptom: 'Entire house lost power', likely: 'Main fuse blown or supply fault', urgency: 'URGENT' },
        { symptom: 'Socket feels warm or hot', likely: 'Overloaded circuit or loose terminal', urgency: 'EMERGENCY' },
        { symptom: 'Buzzing from consumer unit', likely: 'Loose MCB or arcing connection', urgency: 'EMERGENCY' },
        { symptom: 'Light switch gives tingle or shock', likely: 'Earth fault  -  isolate immediately', urgency: 'EMERGENCY' },
      ],
      us: [
        { symptom: 'GFCI/AFCI breaker trips repeatedly', likely: 'Ground fault or arc fault  -  faulty appliance or wiring', urgency: 'URGENT' },
        { symptom: 'Burning or fishy smell from outlet', likely: 'Overheating wiring or loose connection at screw terminal', urgency: 'EMERGENCY' },
        { symptom: 'Lights flicker in one room', likely: 'Loose neutral or poor connection at terminal screw', urgency: 'URGENT' },
        { symptom: 'Entire house lost power', likely: 'Main breaker tripped or utility supply fault', urgency: 'URGENT' },
        { symptom: 'Socket feels warm or hot', likely: 'Loose wire at the outlet or overloaded circuit', urgency: 'EMERGENCY' },
        { symptom: 'Buzzing from electrical panel', likely: 'Loose circuit breaker or arcing connection', urgency: 'EMERGENCY' },
        { symptom: 'Light switch gives buzz or shock', likely: 'Ungrounded switch or wiring fault  -  isolate power', urgency: 'EMERGENCY' },
      ],
    },
    typicalFaults: {
      uk: [
        'Nuisance RCD tripping from faulty appliance', 'Loose neutral causing flickering',
        'Overloaded ring main', 'Degraded wiring insulation (pre-1970s)',
        'Failed outdoor light fitting with moisture', 'Incorrectly wired socket (reversed polarity)',
        'Rodent damage to cables in loft',
      ],
      us: [
        'Nuisance GFCI tripping', 'Back-stabbed outlet connection failed',
        'Loose neutral at the panel', 'Aluminum wiring oxidation (pre-1970s)',
        'Faulty outdoor GFCI outlet', 'Reversed polarity at the outlet',
        'Rodent damage to Romex cables in attic',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 Turn off the MAIN SWITCH on your **consumer unit** immediately. Do NOT touch sparking or hot fittings. If someone has had a shock, isolate the supply before touching them. Call **999**. Never use water on an electrical fire. Contact a qualified **electrician** immediately.',
        us: '🚨 Turn off the MAIN BREAKER in your **electrical panel** immediately. Do NOT touch any sparking, smoking, or hot outlets. If someone has received a shock, cut power first  -  do not touch them while energised. Call **911**. Never use water on an electrical fire. Contact a licensed **electrician** immediately.',
      },
      general: {
        uk: 'Never overload sockets. Test your RCD every 3 months. Have an EICR (Electrical Installation Condition Report) every 10 years (5 years for rentals). Do not attempt DIY work on your consumer unit. Only use NICEIC or NAPIT registered electricians.',
        us: 'Never overload circuits or use extension cords permanently. Test your GFCI outlets monthly. Have your panel inspected every 10 years. Do not attempt DIY work on your electrical panel. Always hire a state-licensed electrician for permitted work.',
      },
    },
    regulations: {
      uk: ['BS 7671 18th Edition Wiring Regulations', 'Electricity at Work Regulations 1989', 'Building Regs Part P', 'NICEIC/NAPIT competent person schemes'],
      us: ['NEC/NFPA 70', 'OSHA Electrical Standards', 'UL Listing', 'State electrician licensing'],
    },
    repairPractices: {
      uk: [
        'Safe isolation: lock off, prove dead, work, test, re-energise',
        'Voltage indicator proven before and after (GS38)',
        'Like-for-like replacement for emergencies',
        'Earth continuity and insulation resistance testing after repair',
        'Label all circuits clearly',
      ],
      us: [
        'Lock-out/Tag-out: isolate power, verify dead at circuit, work, test, restore',
        'Voltage tester verified before and after use',
        'Same-rating replacement for emergency fixes',
        'Verify ground continuity and circuit impedance after repair',
        'Label all breakers in the panel clearly',
      ],
    },
  },

  'gas-engineer': {
    name: 'Gas Engineer', usName: 'HVAC / Gas Engineer', icon: '🔥',
    emergencyKeywords: [
      'gas leak', 'smell gas', 'gas smell', 'carbon monoxide', 'co alarm', 'boiler not working',
      'no heating', 'pilot light out', 'gas meter', 'yellow flame', 'hissing gas', 'fumes',
      'gas safety', 'gas certificate', 'boiler breakdown', 'heating failure', 'gas engineer',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Smell of gas indoors', likely: 'Gas leak from pipe, fitting or appliance', urgency: 'EMERGENCY' },
        { symptom: 'CO alarm sounding', likely: 'Carbon monoxide from faulty flue or combustion', urgency: 'EMERGENCY' },
        { symptom: 'Yellow or orange boiler flame (should be blue)', likely: 'Incomplete combustion  -  CO risk', urgency: 'EMERGENCY' },
        { symptom: 'Boiler losing pressure repeatedly', likely: 'Internal leak, expansion vessel, or PRV fault', urgency: 'GENERAL' },
        { symptom: 'Radiators cold at bottom', likely: 'Sludge/magnetite buildup  -  needs power flush', urgency: 'GENERAL' },
        { symptom: 'Boiler fires then cuts out', likely: 'Faulty thermistor, pump, or PCB', urgency: 'URGENT' },
        { symptom: 'Boiler showing error code', likely: 'Various  -  check manufacturer code chart', urgency: 'URGENT' },
      ],
      us: [
        { symptom: 'Smell of gas indoors', likely: 'Natural gas or propane leak from line or furnace', urgency: 'EMERGENCY' },
        { symptom: 'CO alarm sounding', likely: 'Carbon monoxide from cracked heat exchanger or blocked flue', urgency: 'EMERGENCY' },
        { symptom: 'Yellow or orange furnace flame', likely: 'Incomplete combustion  -  high CO risk', urgency: 'EMERGENCY' },
        { symptom: 'Boiler/Furnace pressure issues', likely: 'Expansion tank or relief valve failure', urgency: 'GENERAL' },
        { symptom: 'Forced air vents blowing cold', likely: 'Failed igniter, flame sensor, or limited fuel flow', urgency: 'URGENT' },
        { symptom: 'Furnace rapidly cycling', likely: 'Dirty filter, restricted airflow, or thermostat fault', urgency: 'URGENT' },
        { symptom: 'Furnace showing error code', likely: 'Diagnostic blink codes  -  check manufacture manual', urgency: 'URGENT' },
      ],
    },
    typicalFaults: {
      uk: [
        'Failed gas valve', 'Blocked condensate pipe (freezing)', 'Faulty diverter valve',
        'Expansion vessel lost charge', 'Flue terminal blocked', 'Thermocouple failure',
        'Leaking heat exchanger', 'Gas cooker ignition failure',
      ],
      us: [
        'Cracked heat exchanger', 'Failed hot surface igniter', 'Dirty flame sensor',
        'Blocked inducer motor port', 'Clogged condensate drain line', 'Faulty gas control valve',
        'Failed blower motor capacitor', 'Leaking evaporator coil (AC/Heat Pump combo)',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 SMELL GAS? Do NOT use any electrical switches or naked flames. Turn off the gas at the **meter** (lever to 90°). Open all windows and doors. Leave the property immediately. Call **National Gas Emergency: 0800 111 999**. Do NOT re-enter until cleared by a **Gas Safe registered engineer**.',
        us: '🚨 SMELL GAS? Do NOT use any electrical switches or open flames. Shut off gas at the **main valve** (quarter-turn). Open all windows and doors. Leave the property immediately. Call **911** and your **gas utility company**. Do NOT re-enter until cleared by a **licensed gas technician or utility company**.',
      },
      general: {
        uk: 'Book an annual boiler service with a **Gas Safe registered engineer**. Install CO detectors on every floor. Never block vents or flues. Blue flame = safe, yellow flame = danger. Check the **Gas Safe Register** before hiring: gassaferegister.co.uk.',
        us: 'Schedule an annual furnace/HVAC service with a **licensed HVAC technician**. Install CO detectors on every floor. Never block air vents or flues. A blue flame with a small yellow tip is normal on some appliances; a full yellow or orange flame needs checking. Ask for NATE-certified technicians.',
      },
    },
    regulations: {
      uk: ['Gas Safety Regulations 1998', 'Gas Safe Register (mandatory)', 'IGEM Standards (UP/1B, UP/2)', 'Building Regs Part J'],
      us: ['NFPA 54 (National Fuel Gas Code)', 'IFGC (International Fuel Gas Code)', 'State HVAC/gas licensing', 'ANSI Z21/CSA Standards'],
    },
    repairPractices: {
      uk: [
        'Tightness test before and after any gas work', 'Flue gas analysis on every service',
        'Unsafe appliances must be disconnected and labelled',
        'Landlord Gas Safety Certificate (CP12) annually for rentals',
        'Condensate pipe insulation for winter', 'Power flush every 5-10 years',
      ],
      us: [
        'Gas pressure and leak testing before and after repair', 'Combustion analysis performed on every inspection',
        'Unsafe furnaces must be disabled and Red-Tagged',
        'Annual safety inspections recommended for all natural gas appliances',
        'Insulate condensate lines in cold climates', 'System duct cleaning every 3-5 years',
      ],
    },
  },

  locksmith: {
    name: 'Locksmith', usName: 'Locksmith', icon: '🔐',
    emergencyKeywords: [
      'locked out', 'lost keys', 'key snapped', 'broken lock', "door won't lock", 'burglary',
      'break in', 'lock jammed', "can't get in", 'key stuck', "door won't open",
      'security', 'lock change', 'lock replacement', 'locksmith',
    ],
    diagnostics: {
      uk: [
        { symptom: "Key turns but door won't open", likely: 'Misaligned latch or broken gearbox mechanism', urgency: 'URGENT' },
        { symptom: 'Key snapped in lock', likely: 'Worn key or cylinder  -  extraction and possible replacement', urgency: 'URGENT' },
        { symptom: 'Lock spinning freely', likely: 'Broken tailpiece or cam inside cylinder', urgency: 'URGENT' },
        { symptom: 'Door locked after burglary', likely: 'Frame/lock damage  -  needs boarding and upgrade', urgency: 'EMERGENCY' },
        { symptom: "Deadbolt won't retract", likely: 'Internal mechanism seized or misaligned strike plate', urgency: 'GENERAL' },
      ],
      us: [
        { symptom: "Key turns but bolt doesn't move", likely: 'Broken tailpiece or damaged cylinder mechanism', urgency: 'URGENT' },
        { symptom: 'Key snapped in the cylinder', likely: 'Worn key or dry lock  -  needs extraction and lubrication', urgency: 'URGENT' },
        { symptom: 'Cylinder spinning loosely', likely: 'Set screw came loose or cam is broken', urgency: 'URGENT' },
        { symptom: 'Entry door damaged after break-in', likely: 'Jamb or strike plate failure  -  needs reinforcement', urgency: 'EMERGENCY' },
        { symptom: "Key won't go into the lock", likely: 'Internal obstruction or damaged tumblers', urgency: 'GENERAL' },
      ],
    },
    typicalFaults: {
      uk: [
        'Snapped euro cylinder (snap attack)', 'Worn lever mortice lock',
        'Multipoint lock gearbox failure', 'Misaligned door causing binding',
        'Night latch slam lock  -  locked out', 'Frozen lock mechanism', 'Broken patio door lock',
      ],
      us: [
        'Failed deadbolt internal linkage', 'Worn pin tumblers in Schlage/Kwikset cylinder',
        'Entry set latch spring failure', 'Structural settling causing bolt misalignment',
        'Keypad lock battery or board failure', 'Frozen cylinder in winter', 'Sliding door latch failure',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 If locked out, stay in a well-lit, safe area. If a burglary occurred, do NOT enter  -  call **999** first. Only use **MLA (Master Locksmiths Association)** registered locksmiths. Have proof of residency ready.',
        us: '🚨 If locked out, stay in a well-lit, safe area. If a break-in occurred, do NOT enter  -  call **911** first. Only use **ALOA (Associated Locksmiths of America)** certified locksmiths. Have photo ID and proof of residency ready.',
      },
      general: {
        uk: 'Upgrade to **anti-snap cylinders** meeting **TS007 / SS 312** standards. Ensure locks are **BS 3621** compliant for home insurance. Lubricate locks with graphite  -  never WD-40. Keep a spare key with a trusted neighbour.',
        us: 'Upgrade to **ANSI Grade 1** deadbolts for home security. Check your insurance policy for minimum lock requirements. Use **UL 437** rated cylinders for high-security applications. Store a spare key in a secure key safe, not under a doormat.',
      },
    },
    regulations: {
      uk: ['BS 3621 (thief-resistant locks)', 'SS 312 (anti-snap cylinder)', 'Master Locksmiths Association (MLA)', 'PAS 24 (enhanced security)'],
      us: ['ANSI/BHMA Grade 1-3', 'UL 437 (high-security cylinder)', 'ALOA membership', 'State locksmith licensing'],
    },
    repairPractices: {
      uk: [
        'Non-destructive entry preferred', 'Replace any lock that has been forced',
        'Anti-snap, anti-bump, anti-pick cylinders for replacement',
        'Check door alignment after lock work', 'Advise on insurance-compliant lock grades',
      ],
      us: [
        'Non-destructive bypass techniques used first', 'Reinforce door jambs if forced entry occurred',
        'High-security pick-resistant cylinders for upgrades',
        'Adjust strike plate for smooth deadbolt operation', 'Recommend Grade 1 hardware for perimeter doors',
      ],
    },
  },

  'drain-specialist': {
    name: 'Drain Specialist', usName: 'Drain Specialist', icon: '🚽',
    emergencyKeywords: [
      'blocked drain', 'blocked toilet', 'sewage', 'drain backup', 'toilet overflowing',
      'slow draining', 'sewage smell', 'manhole overflow', 'flooded drain', 'drain backing up',
      'gurgling drain', 'sink blocked', 'gully blocked', 'foul smell',
      'toilet', 'sewer', 'drain', 'drains', 'unblocking',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Multiple drains blocking simultaneously', likely: 'Main sewer line blockage or collapse', urgency: 'EMERGENCY' },
        { symptom: 'Sewage backing up into home', likely: 'Category 3 biohazard  -  main line blocked', urgency: 'EMERGENCY' },
        { symptom: 'Single slow-draining sink', likely: 'Localised trap or waste pipe blockage', urgency: 'GENERAL' },
        { symptom: 'Gurgling sounds from drains', likely: 'Partial blockage or venting issue', urgency: 'GENERAL' },
        { symptom: 'Ground sinking near drain run', likely: 'Collapsed drain  -  CCTV survey needed', urgency: 'URGENT' },
        { symptom: 'Persistent foul smell outdoors', likely: 'Broken or disconnected drain', urgency: 'URGENT' },
      ],
      us: [
        { symptom: 'Multiple drains backup at once', likely: 'Main sewer line blockage (roots or grease)', urgency: 'EMERGENCY' },
        { symptom: 'Sewage coming up through basement drains', likely: 'Main line stopped  -  biohazard risk', urgency: 'EMERGENCY' },
        { symptom: 'Sink or tub draining slowly', likely: 'Local clog in P-trap or fixture drain branch', urgency: 'GENERAL' },
        { symptom: 'Gurgling noises in pipes when flushing', likely: 'Venting problem or partial main line clog', urgency: 'GENERAL' },
        { symptom: 'Wet patch in yard near sewer line', likely: 'Sewer line break or root intrusion', urgency: 'URGENT' },
        { symptom: 'Sewer gas smell in the house', likely: 'Dry P-trap or cracked vent stack', urgency: 'URGENT' },
      ],
    },
    typicalFaults: {
      uk: [
        'Fat/grease buildup (fatberg)', 'Tree root intrusion', 'Collapsed clay pipe',
        'Displaced pipe joint', 'Blocked gully trap', 'Failed soakaway', 'Cracked inspection chamber',
      ],
      us: [
        'Grease or "flushable" wipe clog', 'Tree root infiltration', 'Collapsed Orangeburg or clay pipe',
        'Sewer line belly or offset joint', 'Failed septic field/tank', 'Clogged sewer cleanout',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 SEWAGE BACKUP? Stop using ALL water immediately (taps, toilets, machines). Sewage is a Category 3 biohazard  -  wear PPE if near it. Keep children and pets away. Open windows. Call a **drain specialist** immediately. Do NOT attempt to clear yourself.',
        us: '🚨 SEWAGE BACKUP? Stop using all plumbing fixtures immediately. Sewage is a **Category 3 biohazard**  -  do NOT clean without proper PPE. Keep children and pets out of the area. Open windows for ventilation. Call a licensed **drain/sewer specialist** immediately.',
      },
      general: {
        uk: 'Never pour cooking fat down drains. Use drain guards. Know where your external **inspection chambers** are. Water companies own shared drains outside your property boundary (Water Industry Act 1991). Flush drains monthly with hot water.',
        us: 'Never pour grease or wet wipes down drains. Know the location of your **sewer cleanout** (usually a PVC cap near your foundation). Your city/county owns shared sewer lines from your property connection. Schedule hydro-jetting every 2-3 years for older homes.',
      },
    },
    regulations: {
      uk: ['Building Regs Part H', 'Water Industry Act 1991', 'BS EN 752', 'Environmental Protection Act 1990'],
      us: ['IPC Chapter 7 (sanitary drainage)', 'EPA Clean Water Act', 'NASSCO inspection standards', 'State/county sewer codes'],
    },
    repairPractices: {
      uk: [
        'CCTV survey before and after major work', 'High-pressure jetting (3000-5000 PSI)',
        'No-dig patch lining for cracks', 'Full relining for severely damaged runs',
        'Root inhibitor treatment', 'Trap replacement for smells',
      ],
      us: [
        'CCTV camera inspection of main line', 'Hydro-jetting to clear grease and roots',
        'Trenchless pipe bursting or relining', 'Full sewer line replacement if collapsed',
        'Copper sulfate for root control', 'P-trap and vent stack repair',
      ],
    },
  },

  glazier: {
    name: 'Glazier', usName: 'Glazier / Glass Repair', icon: '🪟',
    emergencyKeywords: [
      'broken window', 'smashed glass', 'cracked glass', 'shattered window', 'glass everywhere',
      'window smashed', 'glass door broken', 'board up', 'shop window broken', 'pane broken',
      'double glazing failed', 'glass repair', 'emergency glazing',
      'window', 'glass', 'smashed', 'shattered', 'glazier', 'pane',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Window completely shattered', likely: 'Impact damage or thermal stress fracture', urgency: 'EMERGENCY' },
        { symptom: 'Mist or condensation between panes', likely: 'Blown sealed unit  -  seal failure', urgency: 'GENERAL' },
        { symptom: 'Crack spreading across pane', likely: 'Stress crack  -  will fail, replace urgently', urgency: 'URGENT' },
        { symptom: 'Glass cracked without impact', likely: 'Nickel sulphide inclusion or thermal stress', urgency: 'GENERAL' },
        { symptom: 'Shop front glass smashed', likely: 'Needs emergency boarding then toughened replacement', urgency: 'EMERGENCY' },
      ],
      us: [
        { symptom: 'Window completely shattered', likely: 'Impact damage or thermal stress fracture', urgency: 'EMERGENCY' },
        { symptom: 'Foggy or hazy double-pane glass', likely: 'Failed seal in the insulated glass unit (IGU)', urgency: 'GENERAL' },
        { symptom: 'Crack spreading through window', likely: 'Stress fracture  -  requires replacement for safety', urgency: 'URGENT' },
        { symptom: 'Glass cracked spontaneously', likely: 'Thermal shock or improper installation', urgency: 'GENERAL' },
        { symptom: 'Storefront glass broken', likely: 'Needs immediate boarding and tempered/laminated replacement', urgency: 'EMERGENCY' },
      ],
    },
    typicalFaults: {
      uk: [
        'Blown double-glazed sealed unit', 'Toughened glass spontaneous failure',
        'Impact-damaged laminated glass', 'Failed window gaskets',
        'Loose or missing putty on timber frames', 'Door vision panel broken',
      ],
      us: [
        'Failed IGU (Insulated Glass Unit) seal', 'Spontaneous tempered glass breakage',
        'Shattered laminated safety glass', 'Worn window weatherstripping',
        'Loose glazing beads on vinyl/metal frames', 'Broken glass in French doors',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 BROKEN GLASS? Do NOT touch or remove shards. Keep children and pets away. Cover the opening with thick cardboard as a temporary measure. Emergency boarding must meet **BS 5357** for security. Call for **emergency glazing** immediately.',
        us: '🚨 BROKEN GLASS? Do NOT touch or attempt to remove glass. Keep everyone away from the area. Cover the opening with cardboard or plywood temporarily. Broken storefronts or patio doors must meet **CPSC safety glazing** standards. Call for **emergency glazing** immediately.',
      },
      general: {
        uk: '**Toughened glass** breaks into small cubes (safer). **Laminated glass** holds together when broken. Standard float glass creates dangerous shards. All glazing in doors and near floor level must meet **Building Regs Part K (BS EN 12600)**. Consider laminated glass for ground floor windows.',
        us: '**Tempered glass** breaks into small pebbles (safer). **Laminated glass** holds together when shattered. Standard glass creates dangerous shards. Safety glazing is required by **CPSC 16 CFR 1201** in all hazardous locations. Consider laminated glass for ground floor and entry doors.',
      },
    },
    regulations: {
      uk: ['Building Regs Part K (safety glazing)', 'BS EN 12600 (impact classification)', 'BS 6262 (glazing code of practice)', 'FENSA / GGF'],
      us: ['CPSC 16 CFR 1201 (safety glazing)', 'ANSI Z97.1', 'IBC Chapter 24', 'NFRC energy ratings'],
    },
    repairPractices: {
      uk: [
        'Emergency boarding: OSB/plywood screwed to frame', 'Same-day replacement for float glass',
        'Toughened glass: 3-5 day lead time', 'Sealed units replaced without changing frames',
        'Laminated glass for ground floor safety', 'Always use safety glass in regulated locations',
      ],
      us: [
        'Emergency board-up with plywood/screws', 'Replacement of flat float glass panes',
        'Tempered glass: custom-ordered with lead time', 'IGU replacement (dual-pane units)',
        'Laminated safety glass installation', 'Strict adherence to code for safety glazing',
      ],
    },
  },

  roofer: {
    name: 'Roofer', usName: 'Roofer / Roof Repair', icon: '🏠',
    emergencyKeywords: [
      'roof leak', 'leaking roof', 'roof blown off', 'storm damage roof', 'missing tiles',
      'broken tiles', 'slipped tiles', 'water from roof', 'rain coming in', 'flat roof leak',
      'chimney leak', 'gutter overflow', 'roof damage', 'flashing damaged',
      'roof', 'tile', 'tiles', 'gutter', 'chimney', 'slate', 'shingle', 'roofer', 'roofing', 'leaking',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Water stain on ceiling', likely: 'Slipped tile, failed flashing, or flat roof breach', urgency: 'URGENT' },
        { symptom: 'Multiple tiles missing after storm', likely: 'Wind damage  -  exposed membrane at risk', urgency: 'EMERGENCY' },
        { symptom: 'Water running down chimney breast', likely: 'Failed chimney flashing or cracked stack', urgency: 'URGENT' },
        { symptom: 'Sagging roof section', likely: 'Structural timber failure (rot or overload)', urgency: 'EMERGENCY' },
        { symptom: 'Gutter overflowing in rain', likely: 'Blocked gutter/downpipe or inadequate fall', urgency: 'GENERAL' },
        { symptom: 'Flat roof bubbling', likely: 'Moisture trapped under felt membrane', urgency: 'GENERAL' },
      ],
      us: [
        { symptom: 'Ceiling discoloration or spotting', likely: 'Damaged shingles, failed flashing, or valley leak', urgency: 'URGENT' },
        { symptom: 'Shingles blown off after high winds', likely: 'Storm damage  -  potential for water infiltration', urgency: 'EMERGENCY' },
        { symptom: 'Water leaking near chimney/vent', likely: 'Failed step flashing or rubber boot around pipe', urgency: 'URGENT' },
        { symptom: 'Roof line appears sagging', likely: 'Structural failure or overloaded rafters/trusses', urgency: 'EMERGENCY' },
        { symptom: 'Gutters pulling away or overflowing', likely: 'Facia rot, clogged gutters, or improper pitch', urgency: 'GENERAL' },
        { symptom: 'Blisters on flat roof membrane', likely: 'Moisture trapped in the roofing assembly', urgency: 'GENERAL' },
      ],
    },
    typicalFaults: {
      uk: [
        'Slipped or cracked tiles', 'Lead flashing lifting', 'Flat roof felt membrane splits',
        'Valley gutter blockage', 'Deteriorated ridge mortar', 'Damaged soffit and fascia',
        'Blocked/leaking gutters', 'Rotting roof timbers',
      ],
      us: [
        'Missing asphalt shingles', 'Curled or cracked shingles', 'Failed roof vent boots',
        'Clogged roof valleys', 'Rusted flashing around chimneys', 'Soffit/fascia wood rot',
        'Ice dams in winter', 'Deteriorated roof sealant',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 NEVER go onto a roof yourself  -  falls from height are the #1 cause of construction deaths (**Work at Height Regulations 2005**). Stay clear of falling debris. Place buckets under leaks. Call an emergency **roofer** for tarping and temporary weatherproofing.',
        us: '🚨 NEVER go onto a roof yourself  -  falls are the leading cause of construction fatalities (**OSHA 29 CFR 1926.501**). Stay away from areas below damage. Place buckets under active leaks if safe to do so. Call an emergency **roofer** for tarping.',
      },
      general: {
        uk: 'Inspect your roof every 2-3 years and after storms. Keep gutters clear of debris. Check loft for daylight ingress twice a year. Re-point ridge tiles when mortar deteriorates. Flat roofs need annual inspection. Use **NFRC** registered roofers for guarantees.',
        us: 'Inspect your roof annually and after major storms. Clean gutters every 6 months. Check attic for daylight, moisture, or mold. Asphalt shingles typically last 20-30 years. Use **NRCA** contractors and ensure they are licensed and insured.',
      },
    },
    regulations: {
      uk: ['CDM Regulations 2015', 'Work at Height Regulations 2005', 'BS 5534 (slating and tiling)', 'NFRC guarantee schemes'],
      us: ['OSHA Fall Protection 29 CFR 1926.501', 'IBC/IRC roofing chapters', 'NRCA best practices', 'FM Global / UL wind and fire ratings'],
    },
    repairPractices: {
      uk: [
        'Emergency tarping to prevent water ingress', 'Replace slipped tiles with mechanical fixings',
        'Re-dress or replace lead flashing', 'Flat roof patch with torch-on felt or liquid rubber',
        'Ridge re-bedding with flexible mortar', 'Gutter clearance and realignment', 'Full scaffold for safe access',
      ],
      us: [
        'Emergency tarp or "blue roof" installation', 'Shingle replacement and nailing',
        'Pipe boot/flashing replacement', 'Liquid-applied flat roof restoration',
        'Gutter cleaning and flashing check', 'Attic ventilation assessment',
      ],
    },
  },

  builder: {
    name: 'Builder', usName: 'Builder / Construction', icon: '🧱',
    emergencyKeywords: [
      'wall cracking', 'ceiling collapsed', 'wall collapsed', 'structural damage', 'subsidence',
      'foundation issue', 'floor collapsed', 'beam damaged', 'door frame broken', 'stairs damaged',
      'plaster falling', 'hole in wall', 'brickwork crumbling',
      'wall', 'crack', 'ceiling', 'floor', 'structure', 'foundation', 'builder', 'building',
      'collapsed', 'cracking',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Diagonal crack from corner of window', likely: 'Lintel failure or subsidence', urgency: 'URGENT' },
        { symptom: 'Ceiling plaster bulging downward', likely: 'Water damage to plasterboard  -  collapse risk', urgency: 'EMERGENCY' },
        { symptom: 'Floors noticeably uneven or bouncy', likely: 'Joist failure, rot, or insufficient support', urgency: 'URGENT' },
        { symptom: 'Doors and windows sticking', likely: 'Building movement  -  subsidence or heave', urgency: 'URGENT' },
        { symptom: 'External wall bowing outward', likely: 'Wall tie failure or structural instability', urgency: 'EMERGENCY' },
        { symptom: 'Horizontal crack along mortar line', likely: 'Lateral movement or thermal expansion', urgency: 'GENERAL' },
      ],
      us: [
        { symptom: 'Diagonal crack in drywall above window', likely: 'Header failure or foundation settling', urgency: 'URGENT' },
        { symptom: 'Ceiling drywall sagging or bulging', likely: 'Water intrusion  -  immediate collapse risk', urgency: 'EMERGENCY' },
        { symptom: 'Floors feel uneven or soft', likely: 'Joist rot, termite damage, or pier failure', urgency: 'URGENT' },
        { symptom: 'Interior doors sticking in frames', likely: 'Foundation movement or soil expansion', urgency: 'URGENT' },
        { symptom: 'Foundation wall bowing or leaning', likely: 'Hydrostatic pressure or structural failure', urgency: 'EMERGENCY' },
        { symptom: 'Horizontal crack in brick or block', likely: 'Frost heave or settlement', urgency: 'GENERAL' },
      ],
    },
    typicalFaults: {
      uk: [
        'Lintel failure above openings', 'Cavity wall tie corrosion',
        'Subsidence from clay shrinkage or tree roots', 'Timber rot in joists',
        'Plasterboard ceiling failure', 'Crumbling pointing', 'Storm damage to walls', 'Impact damage to walls',
      ],
      us: [
        'Failed door/window headers', 'Corroded anchor bolts or brick ties',
        'Foundation settling from poor drainage', 'Dry rot in floor joists or sill plates',
        'Ceiling drywall failure', 'Deteriorated mortar joints', 'Termite or pest damage',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 STRUCTURAL DAMAGE? Evacuate the area immediately. Do NOT attempt to prop or shore collapsing structures yourself. If cracks are widening rapidly, evacuate the building. Call **999** if there is collapse risk. Contact a **structural engineer** and emergency **builder** immediately.',
        us: '🚨 STRUCTURAL DAMAGE? Evacuate the affected area immediately. Do NOT attempt to brace or support collapsing structures yourself. For rapidly widening cracks, evacuate the building. Call **911** if collapse is imminent. Contact a **licensed structural engineer** and emergency **contractor** immediately.',
      },
      general: {
        uk: 'Monitor cracks with pencil marks and dates. Hairline cracks (<1mm) are usually cosmetic. Cracks wider than 5mm may be structural  -  get a **RICS structural survey**. Keep trees 10m+ from foundations (**Building Regs Part A**). Check the **Party Wall Act 1996** for work near neighbour boundaries.',
        us: 'Monitor cracks with pencil marks and dates. Hairline cracks are usually cosmetic. Cracking wider than ¼ inch may be structural  -  get a licensed **structural engineer** assessment. Keep large trees away from foundations. Check **local building codes** and permit requirements before any structural repairs.',
      },
    },
    regulations: {
      uk: ['Building Regs Part A (structural safety)', 'Party Wall Act 1996', 'CDM Regulations 2015', 'BS EN 1996 (masonry)'],
      us: ['IBC/IRC (building/residential code)', 'ACI 318 (structural concrete)', 'ASCE 7 (design loads)', 'State building permits'],
    },
    repairPractices: {
      uk: [
        'Structural engineer survey for cracking >5mm', 'Temporary acrow props for emergency support',
        'Crack stitching with helical bars', 'Resin injection for foundation stabilisation',
        'Lintel replacement (steel or concrete)', 'Wall tie replacement', 'Re-pointing with appropriate mortar',
      ],
      us: [
        'Structural engineer inspection for significant cracks', 'Temporary shoring and bracing',
        'Carbon fiber reinforcement or epoxy injection', 'Helical piers for foundation support',
        'Header or beam replacement', 'Masonry repointing and tuckpointing',
      ],
    },
  },

  'water-restoration': {
    name: 'Water Restoration', usName: 'Water Damage & Restoration', icon: '💧',
    emergencyKeywords: [
      'flooding', 'water damage', 'flood damage', 'water everywhere', 'flooded house',
      'water extraction', 'soaked carpet', 'wet walls', 'ceiling leak', 'burst pipe damage',
      'storm flooding', 'mold', 'mould', 'structural drying', 'dehumidifier', 'sewage flood',
      'flood', 'damp', 'wet',
    ],
    diagnostics: {
      uk: [
        { symptom: 'Standing water throughout ground floor', likely: 'Category 1-3 flooding  -  extraction needed', urgency: 'EMERGENCY' },
        { symptom: 'Damp patches appearing days after leak', likely: 'Residual moisture wicking through masonry', urgency: 'URGENT' },
        { symptom: 'Musty smell after water event', likely: 'Mould growth starting behind walls', urgency: 'URGENT' },
        { symptom: 'Laminate or wood floor buckling', likely: 'Subfloor saturated  -  drying needed before replacement', urgency: 'URGENT' },
        { symptom: 'Black spots on walls or ceiling', likely: 'Active mould colony  -  remediation required', urgency: 'URGENT' },
      ],
      us: [
        { symptom: 'Standing water on the first floor/basement', likely: 'Category 1-3 flooding  -  professional extraction required', urgency: 'EMERGENCY' },
        { symptom: 'Wet spots appearing on drywall', likely: 'Lingering moisture in the wall cavity', urgency: 'URGENT' },
        { symptom: 'Musty or sour odor', likely: 'Mold growth initiated in hidden areas', urgency: 'URGENT' },
        { symptom: 'Cupping or crowning wood floors', likely: 'Slab or subfloor saturation  -  requires controlled drying', urgency: 'URGENT' },
        { symptom: 'Visible mold growth on surfaces', likely: 'Active microbial colonization  -  remediation needed', urgency: 'URGENT' },
      ],
    },
    typicalFaults: {
      uk: [
        'Burst pipe flooding', 'Appliance leak slow damage', 'Rain ingress through roof or walls',
        'Sewage backup contamination', 'Rising damp or failed DPC',
        'Inadequate drying causing secondary mould', 'Structural timber saturation', 'Electrical damage from water',
      ],
      us: [
        'Slab leak or burst copper line', 'Dishwasher or washing machine flood', 'Roof or window leak',
        'Sewer backup (black water)', 'High water table or failing sump pump',
        'Secondary mold damage from poor drying', 'Saturated wall studs/insulation',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 FLOODING? Turn off electricity if you can reach the **consumer unit** safely without standing in water. Stop the water source (stopcock, appliance valve). Do NOT wade through flood water near sockets. Sewage water is a biohazard  -  full PPE needed. Call a **water restoration specialist** immediately.',
        us: '🚨 FLOODING? Turn off electricity at the **main breaker** only if you can do so without standing in water. Shut off the main water valve. Do NOT wade through flood water near electrical outlets. Sewage-contaminated water is a **Category 3 biohazard**  -  full PPE required. Call a **water damage restoration company** immediately.',
      },
      general: {
        uk: 'Document all damage with photos for insurance before cleanup. Check your policy covers **escape of water**. Professional dehumidifiers remove 50-100 litres/day. Mould starts within 24-48 hours  -  act fast. Contact the **BDMA** for certified restorers. Make a flood plan if in a flood-risk area.',
        us: 'Document all damage with photos and video before cleanup. Check your homeowner policy for **sudden & accidental discharge** coverage. Professional dehumidifiers run continuously  -  don\'t rely on household units. Mold starts within 24-48 hours  -  act quickly. Use **IICRC S500-certified** water restoration companies.',
      },
    },
    regulations: {
      uk: ['PAS 64 (water damage mitigation)', 'BDMA standards', 'COSHH (sewage PPE)', 'BS 8102 (water from ground)'],
      us: ['IICRC S500 (water damage restoration)', 'IICRC S520 (mould remediation)', 'EPA Mould Guidelines', 'OSHA flood cleanup safety'],
    },
    repairPractices: {
      uk: [
        'Category assessment: Cat 1 clean, Cat 2 grey, Cat 3 black/sewage',
        'Rapid extraction with truck-mount or portable pumps', 'Industrial dehumidifiers and air movers',
        'Moisture mapping with pin and pinless meters', 'Affected plasterboard below flood line: remove',
        'Anti-microbial treatment during drying', 'Contents restoration when viable',
      ],
      us: [
        'Water category assessment (1, 2, or 3)', 'Truck-mounted water extraction',
        'LHE (Longitudinal HEPA) or axial air movers and LGR dehumidifiers',
        'Thermal imaging and moisture meter tracking', 'Flood cuts (drywall removal) to allow stud drying',
        'Microbial growth inhibition', 'Full restoration and pack-out services',
      ],
    },
  },

  breakdown: {
    name: 'Breakdown Recovery', usName: 'Tow Truck / Roadside Assistance', icon: '🚗',
    emergencyKeywords: [
      "car won't start", 'breakdown', 'broken down', 'roadside assistance', 'flat battery',
      'flat tyre', 'engine cut out', 'stuck on roadside', 'wrong fuel', 'car stalled',
      'tow truck', 'recovery vehicle', 'jump start', 'motorway breakdown', 'highway breakdown',
      'car', 'vehicle', 'tyre', 'tire', 'recovery', 'battery', 'engine', 'mechanic', 'tow',
    ],
    diagnostics: {
      uk: [
        { symptom: "Engine cranks but won't start", likely: 'Fuel system, ignition, or immobiliser fault', urgency: 'URGENT' },
        { symptom: 'Nothing happens when turning key', likely: 'Dead battery, starter motor, or loose terminal', urgency: 'URGENT' },
        { symptom: 'Red oil pressure warning light', likely: 'Low oil or oil pump failure  -  STOP immediately', urgency: 'EMERGENCY' },
        { symptom: 'Temperature gauge in red', likely: 'Coolant loss, thermostat, or head gasket', urgency: 'EMERGENCY' },
        { symptom: 'Put wrong fuel in', likely: 'Fuel contamination  -  do NOT start engine', urgency: 'URGENT' },
        { symptom: 'Tyre blowout on road', likely: 'Rim damage possible  -  needs safe jacking on level ground', urgency: 'EMERGENCY' },
      ],
      us: [
        { symptom: "Engine turns over but won't fire", likely: 'Fuel pump, spark plugs, or security/immobilizer issue', urgency: 'URGENT' },
        { symptom: 'Dash lights come on but car won\'t crank', likely: 'Dead battery, failed starter, or neutral safety switch', urgency: 'URGENT' },
        { symptom: 'Oil pressure light is on', likely: 'Dangerously low oil levels or pump failure  -  PULL OVER', urgency: 'EMERGENCY' },
        { symptom: 'Temp gauge climbing into the red', likely: 'Cooling system failure or low coolant', urgency: 'EMERGENCY' },
        { symptom: 'Incorrect fuel put in tank', likely: 'Fuel system contamination  -  DO NOT CRANK ENGINE', urgency: 'URGENT' },
        { symptom: 'Flat tire or blowout', likely: 'Requires tire change or tow to a shop', urgency: 'EMERGENCY' },
      ],
    },
    typicalFaults: {
      uk: [
        'Flat/dead battery (most common)', 'Alternator failure', 'Flat tyre/puncture',
        'Starter motor failure', 'Fuel pump failure', 'Clutch failure',
        'Overheating from coolant loss', 'Misfuelling',
      ],
      us: [
        'Dead battery or failed charging system', 'Punctured tire or valve stem failure',
        'Fuel pump or fuel injectors', 'Starter motor failure', 'Overheating from radiator/hose leak',
        'Misfueling (gas in diesel or vice versa)', 'Transmission failure',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 MOTORWAY BREAKDOWN? Pull as far left as possible onto the hard shoulder. Turn on **hazard lights**. Exit from the left (passenger) side, stay behind the barrier. Wear a hi-vis vest. Call **Highways England: 0300 123 5000** or your breakdown provider. Do NOT attempt repairs on the motorway.',
        us: '🚨 HIGHWAY BREAKDOWN? Pull as far right as possible onto the shoulder. Turn on **hazard lights**. Exit from the right side away from traffic, stay behind barriers. Wear a hi-vis vest if available. Call **911** or *HP on your mobile. Do NOT attempt repairs on the highway.',
      },
      general: {
        uk: 'Keep an emergency kit: torch, hi-vis vest, warning triangle (required in some EU tunnels), jump leads, tyre inflator. Check tyre pressures monthly. Do not ignore dashboard warning lights. Keep fuel above quarter tank in winter. Consider **RAC, AA, or Green Flag** breakdown cover.',
        us: 'Keep an emergency kit: flashlight, hi-vis vest, flares or reflective triangles, jumper cables, tyre inflator. Check tyre pressures monthly. Do not ignore dashboard warning lights. Keep fuel above quarter tank in winter. Consider **AAA** roadside assistance membership.',
      },
    },
    regulations: {
      uk: ['Highway Code (motorway breakdown rules)', 'IVR (vehicle recovery standards)', 'PAS 43 (recovery safety)', 'MOT standards'],
      us: ['FMCSA towing regulations', 'State DOT requirements', 'WreckMaster certification', 'AAA service standards'],
    },
    repairPractices: {
      uk: [
        'Jump start: positive-to-positive, negative-to-engine-earth',
        'Wrong fuel: do NOT start  -  drain and flush required',
        'Tyre change: only on firm, level ground away from traffic',
        'Overheating: cool 30+ mins before opening cap',
        'EV: never touch orange high-voltage cables',
      ],
      us: [
        'Jump start: follow battery sequence carefully', 'Misfueling: towing required for fuel system flush',
        'Tire change: must be on flat surface away from moving traffic',
        'Wait for engine to cool before checking coolant',
        'EV safety: maintain distance from orange HV cabling',
      ],
    },
  },

  'air-conditioning': {
    name: 'Air Conditioning / HVAC', usName: 'Heating & Cooling', icon: '❄️',
    emergencyKeywords: [
      'air conditioning', 'ac not working', 'hvac', 'no cooling', 'no heating',
      'air con broken', 'ac leaking', 'ac making noise', 'furnace not working',
      'heat pump failed', 'thermostat broken', 'refrigerant leak', 'ac unit frozen',
      'ac blowing warm air', 'ac', 'cooling', 'air con', 'aircon', 'heat pump', 'ventilation', 'furnace',
    ],
    diagnostics: {
      uk: [
        { symptom: 'AC blowing warm air', likely: 'Low refrigerant, compressor fault, or blocked condenser', urgency: 'URGENT' },
        { symptom: 'AC unit iced up or frozen', likely: 'Low refrigerant, poor airflow, or faulty expansion valve', urgency: 'URGENT' },
        { symptom: 'Water leaking from indoor unit', likely: 'Blocked condensate drain or frozen evaporator thawing', urgency: 'URGENT' },
        { symptom: 'Chemical smell from AC', likely: 'Refrigerant leak  -  potential health hazard', urgency: 'EMERGENCY' },
        { symptom: 'AC making grinding noise', likely: 'Fan motor bearing failure or debris in unit', urgency: 'URGENT' },
        { symptom: 'Furnace cycles on and off rapidly', likely: 'Faulty flame sensor, thermostat, or airflow restriction', urgency: 'GENERAL' },
        { symptom: 'No response from thermostat', likely: 'Dead batteries, wiring fault, or blown transformer', urgency: 'GENERAL' },
      ],
      us: [
        { symptom: 'AC is blowing warm air', likely: 'Failed capacitor, low refrigerant, or dirty condenser coils', urgency: 'URGENT' },
        { symptom: 'Evaporator coil is frozen/iced', likely: 'Airflow restriction (dirty filter) or low Freon/Puron', urgency: 'URGENT' },
        { symptom: 'Water leaking from the air handler', likely: 'Clogged primary condensate drain or failed pump', urgency: 'URGENT' },
        { symptom: 'Burning or chemical odor from vents', likely: 'Electrical component failure or refrigerant leak', urgency: 'EMERGENCY' },
        { symptom: 'Loud squealing or banging from unit', likely: 'Blower motor bearing or fan blade issue', urgency: 'URGENT' },
        { symptom: 'Furnace is short-cycling', likely: 'Overheating due to dirty filter or faulty limit switch', urgency: 'GENERAL' },
        { symptom: 'Thermostat is blank or unresponsive', likely: 'Tripped breaker, blown fuse, or 24V power loss', urgency: 'GENERAL' },
      ],
    },
    typicalFaults: {
      uk: [
        'Refrigerant leak', 'Compressor failure', 'Blocked condenser coils',
        'Failed capacitor', 'Clogged air filter', 'Frozen evaporator coil',
        'Faulty thermostat', 'Condensate pump blockage',
      ],
      us: [
        'Low refrigerant levels', 'Failed compressor capacitor', 'Dirty outdoor condenser',
        'Clogged HVAC air filter', 'Ice accumulation on coils', 'Faulty thermostat/smart control',
        'Condensate line blockage', 'Blown blower motor',
      ],
    },
    safetyGuidance: {
      emergency: {
        uk: '🚨 REFRIGERANT SMELL? Turn off the AC unit at the **fuse spur or consumer unit**. Open all windows and doors. Leave the area  -  refrigerant can cause dizziness, breathing difficulties, and frostbite. Call a **REFCOM or F-Gas certified** HVAC/refrigeration engineer immediately. Do NOT attempt to fix refrigerant leaks yourself.',
        us: '🚨 REFRIGERANT SMELL? Turn off the AC/HVAC at the **electrical breaker**. Open all doors and windows and ventilate fully. Refrigerant exposure can cause dizziness, breathing problems, and frostbite on contact. Call an **EPA 608 certified HVAC technician** immediately. Do NOT attempt refrigerant repairs yourself.',
      },
      general: {
        uk: 'Change or clean air filters every 1-3 months. Service your **air conditioning unit** annually (REFCOM/F-Gas certified). Keep outdoor units clear of debris. Do not close vents  -  it increases system pressure. Check **F-Gas Regulations** for refrigerant compliance.',
        us: 'Replace air filters every 1-3 months. Service your **HVAC system** twice yearly  -  spring for AC, fall for heating. Keep outdoor condenser units clear of leaves and debris (2ft clearance). Do not block supply vents. Check for **NATE-certified** technicians for quality assurance.',
      },
    },
    regulations: {
      uk: ['F-Gas Regulations (refrigerant handling)', 'Building Regs Part L (energy)', 'REFCOM / BESA certification', 'BS EN 378 (safety standard)'],
      us: ['EPA Section 608 (refrigerant certification)', 'NATE Certification', 'ACCA Standards (Manual J, S, D)', 'ASHRAE Standards'],
    },
    repairPractices: {
      uk: [
        'Refrigerant work by F-Gas certified only',
        'Leak detection: electronic sniffer or UV dye',
        'Coil cleaning improves efficiency 5-25%',
        'Capacitor testing with multimeter', 'Condensate drain flushing',
      ],
      us: [
        'EPA 608 certification required for refrigerant handling',
        'Nitrogen pressure testing and evacuation for leaks',
        'Annual proactive maintenance (filter, coils, drains)',
        'Check ductwork for air leaks and seal with mastic',
      ],
    },
  },
};

// ─── SLUG MAPPING: align with chat-logic.ts trade slugs ───────

/** Maps INTERNAL_KNOWLEDGE keys → chat-logic trade slugs */
const SLUG_MAP: Record<string, string> = {
  'plumbing': 'plumber',
  'electrical': 'electrician',
  'gas-engineer': 'gas-engineer',
  'locksmith': 'locksmith',
  'drain-specialist': 'drain-specialist',
  'glazier': 'glazier',
  'roofer': 'roofer',
  'builder': 'builder',
  'water-restoration': 'water-restoration',
  'breakdown': 'breakdown',
  'air-conditioning': 'hvac',
};

// ─── TRADE DETECTOR (SCORED) ──────────────────────────────────

/**
 * Detect the most likely trade from a user message using weighted scoring.
 * Multi-word keyword matches score higher than single-word matches.
 */
export function detectTradeFromBrain(userMessage: string): { slug: string; chatSlug: string; name: string; score: number } | null {
  const lower = userMessage.toLowerCase();
  const scores: Record<string, { slug: string; chatSlug: string; name: string; score: number }> = {};

  for (const [slug, trade] of Object.entries(INTERNAL_KNOWLEDGE)) {
    let score = 0;
    for (const keyword of trade.emergencyKeywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(' ').length;
      }
    }
    if (score > 0) {
      scores[slug] = { slug, chatSlug: SLUG_MAP[slug] || slug, name: trade.name, score };
    }
  }

  if (Object.keys(scores).length === 0) return null;
  return Object.values(scores).sort((a, b) => b.score - a.score)[0];
}

// ─── EMERGENCY CLASSIFIER ─────────────────────────────────────

/**
 * Classify urgency of a user message using internal rules only.
 * No API calls. Pure pattern matching + scored trade detection.
 */
export function classifyEmergency(userMessage: string): EmergencyClassification {
  const lower = userMessage.toLowerCase();

  for (const pattern of CRITICAL_DANGER_PATTERNS) {
    if (lower.includes(pattern)) {
      const bestTrade = detectTradeFromBrain(userMessage);
      return { level: 'EMERGENCY', matchedPattern: pattern, matchedTrade: bestTrade?.chatSlug || null };
    }
  }

  const bestTrade = detectTradeFromBrain(userMessage);
  if (bestTrade) {
    const urgentQualifiers = ['help', 'emergency', 'urgent', 'asap', 'immediately', 'now', 'dangerous', 'risk', 'scared', 'worried', "can't", "won't stop", 'getting worse', 'spreading'];
    const hasUrgency = urgentQualifiers.some(q => lower.includes(q));
    return { level: hasUrgency ? 'URGENT' : 'GENERAL', matchedTrade: bestTrade.chatSlug };
  }

  return { level: 'UNKNOWN' };
}

// ─── DIAGNOSTIC MATCHER ───────────────────────────────────────

/**
 * Find matching diagnostics for a user message within a specific trade.
 * Matches when ≥2 meaningful words from a symptom appear in the message.
 */
export function findMatchingDiagnostics(userMessage: string, tradeSlug: string, region: 'uk' | 'us' = 'uk'): Diagnostic[] {
  // Reverse-map chat slug to internal knowledge key
  const internalKey = Object.entries(SLUG_MAP).find(([, v]) => v === tradeSlug)?.[0] || tradeSlug;
  const trade = INTERNAL_KNOWLEDGE[internalKey];
  if (!trade?.diagnostics) return [];

  const lower = userMessage.toLowerCase();
  const regionalDiagnostics = trade.diagnostics[region] || [];
  
  return regionalDiagnostics.filter(d => {
    const words = d.symptom.toLowerCase().split(/\s+/);
    const matchCount = words.filter(w => w.length > 3 && lower.includes(w)).length;
    return matchCount >= 2;
  });
}

const TRADE_DONT_WARNINGS: Record<string, string> = {
  plumber: "Do not open ceilings, cut pipes, remove sealed parts, or keep using water if the leak is spreading.",
  electrician: "Do not touch wet electrics, burnt sockets, exposed wiring, consumer units, or anything that is sparking or hot.",
  locksmith: "Do not try to force the door, drill the lock, bypass security, or ask for advice that could be used to enter someone else's property.",
  "gas-engineer": "Do not use flames, switches, appliances, phones near the leak, or try to repair gas pipework, boilers, or flues yourself.",
  "drain-specialist": "Do not mix drain chemicals, remove covers over sewage, use pressure equipment indoors, or keep flushing into a blockage.",
  glazier: "Do not handle broken glass with bare hands, leave sharp edges exposed, or try to secure overhead glass without help.",
  roofer: "Do not climb onto the roof, use ladders in bad weather, lift tiles, or make temporary fixes near overhead cables.",
  builder: "Do not prop, drill, knock through, remove debris, or stay in an area with bulging walls, sagging ceilings, or widening cracks.",
  "water-restoration": "Do not walk through floodwater where electrics may be live, use household vacuums, or disturb contaminated water without protection.",
  breakdown: "Do not stand in the road, stay in a vehicle exposed to fast traffic, attempt roadside repairs in live lanes, or tow without proper equipment.",
  hvac: "Do not handle refrigerant, bypass electrical controls, open sealed gas or combustion parts, or keep running a unit that smells burnt or is leaking.",
};

const cleanGuidance = (text: string) =>
  text.replace(/^[^\w(]+/, '').replace(/\s+/g, ' ').trim();

const firstItems = (items: string[], count = 3) =>
  items.slice(0, count).map(item => `- ${cleanGuidance(item)}`).join('\n');

const articleFor = (name: string) => /^[aeiou]/i.test(name.trim()) ? `an ${name}` : `a ${name}`;

// ─── OFFLINE RESPONSE GENERATOR ──────────────────────────────

/**
 * Generate a full advisory response using ONLY the internal knowledge base.
 * No API calls, no fetch, no database queries.
 * Returns structured advice that chat-logic.ts can insert into the chat.
 */
export function getOfflineResponse(userMessage: string, region: 'uk' | 'usa' = 'uk'): OfflineResponse {
  const classification = classifyEmergency(userMessage);
  const tradeDetected = detectTradeFromBrain(userMessage);

  // matchedTrade from classifyEmergency uses chatSlug already
  const chatSlug = classification.matchedTrade ?? tradeDetected?.chatSlug ?? null;

  const regKey = region === 'usa' ? 'us' : 'uk';
  const emergencyNumber = region === 'usa' ? '911' : '999';
  const serviceName = region === 'usa' ? 'Emergency Contractors' : 'Emergency Tradesmen';

  if (!chatSlug) {
    return {
      type: 'NO_MATCH', trade: null, tradeName: null, urgency: 'UNKNOWN',
      message: `I wasn't able to identify the specific trade you need. Could you tell me more? I cover: plumbing, electrics, gas, locks, drains, glazing, roofing, building work, water damage, vehicle breakdown, or air conditioning/HVAC.`,
      safetyAdvice: null, guideToProfessional: true,
      professionalMessage: `If there's immediate danger, call ${emergencyNumber} first.`,
    };
  }

  // Resolve to internal knowledge
  const internalKey = Object.entries(SLUG_MAP).find(([, v]) => v === chatSlug)?.[0] || chatSlug;
  const trade = INTERNAL_KNOWLEDGE[internalKey];
  if (!trade) {
    return {
      type: 'NO_MATCH', trade: chatSlug, tradeName: chatSlug, urgency: 'UNKNOWN',
      message: `I detected a ${chatSlug} issue but couldn't load detailed guidance. Please contact a qualified professional.`,
      safetyAdvice: null, guideToProfessional: true,
      professionalMessage: `Contact a qualified ${chatSlug} professional via ${serviceName}.`,
    };
  }

  const diagnostics = findMatchingDiagnostics(userMessage, chatSlug, regKey);
  const tradeRegs = trade.regulations[regKey] || [];
  const tradeName = region === 'usa' ? trade.usName : trade.name;
  const safetyEmergency = trade.safetyGuidance.emergency[regKey];
  const safetyGeneral = trade.safetyGuidance.general[regKey];
  const typicalFaults = trade.typicalFaults[regKey] || [];
  const repairPractices = trade.repairPractices[regKey] || [];
  const dontWarning = TRADE_DONT_WARNINGS[chatSlug] || "Do not attempt risky temporary repairs or continue using anything that looks unsafe.";
  const regulationNote = tradeRegs[0] ? `\n\nRelevant safety rule/guidance: **${tradeRegs[0]}**.` : "";

  // ── EMERGENCY ────────────────────────────────────────────────
  if (classification.level === 'EMERGENCY') {
    let msg = `That sounds like it could be dangerous, so let's keep this simple and safe.\n\n**Do this now**\n${cleanGuidance(safetyEmergency)}\n\n**Please don't**\n${dontWarning}`;
    
    if (diagnostics.length > 0) {
      msg += `\n\nA likely issue is **${diagnostics[0].symptom.toLowerCase()}** - ${diagnostics[0].likely}.`;
    }
    
    msg += `${regulationNote}\n\nOnce you are safe, a qualified **${tradeName.toLowerCase()}** should handle the repair. If anyone is in immediate danger, call **${emergencyNumber}** first.`;

    return {
      type: 'EMERGENCY', trade: chatSlug, tradeName, urgency: 'EMERGENCY', message: msg,
      safetyAdvice: safetyEmergency,
      diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
      guideToProfessional: true,
      professionalMessage: `Contact a qualified emergency ${tradeName.toLowerCase()} immediately via ${serviceName}.`,
    };
  }

  // ── URGENT ───────────────────────────────────────────────────
  if (classification.level === 'URGENT') {
    let msg = `This sounds like ${articleFor(tradeName.toLowerCase())} issue that should be handled carefully.\n\n**Safe next step**\n${cleanGuidance(safetyEmergency)}\n\n**Please don't**\n${dontWarning}\n\n`;
    
    if (diagnostics.length > 0) {
      msg += `**What it might be (safe-level)**\n`;
      diagnostics.slice(0, 2).forEach(d => {
        msg += `- **${d.symptom}** - ${d.likely}\n`;
      });
      msg += `\n`;
    }
    
    if (typicalFaults.length > 0) {
      msg += `**Common faults a professional will check**\n`;
      typicalFaults.slice(0, 3).forEach(fault => {
        msg += `- ${fault}\n`;
      });
      msg += `\n`;
    }
    
    msg += `The safest next step is to have a qualified **${tradeName.toLowerCase()}** assess it before it gets worse.${regulationNote}`;

    return {
      type: 'URGENT', trade: chatSlug, tradeName, urgency: 'URGENT', message: msg,
      safetyAdvice: safetyEmergency,
      diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
      typicalFaults: typicalFaults.slice(0, 3),
      regulations: tradeRegs.slice(0, 1),
      guideToProfessional: true,
      professionalMessage: `Contact a qualified ${tradeName.toLowerCase()} via ${serviceName} for professional assessment.`,
    };
  }

  // ── GENERAL ──────────────────────────────────────────────────
  let msg = `This sounds like ${articleFor(tradeName.toLowerCase())} question. Here's the safe version.\n\n**Good first step**\n${cleanGuidance(safetyGeneral)}\n\n**Please don't**\n${dontWarning}\n\n`;
  
  if (diagnostics.length > 0) {
    msg += `**What it might be**\n`;
    diagnostics.slice(0, 2).forEach(d => {
      msg += `- **${d.symptom}** - ${d.likely}\n`;
    });
    msg += `\n`;
  }
  
  if (typicalFaults.length > 0) {
    msg += `**Common causes**\n`;
    typicalFaults.slice(0, 3).forEach(fault => {
      msg += `- ${fault}\n`;
    });
    msg += `\n`;
  }
  
  if (repairPractices.length > 0) {
    msg += `**Prevention tips**\n${firstItems(repairPractices, 2)}\n\n`;
  }

  msg += `If it keeps happening, gets worse, or involves anything unsafe, a qualified **${tradeName.toLowerCase()}** should inspect it properly.${regulationNote}`;
  
  return {
    type: 'GENERAL', trade: chatSlug, tradeName, urgency: 'GENERAL', message: msg,
    safetyAdvice: safetyGeneral,
    diagnostics: diagnostics.length > 0 ? diagnostics : undefined,
    typicalFaults: typicalFaults,
    repairPractices: repairPractices,
    regulations: tradeRegs,
    guideToProfessional: true,
    professionalMessage: `Find a qualified ${tradeName.toLowerCase()} through ${serviceName} for professional assessment and repair.`,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────

export function getTradeKnowledge(chatSlug: string): TradeKnowledge | null {
  const internalKey = Object.entries(SLUG_MAP).find(([, v]) => v === chatSlug)?.[0] || chatSlug;
  return INTERNAL_KNOWLEDGE[internalKey] || null;
}

export function getSafetyGuidance(chatSlug: string, isEmergency = false, region: 'uk' | 'us' = 'uk'): string | null {
  const trade = getTradeKnowledge(chatSlug);
  if (!trade) return null;
  return isEmergency ? trade.safetyGuidance.emergency[region] : trade.safetyGuidance.general[region];
}

export function getRegulations(chatSlug: string, region: 'uk' | 'usa' = 'uk'): string[] {
  const trade = getTradeKnowledge(chatSlug);
  if (!trade) return [];
  return trade.regulations[region === 'usa' ? 'us' : 'uk'] || [];
}

export function listSupportedTrades(): { chatSlug: string; name: string; usName: string; icon: string }[] {
  return Object.entries(INTERNAL_KNOWLEDGE).map(([key, t]) => ({
    chatSlug: SLUG_MAP[key] || key,
    name: t.name,
    usName: t.usName,
    icon: t.icon,
  }));
}
