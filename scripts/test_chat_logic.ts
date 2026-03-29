
import { processUserMessage, ChatState } from '../src/lib/chat-logic';

const initialState: ChatState = {
    step: 'INITIAL',
    detectedTrade: null,
    detectedCity: null,
    suggestedCity: null,
    locationConfirmed: false,
    history: []
};

async function testClassification() {
    const message = "My car just lost all power on the M1 motorway and I'm stuck in the middle lane. The traffic is moving fast. Should I stay buckled in my car or try to run to the shoulder?";
    console.log('Testing message:', message);
    
    // Simulate UK site (default)
    const result = await processUserMessage(message, initialState, 'GB');
    
    console.log('\n--- Result ---');
    console.log('Detected Trade:', result.newState.detectedTrade);
    console.log('Next Step:', result.newState.step);
    console.log('Response Content Preview:', result.response.content.substring(0, 100) + '...');
    
    if (result.newState.detectedTrade === 'breakdown') {
        console.log('\n✅ PASS: Correctly identified as breakdown.');
    } else {
        console.log('\n❌ FAIL: Identified as ' + (result.newState.detectedTrade || 'NOTHING'));
    }
}

testClassification();
