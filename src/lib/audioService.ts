
/**
 * Audio service for UI sounds.
 * Synthesizes sounds to avoid extra asset management and ensure instant play.
 */
class AudioService {
    private audioContext: AudioContext | null = null;

    private getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null;
        if (!this.audioContext) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        }
        return this.audioContext;
    }

    /**
     * Synthesizes a realistic mechanical keyboard click sound.
     * Layers three components: Snap, Thump, and Resonance with subtle randomness.
     */
    public playClick(): void {
        const ctx = this.getContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;
        
        // Add subtle randomness to each press (±5%)
        const variance = () => (Math.random() * 0.1) + 0.95;
        const pitchVariance = () => (Math.random() * 20) - 10; // ±10Hz

        // 1. MECHANICAL SNAP (High Frequency "Click")
        // Simulates the switch actuation
        const snapSource = ctx.createBufferSource();
        const snapBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.02, ctx.sampleRate);
        const snapData = snapBuffer.getChannelData(0);
        for (let i = 0; i < snapBuffer.length; i++) {
            snapData[i] = (Math.random() * 2 - 1) * (1 - i / snapBuffer.length);
        }
        snapSource.buffer = snapBuffer;

        const snapFilter = ctx.createBiquadFilter();
        snapFilter.type = 'highpass';
        snapFilter.frequency.setValueAtTime(5000 * variance(), now);

        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.3 * variance(), now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        snapSource.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(ctx.destination);

        // 2. BOTTOM-OUT THUMP (Low/Mid Frequency "Thud")
        // Simulates the physical impact of the key cap hitting the base
        const thumpSource = ctx.createBufferSource();
        const thumpBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const thumpData = thumpBuffer.getChannelData(0);
        for (let i = 0; i < thumpBuffer.length; i++) {
            thumpData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / thumpBuffer.length, 2);
        }
        thumpSource.buffer = thumpBuffer;

        const thumpFilter = ctx.createBiquadFilter();
        thumpFilter.type = 'lowpass';
        thumpFilter.frequency.setValueAtTime(800 * variance(), now);

        const thumpGain = ctx.createGain();
        thumpGain.gain.setValueAtTime(0.4 * variance(), now);
        thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        thumpSource.connect(thumpFilter);
        thumpFilter.connect(thumpGain);
        thumpGain.connect(ctx.destination);

        // 3. CASE RESONANCE (Mid-range Plastic Ring)
        // Simulates the internal echo within the keyboard housing
        const resonance = ctx.createOscillator();
        resonance.type = 'triangle';
        resonance.frequency.setValueAtTime(200 + pitchVariance(), now);
        resonance.frequency.exponentialRampToValueAtTime(150 + pitchVariance(), now + 0.06);

        const resonanceFilter = ctx.createBiquadFilter();
        resonanceFilter.type = 'bandpass';
        resonanceFilter.frequency.setValueAtTime(400 * variance(), now);
        resonanceFilter.Q.setValueAtTime(5, now);

        const resonanceGain = ctx.createGain();
        resonanceGain.gain.setValueAtTime(0.15 * variance(), now);
        resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        resonance.connect(resonanceFilter);
        resonanceFilter.connect(resonanceGain);
        resonanceGain.connect(ctx.destination);

        // Start all layers
        snapSource.start(now);
        thumpSource.start(now);
        resonance.start(now);

        // Clean up
        snapSource.stop(now + 0.1);
        thumpSource.stop(now + 0.1);
        resonance.stop(now + 0.1);
    }
}

export const audioService = new AudioService();
