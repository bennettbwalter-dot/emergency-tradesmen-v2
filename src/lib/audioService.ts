
/**
 * Audio service for UI sounds.
 * Loads a single audio file containing multiple samples and plays specific segments.
 */
class AudioService {
    private audioContext: AudioContext | null = null;
    private clickBuffer: AudioBuffer | null = null;
    private isLoading: boolean = false;

    // Identified timestamps from /sounds/click.ogg
    private readonly clickVariants = [
        5.87, // sharp click
        6.41, // mechanical clack
        6.93, // light click
        7.47, // solid click
        7.99, // quick click
        8.53  // heavy click
    ];

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

    private async loadClickSound(): Promise<void> {
        if (this.clickBuffer || this.isLoading) return;
        
        const ctx = this.getContext();
        if (!ctx) return;

        this.isLoading = true;
        try {
            const response = await fetch('/sounds/click.ogg');
            const arrayBuffer = await response.arrayBuffer();
            this.clickBuffer = await ctx.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error('Failed to load click sound:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Plays a typewriter click sound.
     * @param index Optional index of the click variant (0-5). If omitted, a random one is chosen.
     */
    public playClick(index?: number): void {
        const ctx = this.getContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        if (!this.clickBuffer) {
            this.loadClickSound();
            return;
        }

        const source = ctx.createBufferSource();
        source.buffer = this.clickBuffer;

        // Choose a variant
        let variantIndex = index ?? Math.floor(Math.random() * this.clickVariants.length);
        variantIndex = Math.max(0, Math.min(variantIndex, this.clickVariants.length - 1));
        const startTime = this.clickVariants[variantIndex];

        // Add extreme subtle pitch variation for a natural feel (±2%)
        const playbackRate = 0.98 + (Math.random() * 0.04);
        source.playbackRate.setValueAtTime(playbackRate, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.7, ctx.currentTime); 

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Play the slice (roughly 0.15s - 0.25s for a click)
        source.start(0, startTime, 0.25);
    }
}

export const audioService = new AudioService();

// Pre-load on initialization if in browser
if (typeof window !== 'undefined') {
    audioService.playClick(); 
}
