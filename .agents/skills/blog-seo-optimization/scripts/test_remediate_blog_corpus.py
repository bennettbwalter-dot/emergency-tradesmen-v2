import unittest

from remediate_blog_corpus import build_rewrite, remediate_posts


class RemediateBlogCorpusTests(unittest.TestCase):
    def test_build_rewrite_includes_keyword_and_faq(self):
        content = "Short emergency guidance."
        rewritten = build_rewrite(content, "Emergency Boiler Pressure Dropping", "boiler-pressure-dropping-filling-loop-gb")
        self.assertIn("quick answer", rewritten.lower())
        self.assertIn("faq", rewritten.lower())
        self.assertIn("/emergency-gas-engineer", rewritten)

    def test_remediate_posts_updates_short_posts(self):
        posts = [
            {
                "id": "1",
                "title": "Test Post",
                "slug": "test-post-gb",
                "content": "tiny content",
                "published_at": "2026-01-01T00:00:00+00:00",
            }
        ]
        updated_posts, count = remediate_posts(posts, target_word_count=100, max_posts=1)
        self.assertEqual(count, 1)
        self.assertGreater(len(updated_posts[0]["content"]), len("tiny content"))


if __name__ == "__main__":
    unittest.main()
