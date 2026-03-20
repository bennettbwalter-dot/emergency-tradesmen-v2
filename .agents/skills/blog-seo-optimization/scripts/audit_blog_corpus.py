#!/usr/bin/env python3
"""Audit blog corpus for SEO, localization, and domain compliance issues.

Input: JSON array of posts with at least: title, slug, content, excerpt, published_at/created_at.
Output: JSON report + CSV row-level audit.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from datetime import datetime
from dataclasses import dataclass, asdict
from urllib.parse import urlparse
from pathlib import Path
from typing import Any

WORD_RE = re.compile(r"[A-Za-z0-9']+")
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")
IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)]+)\)")
H2_RE = re.compile(r"^##\s+", re.MULTILINE)
H3_RE = re.compile(r"^###\s+", re.MULTILINE)

US_HINTS = {
    "nec", "nfpa", "zip code", "color", "optimize", "furnace", "state licensing", "epa section 608", "contractor"
}
UK_HINTS = {
    "gas safe", "niceic", "part p", "postcode", "colour", "optimise", "boiler", "tradesman", "tradesmen"
}


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").strip().lower())


def tokenize(text: str) -> list[str]:
    return [w.lower() for w in WORD_RE.findall(text or "")]


def detect_region(slug: str, text: str) -> str:
    s = slug.lower()
    t = normalize(text)
    if s.endswith("-us") or s.endswith("-usa") or "-us-" in s or "-usa-" in s:
        return "US"
    if s.endswith("-uk") or s.endswith("-gb") or "-uk-" in s or "-gb-" in s:
        return "UK"

    us_hits = sum(1 for h in US_HINTS if h in t)
    uk_hits = sum(1 for h in UK_HINTS if h in t)
    if us_hits > uk_hits and us_hits >= 2:
        return "US"
    if uk_hits > us_hits and uk_hits >= 2:
        return "UK"
    return "GLOBAL"


@dataclass
class PostAudit:
    slug: str
    title: str
    region_intent: str
    expected_domain: str
    word_count: int
    h2_count: int
    h3_count: int
    internal_links: int
    external_links: int
    publish_date: str
    issues: list[str]
    severity: str
    candidate_primary_keyword: str
    priority_score: int
    image_issues: list[str]
    image_count: int


def extract_candidate_primary_keyword(title: str) -> str:
    words = [w for w in tokenize(title) if len(w) > 2]
    return " ".join(words[:4])


def severity_for(issues: list[str]) -> str:
    if not issues:
        return "pass"
    if any(i.startswith("CRITICAL") for i in issues):
        return "critical"
    if any(i.startswith("HIGH") for i in issues):
        return "high"
    if any(i.startswith("MEDIUM") for i in issues):
        return "medium"
    return "low"


def extract_domain(url: str) -> str:
    if not url:
        return ""
    try:
        return (urlparse(url).hostname or "").lower()
    except Exception:
        return ""


def parse_iso_date(value: str) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def resolve_public_asset(path_or_url: str, public_dir: Path) -> Path | None:
    if not path_or_url.startswith("/"):
        return None
    clean = path_or_url.split("?", 1)[0].split("#", 1)[0]
    return public_dir / clean.lstrip("/")


def find_image_issues(content: str, public_dir: Path) -> tuple[list[str], int]:
    images = IMAGE_RE.findall(content or "")
    issues: list[str] = []
    for img in images:
        if ".wehp" in img.lower():
            issues.append(f"HIGH: image extension typo (.wehp) in {img}")
        p = resolve_public_asset(img, public_dir)
        if p and not p.exists():
            # Try common typo fix for suggestions
            alt = Path(str(p).replace(".wehp", ".webp"))
            if ".wehp" in str(p).lower() and alt.exists():
                issues.append(f"HIGH: broken image path {img} (suggest replace .wehp -> .webp)")
            else:
                issues.append(f"HIGH: broken local image path {img}")
    return issues, len(images)


def collect_broken_images_for_post(slug: str, content: str, public_dir: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for img in IMAGE_RE.findall(content or ""):
        p = resolve_public_asset(img, public_dir)
        if not p:
            continue
        if p.exists():
            continue
        suggestion = ""
        issue = "missing_local_asset"
        if ".wehp" in img.lower():
            alt_path = str(img).replace(".wehp", ".webp")
            alt_disk = resolve_public_asset(alt_path, public_dir)
            if alt_disk and alt_disk.exists():
                suggestion = alt_path
                issue = "extension_typo_wehp"
        rows.append(
            {
                "slug": slug,
                "image_path": img,
                "issue": issue,
                "suggested_path": suggestion,
            }
        )
    return rows


def apply_common_image_fixes(content: str) -> tuple[str, int]:
    if not content:
        return content, 0
    fixed = re.sub(r"\.wehp(\)|\?)", r".webp\1", content, flags=re.IGNORECASE)
    if fixed == content:
        return content, 0
    changes = 1
    return fixed, changes


def audit_post(post: dict[str, Any], min_word_count: int = 700, public_dir: Path | None = None) -> PostAudit:
    slug = str(post.get("slug") or "")
    title = str(post.get("title") or "")
    content = str(post.get("content") or "")
    excerpt = str(post.get("excerpt") or "")
    text = f"{title}\n{excerpt}\n{content}"
    lower = normalize(text)

    region_intent = detect_region(slug, text)
    expected_domain = (
        "https://emergencycontractors.net" if region_intent == "US" else "https://emergencytradesmen.net"
    )
    expected_host = extract_domain(expected_domain)

    words = tokenize(text)
    word_count = len(words)
    h2_count = len(H2_RE.findall(content))
    h3_count = len(H3_RE.findall(content))

    link_targets = LINK_RE.findall(content)
    internal_links = sum(1 for l in link_targets if l.startswith("/") or "emergencytradesmen.net" in l or "emergencycontractors.net" in l)
    external_links = len(link_targets) - internal_links

    issues: list[str] = []
    image_issues: list[str] = []

    if word_count < min_word_count:
        issues.append(f"HIGH: thin content (<{min_word_count} words)")
    if h2_count < 2:
        issues.append("HIGH: weak heading structure (needs >=2 H2)")
    if internal_links < 2:
        issues.append("MEDIUM: insufficient internal linking (<2)")
    if external_links == 0:
        issues.append("LOW: missing external authority references")

    title_tokens = [w for w in tokenize(title) if len(w) > 3]
    intro = normalize(content[:260])
    overlap = sum(1 for w in title_tokens if w in intro)
    if title_tokens and overlap < max(1, len(title_tokens) // 3):
        issues.append("MEDIUM: primary keyword likely absent from intro")

    # localization consistency checks
    us_only_terms = ["zip code", "furnace", "nec", "nfpa", "color", "optimize"]
    uk_only_terms = ["postcode", "boiler", "gas safe", "niceic", "colour", "optimise"]
    if region_intent == "US" and any(t in lower for t in uk_only_terms):
        issues.append("HIGH: US post contains UK-localized terminology/regulations")
    if region_intent == "UK" and any(t in lower for t in us_only_terms):
        issues.append("HIGH: UK post contains US-localized terminology/regulations")

    if public_dir is not None:
        image_issues, image_count = find_image_issues(content, public_dir)
        issues.extend(image_issues)
    else:
        image_count = len(IMAGE_RE.findall(content))

    actual_host = extract_domain(str(post.get("url") or post.get("canonical_url") or ""))
    if actual_host and expected_host and actual_host != expected_host:
        issues.append(f"CRITICAL: domain mismatch ({actual_host} should be {expected_host})")

    publish_date = str(post.get("published_at") or post.get("created_at") or "")
    priority_score = sum(
        100 if i.startswith("CRITICAL")
        else 40 if i.startswith("HIGH")
        else 15 if i.startswith("MEDIUM")
        else 5
        for i in issues
    )

    return PostAudit(
        slug=slug,
        title=title,
        region_intent=region_intent,
        expected_domain=expected_domain,
        word_count=word_count,
        h2_count=h2_count,
        h3_count=h3_count,
        internal_links=internal_links,
        external_links=external_links,
        publish_date=publish_date,
        issues=issues,
        severity=severity_for(issues),
        candidate_primary_keyword=extract_candidate_primary_keyword(title),
        priority_score=priority_score,
        image_issues=image_issues,
        image_count=image_count,
    )


def duplicate_clusters(audits: list[PostAudit]) -> dict[str, list[str]]:
    buckets: dict[str, list[str]] = {}
    for a in audits:
        tokens = [w for w in tokenize(a.title) if len(w) > 3]
        signature = " ".join(tokens[:3]) if tokens else a.slug
        buckets.setdefault(signature, []).append(a.slug)
    return {k: v for k, v in buckets.items() if len(v) > 1}


def write_csv(path: Path, audits: list[PostAudit]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "slug", "title", "region_intent", "expected_domain", "word_count", "h2_count", "h3_count",
            "internal_links", "external_links", "image_count", "publish_date", "severity", "priority_score", "candidate_primary_keyword", "issues"
        ])
        for a in audits:
            writer.writerow([
                a.slug, a.title, a.region_intent, a.expected_domain, a.word_count, a.h2_count, a.h3_count,
                a.internal_links, a.external_links, a.image_count, a.publish_date, a.severity, a.priority_score, a.candidate_primary_keyword,
                " | ".join(a.issues),
            ])


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit all blog posts for SEO/localization quality.")
    parser.add_argument("--input", required=True, help="Path to JSON array of blog posts")
    parser.add_argument("--out-json", default="blog-seo-audit-report.json", help="Output JSON report path")
    parser.add_argument("--out-csv", default="blog-seo-audit-report.csv", help="Output CSV report path")
    parser.add_argument("--min-word-count", default=700, type=int, help="Minimum recommended word count")
    parser.add_argument("--public-dir", default="public", help="Public assets directory for local image checks")
    parser.add_argument("--autofix-output", default="", help="Write auto-fixed JSON to this path (fixes .wehp -> .webp)")
    parser.add_argument("--out-broken-images-csv", default="", help="Optional CSV path listing broken image refs per slug")
    args = parser.parse_args()

    posts = json.loads(Path(args.input).read_text(encoding="utf-8"))
    if not isinstance(posts, list):
        raise ValueError("Input must be a JSON array of posts")

    public_dir = Path(args.public_dir)
    audits = [audit_post(p, min_word_count=args.min_word_count, public_dir=public_dir) for p in posts]
    dupes = duplicate_clusters(audits)

    by_severity = Counter(a.severity for a in audits)
    by_region = Counter(a.region_intent for a in audits)

    report = {
        "summary": {
            "total_posts": len(audits),
            "severity_counts": dict(by_severity),
            "region_counts": dict(by_region),
            "duplicate_clusters": dupes,
            "top_priority_slugs": [
                {"slug": a.slug, "priority_score": a.priority_score, "severity": a.severity}
                for a in sorted(audits, key=lambda x: x.priority_score, reverse=True)[:10]
            ],
            "date_order_issues": [],
            "posts_with_image_issues": sum(1 for a in audits if a.image_issues),
            "total_images_found": sum(a.image_count for a in audits),
        },
        "posts": [asdict(a) for a in audits],
    }

    # chronological consistency check (using published_at/created_at where available)
    dated = [(a.slug, parse_iso_date(a.publish_date), a.publish_date) for a in audits]
    dated = [row for row in dated if row[1] is not None]
    for (slug_prev, dt_prev, raw_prev), (slug_curr, dt_curr, raw_curr) in zip(dated, dated[1:]):
        if dt_prev and dt_curr and dt_prev < dt_curr:
            report["summary"]["date_order_issues"].append(
                {
                    "previous_slug": slug_prev,
                    "previous_date": raw_prev,
                    "next_slug": slug_curr,
                    "next_date": raw_curr,
                    "issue": "List may be out of descending chronological order",
                }
            )

    Path(args.out_json).write_text(json.dumps(report, indent=2), encoding="utf-8")
    write_csv(Path(args.out_csv), audits)

    if args.out_broken_images_csv:
        rows: list[dict[str, str]] = []
        for post in posts:
            rows.extend(
                collect_broken_images_for_post(
                    slug=str(post.get("slug") or ""),
                    content=str(post.get("content") or ""),
                    public_dir=public_dir,
                )
            )
        out_path = Path(args.out_broken_images_csv)
        with out_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=["slug", "image_path", "issue", "suggested_path"])
            writer.writeheader()
            writer.writerows(rows)
        print(f"Broken images CSV: {args.out_broken_images_csv} (rows: {len(rows)})")

    if args.autofix_output:
        fixed_posts = []
        total_fixes = 0
        for post in posts:
            clone = dict(post)
            content = str(clone.get("content") or "")
            fixed_content, n = apply_common_image_fixes(content)
            clone["content"] = fixed_content
            total_fixes += n
            fixed_posts.append(clone)
        Path(args.autofix_output).write_text(json.dumps(fixed_posts, indent=2), encoding="utf-8")
        print(f"Auto-fix output: {args.autofix_output} (updated posts: {total_fixes})")

    print(f"Audited {len(audits)} posts")
    print(f"JSON report: {args.out_json}")
    print(f"CSV report: {args.out_csv}")


if __name__ == "__main__":
    main()
