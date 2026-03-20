import unittest
from pathlib import Path
import tempfile

from audit_blog_corpus import (
    apply_common_image_fixes,
    audit_post,
    detect_region,
    extract_domain,
)


class AuditBlogCorpusTests(unittest.TestCase):
    def test_detect_region_from_slug(self):
        self.assertEqual(detect_region("foo-us", ""), "US")
        self.assertEqual(detect_region("foo-uk", ""), "UK")

    def test_detect_region_from_terms(self):
        self.assertEqual(detect_region("foo", "NEC and NFPA guidance for contractor permits"), "US")
        self.assertEqual(detect_region("foo", "Gas Safe and NICEIC advice for tradesmen"), "UK")

    def test_domain_extraction(self):
        self.assertEqual(extract_domain("https://emergencycontractors.net/blog/x"), "emergencycontractors.net")
        self.assertEqual(extract_domain("not a url"), "")

    def test_audit_post_domain_mismatch_and_priority(self):
        post = {
            "slug": "emergency-plumbing-us",
            "title": "Emergency Plumbing Costs",
            "content": "## A\nshort body\n## B\n[text](/blog/one)",
            "excerpt": "quick help",
            "url": "https://emergencytradesmen.net/blog/emergency-plumbing-us",
            "published_at": "2026-01-01T00:00:00Z",
        }
        result = audit_post(post, min_word_count=50)
        self.assertEqual(result.region_intent, "US")
        self.assertTrue(any("CRITICAL: domain mismatch" in issue for issue in result.issues))
        self.assertGreaterEqual(result.priority_score, 100)

    def test_image_issue_detection_and_autofix(self):
        with tempfile.TemporaryDirectory() as tmp:
            public = Path(tmp)
            (public / "blog" / "ok").mkdir(parents=True, exist_ok=True)
            (public / "blog" / "ok" / "exists.webp").write_text("x", encoding="utf-8")

            post = {
                "slug": "image-post-uk",
                "title": "Image Health Check",
                "content": (
                    "## A\n"
                    "![Good](/blog/ok/exists.webp)\n"
                    "![Typo](/blog/ok/needsfix.wehp)\n"
                    "![Missing](/blog/ok/missing.webp)\n"
                    "## B\n"
                ),
                "excerpt": "img audit",
            }

            result = audit_post(post, min_word_count=10, public_dir=public)
            self.assertEqual(result.image_count, 3)
            self.assertTrue(any(".wehp" in issue for issue in result.image_issues))
            self.assertTrue(any("broken local image path" in issue for issue in result.image_issues))

            fixed, changed = apply_common_image_fixes(post["content"])
            self.assertEqual(changed, 1)
            self.assertIn(".webp", fixed)


if __name__ == "__main__":
    unittest.main()
