/**
 * STT Backend Server
 * ==================
 * Lightweight Express server that:
 *   1. Accepts audio blob uploads from the frontend
 *   2. Saves them to disk
 *   3. Calls the MCP STT server for transcription + trade classification
 *   4. Returns the JSON result
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
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// CORS — allow the Vite dev server
// ---------------------------------------------------------------------------
app.use(
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["POST"],
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
        const ext = file.mimetype === "audio/mp4" ? ".mp4" : ".webm";
        cb(null, `emergency_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ["audio/webm", "audio/mp4", "audio/wav", "audio/mpeg", "audio/ogg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    },
});

// ---------------------------------------------------------------------------
// MCP Client — connects to the Python STT server via stdio
// ---------------------------------------------------------------------------
let mcpClient = null;

async function getMcpClient() {
    if (mcpClient) return mcpClient;

    const pythonPath = process.env.PYTHON_PATH || "python";
    const serverScript = path.resolve(
        __dirname,
        "..",
        "mcp-stt-server",
        "server.py"
    );

    console.log(`[Backend] Spawning MCP server: ${pythonPath} ${serverScript}`);

    const transport = new StdioClientTransport({
        command: pythonPath,
        args: [serverScript],
    });

    mcpClient = new Client({
        name: "stt-backend-client",
        version: "1.0.0",
    });

    await mcpClient.connect(transport);
    console.log("[Backend] MCP client connected.");
    return mcpClient;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "stt-backend" });
});

// Upload + transcribe
app.post("/api/upload-audio", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided." });
        }

        const filePath = path.resolve(req.file.path);
        console.log(`[Backend] Received audio: ${filePath} (${req.file.mimetype}, ${req.file.size} bytes)`);

        // Call MCP tool
        const client = await getMcpClient();
        const result = await client.callTool({
            name: "transcribe_emergency_audio",
            arguments: { audio_path: filePath },
        });

        // The MCP tool returns a JSON string inside result.content
        let parsed;
        if (result.content && result.content.length > 0) {
            const text = result.content[0].text || result.content[0];
            parsed = typeof text === "string" ? JSON.parse(text) : text;
        } else {
            parsed = { error: "No response from MCP server" };
        }

        console.log(`[Backend] Transcription result:`, parsed);

        // Cleanup the uploaded file after processing
        fs.unlink(filePath, (err) => {
            if (err) console.warn("[Backend] Failed to cleanup:", err.message);
        });

        return res.json(parsed);
    } catch (err) {
        console.error("[Backend] Error:", err);
        return res.status(500).json({
            error: "Transcription failed",
            details: err.message,
        });
    }
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`[Backend] STT Backend listening on http://localhost:${PORT}`);
    console.log(`[Backend] POST /api/upload-audio to transcribe emergency audio`);
});
