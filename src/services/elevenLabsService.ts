
export class ElevenLabsService {
    private apiKey: string;
    private voiceId: string;

    constructor() {
        this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
        this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb'; // Default 'George'
    }

    async speak(text: string): Promise<void> {
        if (!this.apiKey) {
            console.warn('[ElevenLabs] No API Key found, falling back to browser TTS.');
            throw new Error('No API Key');
        }

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_turbo_v2_5', // Low latency model
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                    },
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ElevenLabs API Error: ${response.status} ${errorText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            return new Promise((resolve, reject) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                audio.onerror = (e) => {
                    URL.revokeObjectURL(audioUrl);
                    reject(e);
                };
                audio.play().catch(reject);
            });

        } catch (error) {
            console.error('[ElevenLabs] Speech failed:', error);
            throw error; // Propagate to trigger fallback
        }
    }
}
