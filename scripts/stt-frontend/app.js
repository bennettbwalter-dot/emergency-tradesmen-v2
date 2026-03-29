/**
 * Emergency Voice Assistant - Frontend Logic
 * =========================================
 * Captured audio using MediaRecorder API and POSTs to the STT Backend.
 */

const micBtn = document.getElementById('micBtn');
const statusText = document.getElementById('status');
const resultsArea = document.getElementById('results');
const transcriptBox = document.getElementById('transcriptionBox');
const tradeBox = document.getElementById('tradeBox');
const locationBox = document.getElementById('locationBox');
const urgencyBox = document.getElementById('urgencyBox');
const bars = document.querySelectorAll('.bar');

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioContext = null;
let analyser = null;
let animationId = null;

// The backend endpoint
const API_URL = 'http://localhost:3001/api/upload-audio';

micBtn.addEventListener('click', toggleRecording);

async function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        await startRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Setup visualizer
        setupVisualizer(stream);

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = sendAudioData;

        mediaRecorder.start();
        isRecording = true;
        micBtn.classList.add('recording');
        statusText.innerText = "Listening...";
        statusText.style.color = "#ef4444";
        resultsArea.style.display = 'none';

        console.log("[Frontend] Recording started...");

    } catch (err) {
        console.error("[Frontend] Microphone error:", err);
        statusText.innerText = "Error: Mic access denied";
        statusText.style.color = "#ef4444";
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    cancelAnimationFrame(animationId);
    bars.forEach(bar => bar.style.height = '10%');

    isRecording = false;
    micBtn.classList.remove('recording');
    statusText.innerText = "Processing voice...";
    statusText.style.color = "#94a3b8";

    console.log("[Frontend] Recording stopped.");
}

async function sendAudioData() {
    const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'emergency.webm');

    console.log(`[Frontend] Uploading ${audioBlob.size} bytes...`);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        displayResults(data);

    } catch (err) {
        console.error("[Frontend] Upload failed:", err);
        statusText.innerText = "Upload failed. Is the server running?";
        statusText.style.color = "#ef4444";
    }
}

function displayResults(data) {
    statusText.innerText = "Report generated";
    statusText.style.color = "#10b981";

    transcriptBox.innerText = data.transcript || "No speech detected";
    tradeBox.innerText = formatSlug(data.likely_trade_needed);
    locationBox.innerText = data.location || "Unknown";

    if (data.high_urgency) {
        urgencyBox.innerText = "HIGH URGENCY";
        urgencyBox.className = "data-value urgency-high";
    } else {
        urgencyBox.innerText = "Normal";
        urgencyBox.className = "data-value";
    }

    resultsArea.style.display = 'block';
}

function formatSlug(slug) {
    if (!slug) return "Unknown";
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function setupVisualizer(stream) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function updateBars() {
        analyser.getByteFrequencyData(dataArray);

        // Simple visualization: map frequency ranges to our 10 bars
        for (let i = 0; i < bars.length; i++) {
            const index = Math.floor(i * (dataArray.length / bars.length));
            const value = dataArray[index];
            const height = Math.max(10, (value / 255) * 100);
            bars[i].style.height = `${height}%`;
        }

        animationId = requestAnimationFrame(updateBars);
    }

    updateBars();
}
