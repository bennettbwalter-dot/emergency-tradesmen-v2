from fpdf import FPDF
import os

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, 'UK Emergency Trades: Master Q&A Database', 0, 1, 'C')
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(220, 220, 220)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(5)

    def add_qa(self, question, answer):
        self.set_font('Arial', 'B', 10)
        self.multi_cell(0, 5, f"Q: {question}")
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 5, f"A: {answer}")
        self.ln(3)

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=15)

# --------------------------------------------------------------------------------
# DATA: 25 Q&A PER TRADE
# --------------------------------------------------------------------------------

trades_data = {
    "1. ELECTRICAL (UK Regulations & Safety)": [
        ("My fuse box is making a buzzing noise, is this dangerous?", "Yes. A buzzing consumer unit often indicates a loose connection or arcing. This is a fire hazard. Turn off the main switch immediately and call an emergency electrician."),
        ("What is an EICR and do I need one?", "EICR stands for Electrical Installation Condition Report. It is a mandatory safety check for landlords in the UK (required every 5 years). Homeowners are recommended to get one every 10 years."),
        ("There is a fishy smell near my sockets, what is it?", "A fishy smell is a classic sign of overheating electrical components (burning plastic/bakelite). Isolate the circuit immediately and call an electrician."),
        ("What should I do if my RCD keeps tripping?", "Unplug all appliances. Reset the RCD. If it stays on, plug items back in one by one to find the faulty appliance. If it trips with nothing plugged in, there is a wiring fault requiring a professional."),
        ("Can I do my own electrical work in the UK?", "Minor work (like changing a socket face) is permitted, but Part P of the Building Regulations restricts DIY work in 'special locations' (bathrooms, kitchens) and prohibits major alterations without certification."),
        ("What is the emergency number for a power cut?", "Dial 105. This connects you to your local Distribution Network Operator (DNO) to report or track power cuts. Do not call 999 unless there is an immediate risk to life (e.g., fallen power lines)."),
        ("I drilled through a wall and hit a wire, what now?", "Do not touch the drill or the wall if the power is still on. Go to your consumer unit and turn off the main switch. Call an electrician to repair the circuit."),
        ("Is a bathroom pull cord switch mandatory?", "Not strictly mandatory, but standard wall switches inside a bathroom must be at least 0.6m from the bath/shower zone. Pull cords are the safest and most common compliant method."),
        ("What does a 'Part P' registered electrician mean?", "It means the electrician is registered with a government-approved scheme (like NICEIC or NAPIT) and can self-certify that their work complies with the Building Regulations."),
        ("Why are my lights flickering?", "This can be a loose bulb, a loose wiring connection, or an issue with the external grid supply. If it affects the whole house, call 105. If just one room, call an electrician."),
        ("How do I know if my electrics are old/unsafe?", "Look for: rubber or fabric insulated cables (pre-1960s), a wooden backboard on the fuse box, cast iron switches, or no RCD protection. These require an immediate upgrade."),
        ("What is the difference between a fuse and a circuit breaker?", "A fuse melts to cut power and must be replaced. A circuit breaker (MCB) switches off automatically and can be reset. Breakers are modern and safer."),
        ("Can I install an electric shower myself?", "No. This requires running a new high-current circuit in a special location (bathroom). It is notifiable work under Part P and must be done by a qualified electrician."),
        ("What is Equipotential Bonding?", "It connects metal pipes (gas/water) to the main earthing terminal to prevent electric shock. If you touch a tap and a live fault occurs, bonding ensures the fuse blows."),
        ("My plug socket feels hot to the touch.", "Stop using it immediately. This indicates a loose wire causing high resistance and heat, or the appliance is drawing too much power. It is a fire risk."),
        ("What are the IP ratings for outdoor lights?", "Outdoor lights should generally be at least IP44 (splash proof). For areas exposed to heavy jets of water, IP65 is recommended."),
        ("Do I need a rewire if I have a fuse wire box?", "Likely yes. Old rewireable fuse boxes usually lack RCD protection, which is crucial for preventing fatal electric shocks."),
        ("Who is responsible for the meter and the fuse box?", "The energy supplier owns the meter. The homeowner owns the consumer unit (fuse box). The DNO owns the main cutout fuse (usually the big black fuse before the meter)."),
        ("What is a spur socket?", "A spur is a new socket wired directly from an existing socket rather than the main ring circuit. You cannot run a spur off another spur."),
        ("Is it safe to tape up a damaged electrical cord?", "No. Electrical tape is not a permanent repair. Damaged flex cables should be replaced entirely to prevent shock."),
        ("What does 'LOTO' mean?", "Lock Out / Tag Out. It is a safety procedure used by electricians to ensure circuits are isolated and cannot be turned back on while they are working."),
        ("Why has my electricity bill spiked suddenly?", "If not a rate change, you may have a faulty immersion heater (stuck 'on') or an appliance fault. An electrician can check for 'current leakage'."),
        ("Can I put a socket in a bathroom?", "Only if it is a shaver socket (low voltage) or if the socket is 3 meters away from the bath/shower (rarely possible in UK homes)."),
        ("What do I do if I see sparks coming from an outlet?", "Turn off the power at the main consumer unit immediately. Do not use water. Call an emergency electrician."),
        ("How often should portable appliances (PAT) be tested?", "For landlords/businesses, recommended frequencies vary (e.g., every 1-2 years for heavy-use items). It ensures equipment like kettles and heaters are safe.")
    ],

    "2. PLUMBING (Emergency & Maintenance)": [
        ("Where is my stopcock usually located?", "Usually under the kitchen sink, or sometimes in a downstairs cloakroom or under the stairs. You should also know where the external stopcock is (in the street)."),
        ("What is the first thing to do if a pipe bursts?", "Turn off the main stopcock immediately to stop water flow. Then open all taps to drain the system and turn off the boiler."),
        ("How do I thaw a frozen pipe?", "Turn off the water. Apply gentle heat using a hairdryer or hot water bottle starting from the tap end working back. NEVER use a naked flame or blowtorch."),
        ("Why is my boiler pressure dropping?", "You may have a leak in the system (check radiators for damp spots) or the pressure relief valve is faulty. You can re-pressurize using the filling loop."),
        ("What is 'Water Hammer'?", "It is a banging noise in pipes when taps are turned off, caused by a shockwave of water stopping suddenly. Secure loose pipes or install a water hammer arrestor."),
        ("Is a blocked drain an emergency?", "If it is causing sewage to back up into the home or garden (Category 3 water), yes, it is a health hazard and requires immediate jetting."),
        ("Who is responsible for a blocked sewer pipe?", "If the blockage is within your property boundary and serves only your home, it's yours. If it serves neighbours or is outside your boundary, it's usually the water company's responsibility."),
        ("My radiator is cold at the top.", "This means air is trapped. You need to 'bleed' the radiator using a radiator key until water starts to trickle out."),
        ("My radiator is cold at the bottom.", "This indicates a build-up of sludge (magnetite). The system may need a 'power flush' by a professional."),
        ("What is a Saniflo toilet?", "A macerator toilet used where gravity drainage isn't possible (e.g., basements). Never flush wipes or sanitary products down these as they break easily."),
        ("Why does my hot water smell like rotten eggs?", "This can be bacteria growing in the water heater or a corroded anode rod. A plumber needs to flush the tank and replace the anode."),
        ("How do I fix a dripping tap?", "Usually, the washer inside the tap needs replacing. Isolate the water to the tap, unscrew the headgear, and swap the washer."),
        ("What is a condensing boiler?", "Modern boilers that recover heat from exhaust gases to be more efficient. They have a 'condensate pipe' that can freeze in winter, causing the boiler to stop."),
        ("What counts as a plumbing emergency?", "Uncontainable leaks, total loss of water, risk of ceiling collapse, or sewage backing up into the house."),
        ("Can I use chemical drain cleaners?", "Use sparingly. They can corrode pipes and damage the environment. Mechanical cleaning (rodding/jetting) is safer for the system."),
        ("What is a combi boiler?", "A combination boiler provides heating and hot water directly from the mains without needing a storage tank. You don't have a hot water cylinder."),
        ("Why is the water in my toilet bowl low?", "This could indicate a blockage in the vent pipe or a crack in the toilet bowl. It can allow sewer gas into the home."),
        ("What is a filling loop?", "A flexible silver hose under the boiler used to add water to the central heating system to increase pressure (usually to 1.0 - 1.5 bar)."),
        ("My shower runs hot then cold.", "This could be a blocked shower head, a failing thermostatic cartridge, or another tap being used in the house dropping the pressure."),
        ("How long do copper pipes last?", "Copper pipes can last 50+ years, but can suffer from pinhole leaks due to acidic water or flux corrosion."),
        ("What is a 'tundish'?", "A visual device on the overflow pipe of an unvented cylinder. If you see water dripping through the dry tundish, there is a fault."),
        ("How do I prevent pipes freezing?", "Insulate pipes (lagging) in unheated areas like lofts and garages. Keep heating on low (frost setting) during winter holidays."),
        ("What is backflow?", "The unwanted reversal of water flow, potentially contaminating the clean water supply. Double check valves are installed to prevent this."),
        ("Can I move a gas pipe myself?", "No. It is a criminal offence. Only a Gas Safe registered engineer can work on gas pipes."),
        ("What is hard water?", "Water with high mineral content. It causes limescale build-up in pipes and appliances, reducing efficiency. A water softener can help.")
    ],

    "3. LOCKSMITH (Security & Entry)": [
        ("I'm locked out, will you break my door?", "A professional locksmith prioritizes Non-Destructive Entry (NDE), such as picking or bypassing the lock. Drilling is a last resort."),
        ("What is the 'British Standard' for locks?", "BS 3621. Most insurance companies require external doors to have locks marked with the BS 3621 Kitemark."),
        ("My key snapped in the lock, can you fix it?", "Yes. A locksmith has broken key extractor tools to remove the debris. Do not try to glue it back together."),
        ("What is 'Lock Snapping'?", "A method burglars use to break euro-cylinder locks (common on uPVC doors). You should upgrade to 'Anti-Snap' cylinders (TS007 3-star rated)."),
        ("Do locksmiths need a licence in the UK?", "Technically no, which is why it's vital to choose a vetted locksmith (e.g., Master Locksmiths Association approved) to avoid scams."),
        ("How much does an emergency locksmith cost?", "Prices vary by time and location, but always ask for a quote upfront. Avoid locksmiths who say 'prices start from £39' as this is often a bait-and-switch scam."),
        ("Can one key open all my doors?", "Yes, this is called 'Keyed Alike'. A locksmith can re-pin your cylinders so they all work with a single key."),
        ("What is a mortice lock?", "A lock embedded into the door edge (usually wooden doors), often a 5-lever deadlock. It is more secure than a rim latch (Yale style)."),
        ("My uPVC door handle won't lift up.", "This usually means the multi-point gearbox mechanism has failed. A locksmith can replace the gearbox without replacing the whole door."),
        ("What is a 'keyed' vs 'thumbturn' cylinder?", "Keyed requires a key on both sides. Thumbturn allows you to lock/unlock from the inside without a key (better for fire escape safety)."),
        ("Do you ask for ID before letting me in?", "Yes. A legitimate locksmith will ask for proof of residency (e.g., driver's licence, utility bill) to ensure they aren't helping a burglar break in."),
        ("What is a sash jammer?", "An additional security device for uPVC windows and doors that pivots to block the frame from opening. Good for extra security."),
        ("Can you make a key from a lock without the original?", "Yes, by 'decoding' or 'impressing' the lock, a locksmith can cut a key to code."),
        ("How long does it take to change a lock?", "A standard rim cylinder or euro cylinder takes about 20-30 minutes. A mortice lock takes longer (45-60 mins)."),
        ("My key turns but the door won't open.", "The cam inside the lock or the multi-point mechanism has likely sheared. The door will need professional opening."),
        ("What is a master key system?", "A system where individual keys open specific doors, but a 'Grand Master' key opens all of them. Common in HMOs and offices."),
        ("Are smart locks secure?", "Yes, provided they meet TS621 standards. However, if the battery dies or Wi-Fi fails, ensure you have a mechanical override key."),
        ("What is boarding up?", "If a window or door is smashed (burglary/fire), a locksmith/glazier will secure the property with plywood sheets (OSB) until new glass is ordered."),
        ("Do I need to change locks when I move house?", "Yes. You never know who has a copy of the old keys (estate agents, neighbours, ex-tenants). It is the first security step recommended."),
        ("What is a night latch?", "Commonly known as a 'Yale lock', it mounts on the surface of the door and locks automatically when closed. Should be used with a deadlock for insurance."),
        ("Can you open a safe?", "Yes, specialist safe engineers can open safes using picking, manipulation, or drilling. They need to know the safe's 'Cash Rating'."),
        ("My key is sticky/stiff.", "Do not use oil/WD40 (it attracts dust). Use graphite powder or a dedicated PTFE dry lubricant spray."),
        ("What is 'bumping'?", "A picking technique used by criminals. Anti-bump cylinders prevent this."),
        ("Do you cover eviction warrants?", "Yes, locksmiths often attend with bailiffs to secure a property after a legal repossession."),
        ("What happens if my electronic keypad fails?", "Most have a battery jump port or a manual key override. A locksmith can bypass the solenoid if these fail.")
    ],

    "4. GLAZING (Glass & Windows)": [
        ("What is the difference between Toughened and Laminated glass?", "Toughened glass shatters into safe chunks (safety glass). Laminated glass holds together when cracked (security glass)."),
        ("My double glazing has mist between the panes.", "This is a 'blown unit'. The seal has failed. You don't need new frames, just a replacement glass unit."),
        ("What should I do if my shop window is smashed?", "Call an emergency glazier for 'Boarding Up'. They will secure the site with timber and measure up for a replacement (which may take days to manufacture)."),
        ("Is safety glass mandatory?", "Yes, in 'critical locations': Doors up to 1500mm high, and windows within 300mm of a door or less than 800mm from the floor."),
        ("Can you cut a hole in my existing glass for a cat flap?", "Only if it is non-toughened glass (rare). Toughened glass cannot be cut; a new pane must be manufactured with the hole pre-cut."),
        ("What is Low-E glass?", "Low-Emissivity glass. It has a microscopic coating that reflects heat back into the room, improving energy efficiency."),
        ("How long does emergency glass replacement take?", "Standard 'float' glass can be cut on-site. Toughened glass must be ordered (3-5 days). Boarding up is the immediate solution."),
        ("What is Argon fill?", "Inert gas injected between double glazing panes to improve insulation (better than air)."),
        ("My window won't close properly.", "The hinges (friction stays) are likely damaged or the frame has dropped. A glazier can adjust or replace the hinges."),
        ("What is Georgian wire glass?", "Glass with a wire mesh inside. It acts as a fire retardant (holds glass together in heat) and offers some security."),
        ("Why has my glass cracked on its own?", "This could be 'thermal stress' (uneven heating/shade) or a nickel sulfide inclusion defect in toughened glass."),
        ("Can I upgrade single glazing to double glazing?", "Usually yes, but it may require new frames if the rebate isn't deep enough for the thicker unit."),
        ("What is 'Pilkington K'?", "A popular brand of hard-coated Low-E glass used to meet Building Regulations for thermal performance."),
        ("How do I measure a window for a rough quote?", "Measure the visible glass width and height. Note if the frame is uPVC, wood, or aluminium."),
        ("Is boarding up secure?", "Yes, when done correctly (using bolts through the frame or secure fixing methods), it is very difficult to remove from the outside."),
        ("What is acoustic glass?", "Laminated glass with a special interlayer designed to reduce noise pollution (e.g., for houses near main roads)."),
        ("My putty is crumbling on my wooden windows.", "The putty needs hacking out and replacing. If water gets behind it, it will rot the wooden frame."),
        ("What is a trickle vent?", "A small vent in the window frame allowing airflow to prevent condensation and mould, required by current Building Regulations."),
        ("Can you replace glass in a Velux window?", "Yes, but Velux units are standard sizes. We need the code found on the metal plate on the window edge."),
        ("What is the K-value (or U-value)?", "A measure of heat loss. The lower the number, the better the insulation."),
        ("Do you repair leaded light windows?", "Yes, specialists can repair the lead cames or solder joints if they are leaking or bowing."),
        ("What is 'float' glass?", "Standard annealed glass. It breaks into dangerous sharp shards. Not suitable for doors."),
        ("Can you replace greenhouse glass?", "Yes, usually standard 'horticultural glass' (3mm or 4mm) is used."),
        ("What is mirrored safety film?", "A film applied to existing glass to make it shatter-resistant and provide one-way privacy."),
        ("Why is condensation forming on the *outside* of my new windows?", "This is actually good! It means the windows are insulating so well that the outer pane is cold enough for dew to form (heat isn't escaping to warm it up).")
    ],

    "5. DRAINAGE (Blockages & Surveys)": [
        ("What is High Pressure Water Jetting?", "A method using water at 3000+ PSI to cut through grease, roots, and debris to clear stubborn drain blockages."),
        ("Who is responsible for the drain outside my house?", "Since 2011, water companies (e.g., Thames Water) are usually responsible for lateral drains (shared) and sewers. You are responsible for drains inside your property boundary that serve *only* your home."),
        ("What are the signs of a collapsed drain?", "Frequent blockages, subsidence (ground sinking), cracks in walls, or a strong sewage smell."),
        ("What is a CCTV drain survey?", "A camera is pushed down the pipe to record footage. It identifies cracks, root intrusion, and pitch fibre deformation."),
        ("Why do my drains smell like rotten eggs?", "Sewer gas (hydrogen sulfide) is escaping. Check if traps (U-bends) have dried out or if a vent pipe is blocked."),
        ("Can I pour cooking fat down the sink?", "No! Fat cools and hardens into 'Fatbergs', causing major blockages. Dispose of fat in the bin."),
        ("What is drain relining?", "A 'no-dig' repair. A resin-impregnated sleeve is inserted into the damaged pipe and inflated. It cures to form a new pipe inside the old one."),
        ("What is a soakaway?", "A pit filled with rubble or crates that allows rainwater to slowly drain into the soil. If it blocks, your garden will flood."),
        ("How do I know if I have rats in my drains?", "Noises in walls, scratching sounds, or rat droppings near manhole covers. Rats often enter homes through broken drains."),
        ("What is Pitch Fibre pipe?", "A material used in the 1960s/70s. It often bubbles and deforms over time. If you have it, it likely needs re-rounding or relining."),
        ("My toilet bubbles when the sink drains.", "This indicates a partial blockage or venting issue further down the line. Air is trapped and escaping through the toilet trap."),
        ("What is a manhole/inspection chamber?", "An access point for drains. If the blockage is 'downstream' of the manhole, the chamber will be full."),
        ("Can tree roots block drains?", "Yes, roots seek water and can grow through tiny cracks in pipe joints, causing massive blockages and pipe damage."),
        ("What is a non-return valve?", "A flap installed in the drain to prevent sewage flowing back up into your home during a flood or surcharge."),
        ("Do insurance companies cover drain repairs?", "Often yes, for 'accidental damage' (e.g., collapse), but usually not for 'wear and tear' (e.g., old pitch fibre or soft blockages). Check your policy."),
        ("How do you clear a blocked gully?", "Remove leaves/debris from the grid. Use a plunger or drain rod. If that fails, jetting is required."),
        ("What is the difference between foul water and surface water?", "Foul water (toilet/sink) goes to the sewage plant. Surface water (rain) goes to rivers/soakaways. Mixing them (cross-connection) is illegal."),
        ("Can you unblock a saniflo?", "Saniflos cannot be rodded. The unit usually needs to be opened and manually cleared of the obstruction (often wipes/sanitary items)."),
        ("What is 'rodent scraping'?", "Installing a rat blocker in the drain to stop rats climbing up from the main sewer into your pipes."),
        ("How deep are domestic drains?", "Usually between 0.5m and 1.5m, but can be deeper. CCTV surveys record the depth for repair planning."),
        ("Why is my patio flooding?", "The surface water drain or aco channel is blocked with silt/leaves, or the soakaway is saturated."),
        ("What is 'drain milling'?", "Using a robotic cutter inside the pipe to grind away concrete splashes, tree roots, or protruding metal."),
        ("Is drain dye testing useful?", "Yes, it traces where water flows to confirm if a drain is leaking into the ground or connected to the wrong system."),
        ("Can I build over a drain?", "You need a 'Build Over Agreement' from your local water authority. The drain may need protecting or moving."),
        ("What is the best way to maintain drains?", "Regular hot water flushes, enzymes for grease, and ensuring only the '3 Ps' (Pee, Poo, Paper) go down the toilet.")
    ],

    "6. VEHICLE RECOVERY (Roadside Assistance)": [
        ("I've put the wrong fuel in my car, what do I do?", "Do NOT start the engine. If you start it, the fuel circulates and damages the engine. Call for a 'Fuel Drain' service immediately."),
        ("Can you tow an electric vehicle (EV)?", "Generally no. Towing an EV with wheels on the ground can generate electricity and damage the motors. They require a flatbed truck."),
        ("What should I do if I break down on the motorway?", "Pull to the hard shoulder. Exit the vehicle from the left (passenger side). Wait behind the crash barrier. Call 999 if in immediate danger, otherwise call recovery."),
        ("My battery is flat, can you jump start it?", "Yes, unless the battery is damaged/leaking. For EVs, the 12v battery can be jumped to start the system, but the main HV battery cannot."),
        ("What is the difference between Roadside Assistance and Recovery?", "Roadside Assistance attempts to fix the car there (e.g., flat tyre). Recovery means transporting the vehicle to a garage or home."),
        ("I have a flat tyre but no spare.", "Recovery trucks carry 'universal spare wheels' to get you to a tyre shop, or can tow you to a garage."),
        ("What is a 'Smart Motorway' breakdown procedure?", "If there is no hard shoulder, try to reach an Emergency Refuge Area (ERA). If you stop in a live lane, keep seatbelts on, call 999 immediately."),
        ("My engine management light is red.", "Stop immediately when safe. A red light indicates a serious fault (e.g., low oil pressure) that will destroy the engine if driven."),
        ("Can you change a wheel on a slope?", "It is dangerous. The vehicle must be on flat, stable ground. A recovery operator can use hydraulic jacks or winches to move it to safety."),
        ("What happens if my key is locked inside the car?", "Recovery operators use air wedges and long-reach tools to open the door without damage (non-destructive entry)."),
        ("I'm stuck in mud/snow.", "You need a 'winch out'. Recovery trucks have heavy-duty winches to pull vehicles back onto the road."),
        ("What is DPF failure?", "Diesel Particulate Filter blockage. The car goes into 'Limp Mode'. A mechanic can perform a forced regeneration or clean."),
        ("Can you recover a lowered car?", "Yes, but request a 'low approach' flatbed truck to prevent damaging the bumper/splitter."),
        ("My clutch has gone, can I be towed?", "Yes, but if the car cannot be put in neutral, it may require a 'skate' or a full lift."),
        ("Do you carry batteries?", "Many mobile mechanics carry common battery sizes for replacement on the roadside."),
        ("What is 'Limp Mode'?", "The car's computer restricts speed to protect the engine when a fault is detected. It needs diagnostic code reading."),
        ("Can you recover a van with a full load?", "Yes, but you must tell the recovery company the total weight to ensure they send a truck with the correct load capacity."),
        ("What if I break down with a dog in the car?", "Most recovery operators allow pets in the cab, but it is at the driver's discretion. Mention it when booking."),
        ("My electric handbrake is stuck on.", "Technicians have diagnostic tools to retract the brake, or can mechanically wind it back to allow towing."),
        ("What is a locking wheel nut?", "A special nut to stop wheel theft. If you lose the key, recovery pros have removal tools to get the wheel off."),
        ("Can you fix a snapped fan belt at the roadside?", "Often yes, if the specific part can be sourced locally. It is a common mobile repair."),
        ("What should I do if my car overheats?", "Pull over. Do NOT open the radiator cap while hot (risk of burns). Wait for it to cool. Check coolant levels."),
        ("Is it illegal to use a rope for towing?", "It is legal for emergency recovery to the nearest safe place, but the rope must be marked (e.g., with a flag) and the towed car must have working brakes/lights."),
        ("My car won't start but the lights work.", "Likely the starter motor or a solenoid issue. A jump start won't fix this; it needs a mechanic."),
        ("What info do I need when calling recovery?", "Location (use What3Words or GPS), Vehicle Reg, Make/Model, and nature of the fault.")
    ]
}

# --------------------------------------------------------------------------------
# GENERATE PDF
# --------------------------------------------------------------------------------

for section_title, qa_list in trades_data.items():
    pdf.add_page()
    pdf.chapter_title(section_title)
    for q, a in qa_list:
        pdf.add_qa(q, a)

output_filename = "UK_Trades_QA_Master_List.pdf"
pdf.output(output_filename)

print(f"PDF Generated: {output_filename}")
