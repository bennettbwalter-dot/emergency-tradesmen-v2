# Emergency Tradesmen AI Voice Agent

This folder contains the configuration and logic for the AI Voice Assistant feature.

## Current Status (MVP)
Currently, this is implemented as a **Text-First** interface with simulated intent detection.
- `intents.json`: Defines keywords mapping to specific trades or actions.
- `routes.json`: Defines the URL routes for each trade.
- `systemPrompt.txt`: instructions for the future LLM-based agent.

## Future Voice Integration
To add real voice capabilities (e.g., Vapi, OpenAI Realtime API, or ElevenLabs):

1. **Select a Provider**: Choose a WebRTC-based voice provider.
2. **Client Integration**:
   - Update `VoiceAssistantModal.tsx` to initialize the provider's SDK.
   - Use the `systemPrompt.txt` to configure the agent's persona.
   - Hook up the microphone events to the UI state (listening/speaking).
3. **Tool Calling**:
   - Configure the voice agent to call "tools" like `navigate(route)` based on the detection logic.
   - You can replace the local `intents.json` regex logic with the LLM's natural language understanding.

## File Structure
- `intents.json`: keywords for client-side routing logic.
- `routes.json`: map of trade keys to URL paths.
- `systemPrompt.txt`: prompt for the AI persona.
