/**
 * STT Backend Server — Emergency Tradesmen
 * ==========================================
 * Two-step voice processing pipeline:
 *
 *   STEP 1: POST audio to OpenAI /v1/audio/transcriptions
 *           Model: gpt-4o-mini-transcribe
 *           Input: multipart/form-data (audio file)
 *           Output: raw transcript text
 *
 *   STEP 2: POST transcript to OpenAI /v1/chat/completions
 *           Model: gpt-4o-mini
 *           Input: system + user messages (JSON)
 *           Output: structured triage (trade, location, urgency)
 *
 * Usage:
 *   cd scripts/stt-backend
 *   npm install
 *   npm start
 */

import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
const rootEnvPath = path.resolve(__dirname, "../../.env");
if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
} else {
    dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// OpenAI client
// ---------------------------------------------------------------------------
const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error("[Backend] FATAL: No OpenAI API key found. Set VITE_OPENAI_API_KEY or OPENAI_API_KEY in .env");
    process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "https://emergencytradesmen.net",
        ],
        methods: ["POST", "GET"],
    })
);

// ---------------------------------------------------------------------------
// Multer — save uploads to ./uploads/
// ---------------------------------------------------------------------------
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const extMap = {
            "audio/mp4": ".mp4",
            "audio/wav": ".wav",
            "audio/mpeg": ".mp3",
            "audio/ogg": ".ogg",
        };
        const ext = extMap[file.mimetype] || ".webm";
        cb(null, `emergency_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (OpenAI limit)
    fileFilter: (_req, file, cb) => {
        const allowed = [
            "audio/webm", "audio/mp4", "audio/wav",
            "audio/mpeg", "audio/ogg", "audio/x-m4a",
        ];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    },
});

// ---------------------------------------------------------------------------
// Trade list for triage
// ---------------------------------------------------------------------------
const TRADES = [
    "gas-engineer", "plumber", "electrician", "glazier",
    "locksmith", "drain-specialist", "breakdown", "roofer",
    "builder", "air-conditioning", "water-restoration",
];

// Detailed trade descriptions for the triage model
const TRADE_DESCRIPTIONS = {
    "gas-engineer": "Gas leaks, gas smell, carbon monoxide, boiler issues, pilot light, gas meter, hissing from pipes",
    "plumber": "Burst pipes, water leaks, flooding, no hot water, dripping taps, toilet issues, frozen pipes, radiator leaks",
    "electrician": "Power cuts, no electricity, fuse box tripped, sparks, burning smell from sockets, flickering lights, electric shock",
    "glazier": "Broken windows, smashed glass, cracked glass, shattered windows, glass doors broken, board up needed",
    "locksmith": "Locked out, key snapped, lost keys, broken lock, door won't open, burglary repair, lock jammed",
    "drain-specialist": "Blocked drains, blocked toilets, toilet overflowing, sewage smell, drain backing up, slow draining, manhole overflow",
    "breakdown": "Car won't start, breakdown, flat battery, engine cut out, stuck on roadside, jump start, tow truck, recovery",
    "roofer": "Roof leak, missing tiles, storm damage, chimney damage, flashing loose, roof collapse, water through ceiling",
    "builder": "Cracked walls, structural damage, ceiling collapse, subsidence, door frames broken, carpentry, masonry repair",
    "air-conditioning": "Air conditioning not working, AC broken, no cold air, air con leaking, heating and cooling issues, HVAC",
    "water-restoration": "Water damage, flood damage, water extraction, drying service, mould, dehumidifier, flood cleanup",
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
    res.json({
        status: "ok",
        service: "stt-backend",
        models: {
            transcription: "gpt-4o-mini-transcribe",
            triage: "gpt-4o-mini",
        },
        trades: TRADES,
    });
});

// Main endpoint: Upload audio → Transcribe → Triage
app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
    const startTime = Date.now();
    let filePath = "";

    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided." });
        }

        filePath = path.resolve(req.file.path);
        console.log(`[Backend] Received: ${filePath} (${req.file.mimetype}, ${req.file.size} bytes)`);

        // =================================================================
        // STEP 1: Transcribe audio using gpt-4o-mini-transcribe
        //         Endpoint: POST /v1/audio/transcriptions
        //         Format:   multipart/form-data
        // =================================================================
        console.log("[Backend] STEP 1: Transcribing with gpt-4o-mini-transcribe...");

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "gpt-4o-mini-transcribe",
            language: "en",
            response_format: "text",
        });

        // The SDK returns the transcript as a string when response_format is "text"
        const transcript = typeof transcription === "string"
            ? transcription.trim()
            : (transcription.text || "").trim();

        console.log(`[Backend] STEP 1 complete. Transcript: "${transcript}"`);

        if (!transcript) {
            return res.json({
                transcript: "",
                likely_trade_needed: "unknown",
                location: null,
                high_urgency: false,
                note: "No speech detected in audio.",
                latency_ms: Date.now() - startTime,
            });
        }

        // =================================================================
        // STEP 2: Triage using gpt-4o-mini (chat model)
        //         Endpoint: POST /v1/chat/completions
        //         Format:   JSON (system + user messages)
        // =================================================================
        console.log("[Backend] STEP 2: Triaging with gpt-4o-mini...");

        // Build the trade reference for the prompt
        const tradeRef = Object.entries(TRADE_DESCRIPTIONS)
            .map(([slug, desc]) => `- "${slug}": ${desc}`)
            .join("\n");

        const triageResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an emergency dispatcher for "Emergency Tradesmen", a platform operating in the UK and USA.

Your job: Analyse the customer's spoken emergency and extract three fields.

TRADE LIST (pick exactly ONE slug):
${tradeRef}

RULES:
1. "likely_trade_needed" — Pick the single best matching trade slug from the list above. If no match, use "unknown".
2. "location" — Extract any city, town, county, state, postcode, or zip code mentioned. If none, use null.
3. "high_urgency" — Set to true ONLY if the situation is life-threatening or involves severe property damage: gas leak, fire, flooding, structural collapse, electrocution, carbon monoxide. Otherwise false.

Return ONLY a valid JSON object: {"likely_trade_needed": "...", "location": "...", "high_urgency": true/false}
No markdown. No explanation.`,
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
            temperature: 0,
            max_tokens: 150,
            response_format: { type: "json_object" },
        });


        const triageText = triageResponse.choices[0].message.content;
        let triage;
        try {
            triage = JSON.parse(triageText);
        } catch {
            console.warn("[Backend] Failed to parse triage JSON, returning raw.");
            triage = {
                likely_trade_needed: "unknown",
                location: null,
                high_urgency: false,
            };
        }

        const latencyMs = Date.now() - startTime;
        console.log(`[Backend] STEP 2 complete. Triage:`, triage, `(${latencyMs}ms total)`);

        return res.json({
            transcript,
            likely_trade_needed: triage.likely_trade_needed || "unknown",
            location: triage.location || null,
            high_urgency: triage.high_urgency || false,
            latency_ms: latencyMs,
        });

    } catch (err) {
        console.error("[Backend] Error:", err.message);

        // Surface useful OpenAI errors
        const details = err.response?.data?.error?.message || err.message;
        return res.status(500).json({
            error: "Transcription failed",
            details,
        });
    } finally {
        // Cleanup uploaded file
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (e) => {
                if (e) console.warn("[Backend] Cleanup failed:", e.message);
            });
        }
    }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`\n[Backend] ✅ STT Backend listening on http://localhost:${PORT}`);
    console.log(`[Backend]    STEP 1 model: gpt-4o-mini-transcribe (transcription)`);
    console.log(`[Backend]    STEP 2 model: gpt-4o-mini (chat triage)`);
    console.log(`[Backend]    POST /api/upload-audio to process emergency audio\n`);
});
