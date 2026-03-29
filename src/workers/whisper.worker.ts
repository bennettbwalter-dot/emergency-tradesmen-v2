import { pipeline, env } from '@xenova/transformers';

// Skip local check to download from HuggingFace
env.allowLocalModels = false;
env.useBrowserCache = true;

const WORKER_VERSION = '1.0.3';
console.log(`[WhisperWorker] v${WORKER_VERSION} initialized.`);

class WhisperPipeline {
    static task = 'automatic-speech-recognition';
    static model = 'Xenova/whisper-tiny.en';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            console.log(`[Worker] Loading model: ${this.model}...`);
            this.instance = pipeline(this.task, this.model, {
                progress_callback
            });
        }
        return this.instance;
    }
}

// Handle messages from the main thread
self.onmessage = async (event) => {
    const { type, audio } = event.data;

    if (type === 'TRANSCRIPTION_REQUEST') {
        try {
            const transcriber = await WhisperPipeline.getInstance((x) => {
                // Send progress back to main thread if needed
                self.postMessage({ type: 'PROGRESS', data: x });
            });

            console.log('[Worker] Starting transcription...');
            const start = performance.now();

            const output = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                language: 'english',
                task: 'transcribe',
                return_timestamps: false,
            });

            const end = performance.now();
            console.log(`[Worker] Transcription finished in ${((end - start) / 1000).toFixed(2)}s`);

            self.postMessage({
                type: 'TRANSCRIPTION_RESULT',
                text: output.text
            });
        } catch (error) {
            console.error('[Worker] Error during transcription:', error);
            self.postMessage({
                type: 'TRANSCRIPTION_ERROR',
                error: error.message
            });
        }
    }
};
