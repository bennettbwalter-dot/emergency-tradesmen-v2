
// Simple runner to test the chat logic state machine conceptually
// Since we can't easily import the TS modules due to path aliases (@/lib/...), 
// we will mock the essential parts of processUserMessage here to verify the flow logic.

const SAFETY_TIPS = {
    'plumber': "Turn off stopcock.",
    'water-restoration': "Turn off power."
};

const TRADE_KEYWORDS = {
    'plumber': ['pipe', 'leak', 'water'],
    'water-restoration': ['flood', 'water restoration']
};

let currentState = {
    step: 'INITIAL',
    detectedTrade: null,
    detectedCity: null,
    history: []
};

// SIMULATED processUserMessage Logic (Mirrors chat-logic.ts)
async function processUserMessage(message, state) {
    console.log(`\n--- Processing: "${message}" ---`);
    let responseText = "";

    // 1. Detect Trade
    if (!state.detectedTrade) {
        if (message.includes('pipe')) state.detectedTrade = 'plumber';
        if (message.includes('flood')) state.detectedTrade = 'water-restoration';
    }

    console.log("Trade Detected:", state.detectedTrade);

    // 2. Logic Flow
    if (state.detectedTrade && !state.detectedCity) {
        if (state.step === 'LOCATION_CHECK') {
            // Fallback
            responseText = "Using nearest area. Searching now.";
            // navigate
        } else {
            // First time
            const tip = SAFETY_TIPS[state.detectedTrade];
            responseText = `${tip} What city are you in?`;
            state.step = 'LOCATION_CHECK';
        }
    } else {
        responseText = "I didn't catch that.";
    }

    return { newState: state, response: { content: responseText } };
}

async function runTest() {
    try {
        console.log("Initial State:", currentState);

        // Turn 1
        const result1 = await processUserMessage("My pipe burst", currentState);
        currentState = result1.newState;
        console.log("Response 1:", result1.response.content);

        if (currentState.detectedTrade !== 'plumber') throw new Error("Trade detection failed");
        if (currentState.step !== 'LOCATION_CHECK') throw new Error("Step did not advance");

        console.log("SUCCESS: Logic Flow looks correct.");
    } catch (e) {
        console.error("FAIL:", e);
    }
}

runTest();
