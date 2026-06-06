interface ParsedFeedItem {
  id?: string;
  title: string;
  summary: string;
  link?: string;
  updatedAt?: string;
}

export async function fetchXmlFeed(url: string, signal?: AbortSignal): Promise<ParsedFeedItem[]> {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
      "User-Agent": "EmergencyTradesmen/1.0 (live-alerts)",
    },
  });

  if (!response.ok) {
    throw new Error(`Feed returned ${response.status}`);
  }

  const xml = await response.text();
  const rssItems = extractBlocks(xml, "item").map((block) => ({
    id: decodeXml(extractTag(block, "guid") || extractTag(block, "link") || extractTag(block, "title")),
    title: decodeXml(extractTag(block, "title")),
    summary: cleanupText(decodeXml(extractTag(block, "description"))),
    link: decodeXml(extractTag(block, "link")),
    updatedAt: decodeXml(extractTag(block, "pubDate") || extractTag(block, "updated") || extractTag(block, "dc:date")),
  }));

  if (rssItems.length > 0) return rssItems.filter((item) => item.title);

  return extractBlocks(xml, "entry")
    .map((block) => ({
      id: decodeXml(extractTag(block, "id") || extractTag(block, "title")),
      title: decodeXml(extractTag(block, "title")),
      summary: cleanupText(decodeXml(extractTag(block, "summary") || extractTag(block, "content"))),
      link: decodeXml(extractAtomLink(block)),
      updatedAt: decodeXml(extractTag(block, "updated") || extractTag(block, "published")),
    }))
    .filter((item) => item.title);
}

function extractBlocks(xml: string, tag: string) {
  const expression = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
  return [...xml.matchAll(expression)].map((match) => match[1]);
}

function extractTag(block: string, tag: string) {
  const expression = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  return block.match(expression)?.[1]?.trim() || "";
}

function extractAtomLink(block: string) {
  return block.match(/<link[^>]+rel=["']alternate["'][^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || block.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/i)?.[1]
    || "";
}

export function cleanupText(value: string) {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeXml(value?: string) {
  if (!value) return "";
  return cleanupText(
    value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  );
}

