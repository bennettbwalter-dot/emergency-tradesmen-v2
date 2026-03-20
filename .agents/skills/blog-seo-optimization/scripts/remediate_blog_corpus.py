#!/usr/bin/env python3
"""
Deterministic blog SEO remediation helper.

This script upgrades post bodies with:
- intent-forward lead copy
- richer heading structure
- market-specific safety/regulation language
- internal links to service pages
- FAQ block

It is designed as a practical "content enrichment" pass for exported blog JSON
that can later be pushed to the DB publishing pipeline.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


US_SAFETY = (
    "In the United States, always follow local code requirements and utility safety guidance. "
    "If there is immediate danger (fire, gas odor, flooding near electrics), call 911 first."
)
UK_SAFETY = (
    "In the UK, follow HSE and utility provider guidance. "
    "If there is immediate danger (fire, gas smell, severe electrical risk), call 999 first."
)


def _word_count(text: str) -> int:
    return len(re.findall(r"\b\w+\b", text or ""))


def _detect_region(slug: str) -> str:
    s = (slug or "").lower()
    if s.endswith("-us") or "-us-" in s or s.endswith("-usa") or "-usa-" in s:
        return "US"
    if s.endswith("-gb") or "-gb-" in s or s.endswith("-uk") or "-uk-" in s:
        return "UK"
    return "GLOBAL"


def _keyword_from_title(title: str) -> str:
    t = re.sub(r"[^a-z0-9\s-]", "", (title or "").lower())
    t = re.sub(r"\s+", " ", t).strip()
    return t[:80]


def _trade_links(slug: str) -> tuple[str, str]:
    s = (slug or "").lower()
    if "plumb" in s:
        return ("/emergency-plumber", "/blog/5-signs-you-need-emergency-plumber")
    if "electric" in s or "fuse" in s or "power" in s:
        return ("/emergency-electrician", "/blog/electrical-emergencies-every-homeowner-should-know")
    if "lock" in s:
        return ("/emergency-locksmith", "/blog/emergency-locksmith-guide-gb")
    if "gas" in s or "boiler" in s:
        return ("/emergency-gas-engineer", "/blog/smell-gas-what-to-do-safety-protocol-gb")
    if "drain" in s or "sewage" in s:
        return ("/emergency-drain-specialist", "/blog/sewage-smell-in-house-p-trap-us")
    if "roof" in s:
        return ("/emergency-roofer", "/blog/emergency-roof-leak-tarping-gb")
    if "hvac" in s or "furnace" in s or "heat-pump" in s or "ac-" in s:
        return ("/emergency-hvac", "/blog/ac-blowing-warm-air-capacitor-leak-us")
    return ("/emergency-builder", "/blog/what-to-do-in-home-emergency-before-help-arrives")


def build_rewrite(original: str, title: str, slug: str) -> str:
    region = _detect_region(slug)
    keyword = _keyword_from_title(title)
    service_url, secondary_url = _trade_links(slug)
    safety = US_SAFETY if region == "US" else UK_SAFETY if region == "UK" else (
        f"{UK_SAFETY} {US_SAFETY}"
    )

    intro = (
        f"**Quick answer:** If you are dealing with **{keyword}**, focus on immediate safety first, "
        "limit further damage, and contact a verified 24/7 professional.\n\n"
        "This guide gives practical emergency steps, risk checks, expected response windows, "
        "and clear next actions so you can make a safe decision fast."
    )

    enhancement = f"""
## Immediate Safety Checklist

Before attempting any cleanup, do these first:

1. Move people and pets away from the hazard zone.
2. Isolate the risk source where safe (water, electricity, gas, or entry point).
3. Document visible damage with photos for insurance and contractor triage.
4. Call an emergency professional if risk is ongoing or escalating.

{safety}

## First 30 Minutes: What to Do

### 0–5 Minutes
- Confirm immediate hazards and stop the active source if safe.
- Keep children/pets in a safe room.
- Avoid DIY repairs that increase legal/safety risk.

### 5–15 Minutes
- Protect nearby valuables and vulnerable surfaces.
- Ventilate the area when appropriate.
- Gather key details for the callout: symptoms, smell/sound, affected rooms, and access notes.

### 15–30 Minutes
- Book rapid response support and request ETA.
- Ask for expected diagnostic process and likely first-stage fix.
- Prepare access points to reduce arrival-to-repair time.

## Cost, Time, and Service Expectations

| Topic | Typical Range | Notes |
|---|---:|---|
| Emergency response window | 30–90 minutes | Peak weather/events can increase waits |
| Initial diagnosis | 15–45 minutes | Depends on complexity and access |
| Stabilization/temporary fix | 30–120 minutes | Used to make site safe first |
| Full repair completion | Same day to multi-day | Depends on parts, drying, permits, or specialist works |

## Common Mistakes to Avoid

- Delaying action while searching multiple directories.
- Turning systems back on before diagnostics are complete.
- Ignoring secondary damage (mold, hidden moisture, arcing, structural stress).
- Accepting vague quotes with no scope assumptions listed.

## Internal Resources

- Book help now: [{service_url}]({service_url})
- Related guide: [{secondary_url}]({secondary_url})
- More emergency advice: [/blog](/blog)

## FAQ

### How urgent is this issue?
If active risk exists (smoke, sparks, flooding, gas smell, security breach), treat it as immediate and call emergency services where required.

### Should I attempt a DIY fix first?
Only very low-risk containment actions are recommended. Avoid repairs that require technical certification or create safety/legal exposure.

### What should I tell the callout team?
Share onset time, visible symptoms, any unusual smells/sounds, what you already isolated, and whether vulnerable occupants are present.
"""

    rewritten = f"{intro}\n\n{original.strip()}\n\n{enhancement.strip()}\n"
    return rewritten


def remediate_posts(posts: list[dict[str, Any]], target_word_count: int, max_posts: int | None) -> tuple[list[dict[str, Any]], int]:
    updated = 0
    ranked = sorted(
        posts,
        key=lambda p: (_word_count(p.get("content", "")), p.get("published_at") or ""),
    )

    limit_set = set()
    if max_posts is not None:
        for p in ranked[:max_posts]:
            limit_set.add(p.get("id"))

    for post in posts:
        content = post.get("content") or ""
        if _word_count(content) >= target_word_count:
            continue
        if max_posts is not None and post.get("id") not in limit_set:
            continue
        post["content"] = build_rewrite(content, post.get("title", ""), post.get("slug", ""))
        post["updated_at"] = "2026-03-20T00:00:00+00:00"
        updated += 1
    return posts, updated


def main() -> None:
    parser = argparse.ArgumentParser(description="Apply deterministic SEO content remediation to blog JSON.")
    parser.add_argument("--input", required=True, help="Path to blog posts JSON file.")
    parser.add_argument("--output", required=True, help="Where to write remediated JSON.")
    parser.add_argument("--target-word-count", type=int, default=1200)
    parser.add_argument("--max-posts", type=int, default=10, help="Limit updates to lowest-word-count posts.")
    args = parser.parse_args()

    in_path = Path(args.input)
    out_path = Path(args.output)
    posts = json.loads(in_path.read_text(encoding="utf-8"))
    posts, updated = remediate_posts(posts, args.target_word_count, args.max_posts)
    out_path.write_text(json.dumps(posts, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Remediated posts written: {updated}")
    print(f"Output: {out_path}")


if __name__ == "__main__":
    main()
