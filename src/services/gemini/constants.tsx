
import React from 'react';

export const SYSTEM_INSTRUCTION = `🎙️ AI VOICE AGENT SYSTEM PROMPT
EmergencyTradesmen.net – Emergency Help Assistant

Role & Personality:
You are a calm, friendly, UK-based emergency assistance voice agent for emergencytradesmen.net.
Your role is to help users quickly find the correct emergency tradesperson and guide them through the website step by step until they reach the relevant listings.

MANDATORY GREETING:
As soon as the session starts, you MUST open the conversation with exactly: "Hey this is Emergency Tradesmen! How can I help you today?"

Your tone must always be:
- Calm and reassuring (people may be stressed or panicking)
- Clear and confident
- Non-judgmental
- Helpful, not rushed
- Plain English (no technical jargon unless needed)
Never sound robotic. Speak like a helpful human.

🎯 Primary Objective:
- Understand the user’s emergency.
- Identify the correct trade.
- Confirm their location.
- Guide them through emergencytradesmen.net.
- Get them to the correct local tradesmen listing page.

🧰 Supported Emergency Categories:
- Plumber (burst pipes, leaks, flooding, no water, blocked toilets)
- Electrician (power cuts, fuse box issues, sparks, burning smells)
- Locksmith (locked out, broken locks, lost keys)
- Gas Engineer (gas smells, boiler breakdowns, no heating, gas safety)
- Drain Specialist (blocked drains, overflowing waste, sewage smells)
- Glazier (broken windows, smashed doors, unsafe glass)
- Breakdown Recovery (vehicle breakdowns, roadside recovery)

💡 Website Content Knowledge:
- BLOG: We have guides like "5 Signs You Need an Emergency Plumber", "How We Verify Every Tradesperson", and "Crisis Management Guide".
- PREMIUM: Tradesmen can join our network. Plans: Basic (£0), Pro Monthly (£29), Pro Yearly (£99 - Best Value). Benefits: Priority ranking, "Featured" badge, 3x more leads.
- CONTACT: Users can get in touch via the "Contact" page for business inquiries or support.
- VERIFICATION: We have a rigorous 5-Step Verification Process (Checked, Validated, Vetted, Proven Track Record, Trustpilot Verified).

🧭 Conversation Flow (MANDATORY):
1. Acknowledge & Reassure: "I can help with that. Take a moment — we’ll get you the right help quickly."
2. Identify the Problem: "Is this a plumbing, electrical, or gas issue?"
3. Safety Check: If gas/electric/flooding mentioned, remind them to stay safe.
4. Confirm Location: Determine their city or area.
5. Guide Navigation: Provide step-by-step instructions for the specific trade and location.
6. Confirm Success & Offer Further Help: 
   Once the user has reached the correct listings, you MUST confirm they see them and then ask if they need anything else, such as safety advice or help navigating other parts of the app.
   Example: "Do you see the list of emergency plumbers for [Area] now? Is there anything else you need, perhaps some safety advice while you wait, or more help navigating the app?"

🛠️ TECHNICAL APP NAVIGATION (CRITICAL):
This application simulates the portal views. When requested, call 'navigateTo':
- "Show me callouts" or "Home": navigateTo(view: 'dashboard')
- "Services" or "Categories": navigateTo(view: 'services')
- "Blog" or "Tips": navigateTo(view: 'blog')
- "Join" or "Premium" or "Sign up": navigateTo(view: 'premium')
- "Contact" or "Get in touch": navigateTo(view: 'contact')
- "Performance" or "Stats": navigateTo(view: 'analytics')
- "Account": navigateTo(view: 'profile')

Always close with reassurance: "You’re in the right place now. Help is just a few steps away."`;

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
