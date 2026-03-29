"""
MCP STT Server — Emergency Tradesmen
=====================================
A standalone Python MCP server using FastMCP + faster-whisper.
Exposes a `transcribe_emergency_audio` tool that transcribes audio
and classifies the emergency into one of 11 trades.

Usage (stdio mode):
    python server.py
"""

import json
import os
from fastmcp import FastMCP

# ---------------------------------------------------------------------------
# Trade keyword mapping (mirrors chat-logic.ts TRADE_KEYWORDS)
# ---------------------------------------------------------------------------

TRADE_KEYWORDS: dict[str, list[str]] = {
    "gas-engineer": [
        "gas leak", "smell gas", "carbon monoxide", "co alarm",
        "gas engineer", "gas safe", "gas certificate", "boiler",
        "gas smell", "gas emergency", "pilot light",
    ],
    "plumber": [
        "burst pipe", "leaking pipe", "water leak", "flooding",
        "no hot water", "low water pressure", "radiator leak",
        "boiler leak", "dripping tap", "toilet leaking",
        "toilet not flushing", "water shut off", "stopcock",
        "pipe frozen", "heating not working", "plumber", "plumbing",
        "water", "leak", "pipe", "burst", "flood", "drip",
        "tap", "toilet", "sink", "shower",
    ],
    "electrician": [
        "power cut", "lights out", "no electricity", "fuse box",
        "consumer unit", "tripped fuse", "circuit breaker", "sparks",
        "burning smell", "socket not working", "electric shock",
        "buzzing socket", "flickering lights", "blown fuse",
        "wiring issue", "electrical fault", "power", "electricity",
        "spark", "fuse", "socket", "wire", "wiring",
        "blackout", "electrician", "electrical",
    ],
    "glazier": [
        "broken window", "smashed glass", "cracked glass",
        "shattered window", "glass everywhere", "boarded window",
        "emergency glazing", "window smashed", "glass door broken",
        "unsafe glass", "broken pane", "glass", "window", "pane",
        "glazier", "board up",
    ],
    "locksmith": [
        "locked out", "key snapped", "key stuck", "lost keys",
        "broken lock", "door won't lock", "door won't open",
        "lock jammed", "burglary repair", "lock replacement",
        "emergency locksmith", "can't get in", "locked inside",
        "locksmith", "key", "lock",
    ],
    "drain-specialist": [
        "blocked drain", "blocked toilet", "toilet overflowing",
        "sewage smell", "drain backing up", "slow draining",
        "waste pipe blocked", "sink blocked", "gurgling drain",
        "water backing up", "manhole overflow", "drainage emergency",
        "flooded drain", "blocked", "drain", "sewage", "overflow",
        "gutter",
    ],
    "breakdown": [
        "car won't start", "breakdown", "broken down",
        "roadside assistance", "recovery truck", "flat battery",
        "engine cut out", "stuck on roadside", "vehicle won't move",
        "jump start", "emergency recovery", "mobile mechanic",
        "tow truck", "car", "vehicle", "engine",
    ],
    "roofer": [
        "roof leak", "tiles missing", "roof damage", "storm damage roof",
        "chimney damage", "gutter broken", "flashing loose",
        "roof collapse", "shingles", "roofer", "roof",
    ],
    "builder": [
        "wall crack", "structural damage", "ceiling collapse",
        "subsidence", "building damage", "extension damage",
        "foundation crack", "structural crack", "wall collapse",
        "builder", "structural",
    ],
    "water-restoration": [
        "water damage", "flood damage", "water extraction",
        "drying service", "mold", "mould", "dehumidifier",
        "water restoration", "flood cleanup", "restoration",
    ],
    "hvac": [
        "air conditioning", "ac not working", "heating broken",
        "furnace not working", "hvac", "heat pump", "thermostat",
        "ac unit", "central heating", "cooling",
    ],
}

# High-urgency keywords — situations that may be life-threatening
URGENCY_KEYWORDS: list[str] = [
    "fire", "gas leak", "smell gas", "flooding", "collapse",
    "electrocute", "electric shock", "carbon monoxide", "smoke",
    "sparking", "explosion", "trapped", "emergency", "help",
    "dangerous", "life threatening",
]


def classify_trade(transcript: str) -> str:
    """
    Match the transcript against trade keywords.
    Returns the best-matching trade slug, or 'unknown'.

    Uses a scoring system: longer keyword phrases score higher
    to prioritize specific matches over single-word ones.
    """
    lower = transcript.lower()
    scores: dict[str, int] = {}

    for trade, keywords in TRADE_KEYWORDS.items():
        score = 0
        for kw in keywords:
            if kw in lower:
                # Longer phrases are worth more points
                score += len(kw.split())
        if score > 0:
            scores[trade] = score

    if not scores:
        return "unknown"

    return max(scores, key=scores.get)


def detect_urgency(transcript: str) -> bool:
    """Check if the transcript contains high-urgency keywords."""
    lower = transcript.lower()
    return any(kw in lower for kw in URGENCY_KEYWORDS)


# ---------------------------------------------------------------------------
# FastMCP Server
# ---------------------------------------------------------------------------

mcp = FastMCP(
    "Emergency STT Server",
    description="Transcribes emergency audio and classifies the trade needed.",
)

# Global model reference (lazy-loaded)
_model = None


def get_model():
    """Lazy-load the faster-whisper model."""
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        model_size = os.environ.get("WHISPER_MODEL", "large-v3-turbo")
        device = os.environ.get("WHISPER_DEVICE", "auto")
        compute_type = os.environ.get("WHISPER_COMPUTE", "int8")

        print(f"[MCP-STT] Loading model: {model_size} (device={device}, compute={compute_type})")
        _model = WhisperModel(model_size, device=device, compute_type=compute_type)
        print("[MCP-STT] Model loaded successfully.")
    return _model


@mcp.tool()
def transcribe_emergency_audio(audio_path: str) -> str:
    """
    Transcribe an emergency audio recording and classify the trade needed.

    Args:
        audio_path: Absolute path to the audio file (webm, mp4, wav, etc.)

    Returns:
        JSON string with: transcript, high_urgency, likely_trade_needed
    """
    if not os.path.exists(audio_path):
        return json.dumps({
            "error": f"File not found: {audio_path}",
            "transcript": "",
            "high_urgency": False,
            "likely_trade_needed": "unknown",
        })

    model = get_model()

    # Transcribe
    segments, info = model.transcribe(audio_path, beam_size=5, language="en")
    transcript = " ".join(segment.text.strip() for segment in segments)

    if not transcript.strip():
        return json.dumps({
            "transcript": "",
            "high_urgency": False,
            "likely_trade_needed": "unknown",
            "note": "No speech detected in the audio.",
        })

    # Classify
    trade = classify_trade(transcript)
    urgency = detect_urgency(transcript)

    result = {
        "transcript": transcript,
        "high_urgency": urgency,
        "likely_trade_needed": trade,
    }

    print(f"[MCP-STT] Result: {json.dumps(result)}")
    return json.dumps(result)


if __name__ == "__main__":
    print("[MCP-STT] Starting Emergency STT Server (stdio mode)...")
    mcp.run(transport="stdio")
