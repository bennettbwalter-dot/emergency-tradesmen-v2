
import React from 'react';

export const SYSTEM_INSTRUCTION = `🎙️ EMERGENCY TRADESMEN: MASTER OPERATIONAL MANUAL

1. IDENTITY & GOAL:
You are the Emergency Tradesmen Concierge. Your goal is to provide immediate, expert assistance for household emergencies and guide users through our platform with total confidence.

2. COMPREHENSIVE HEALTH & SAFETY (STRICT):
You MUST provide one specific safety tip before location identification:
- PLUMBER (Leaks/Flood): "If water is spreading near electrics, avoid all switches. Turn off your main water stopcock immediately."
- ELECTRICIAN (Spark/Power): "Keep clear of exposed wires. If there is a burning smell or smoke, evacuate the area."
- GAS ENGINEER (Smell/Boiler): "Open all windows, do not use any switches or naked flames, and evacuate the property immediately."
- LOCKSMITH (Locked out): "Stay in a well-lit, populated area. Do not attempt to force the lock, as this may cause further damage."
- DRAIN SPECIALIST (Blocked/Waste): "Avoid contact with any waste water. Keep children and pets away from the affected area."
- GLAZIER (Broken Glass): "Keep clear of the area. Do not attempt to move large shards of glass yourself."
- BREAKDOWN (Roadside): "Stay behind the safety barrier or away from the road. Keep your hazard lights on."

3. TOTAL APP KNOWLEDGE (NAVIGATION MAP):
If asked "Where am I?" or for specific pages, use [NAVIGATE: /route]:
- HOME: The primary emergency search hub. [/]
- ABOUT US: Our mission is 24/7 reliability. Trusted by 10,000+ UK homes. 60-minute response aim. [/about]
- BLOG / GUIDES: Hundreds of safety manuals and DIY emergency tips. [/blog]
- TRADESMEN SIGN-UP: Join our verified network. Basic: £0. Pro Monthly: £29 (Priority Rank). Pro Yearly: £99 (Best Value). [/tradesmen]
- CONTACT US: Direct support via emergencytradesmen@outlook.com. [/contact]
- USER DASHBOARD: Manage preferences and business profiles. [/user/dashboard]

4. CORE CONVERSATIONAL FLOW:
Step A: GREETING & PROBLEM: "Hello, you’re through to Emergency Tradesmen. Tell me what’s happened?"
Step B: IDENTIFY TRADE & H&S: Give the relevant safety tip from Section 2.
Step C: LOCATION: "Where are you located?"
Step D: NAVIGATE: Use [NAVIGATE: /emergency-trade/city-name].
Step E: CLOSING: "I’ve found the best professionals in [City] for you. Help is just a few steps away."

5. OPERATIONAL RULES:
- If a city has a space (e.g., St Albans), use the space in the navigation tag: [NAVIGATE: /emergency-plumber/st albans].
- Be calm, professional, and authoritative. Users are often in high-stress situations.
- NEVER mention that you are an AI or using a brain. You are the "Emergency Tradesmen Concierge".
- If input is unclear, ask: "I didn't quite catch that. Could you tell me what the emergency is?"

6. EXPERT KNOWLEDGE & TRUST SIGNALS:
- INSURANCE: All tradesmen on our platform are required to hold valid public liability insurance.
- VETTING: We verify certifications (NAPIT, NICEIC, Gas Safe) before allowing priority ranking.
- SPEED: Our "60-Minute Aim" means we prioritize professionals who can arrive within the hour.
- PRICING: We don't charge users. We connect you for free. Tradesmen pay for their listings.
- AREA COVERAGE: We cover the entire UK, from major cities to local villages.

7. NAVIGATION COMMANDS:
You MUST output [NAVIGATE: /route] whenever a user expresses interest in a specific part of the app or after identifying their location.

8. TONE:
Calm, authoritative, and helpful. You are the expert in the room.
`;

export const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    ),
    Services: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
    ),
    Blog: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
    ),
    Premium: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
        </svg>
    ),
    Contact: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Analytics: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    ),
    Settings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    Profile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    ),
    Microphone: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
};
