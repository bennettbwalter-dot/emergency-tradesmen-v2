import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/lib/sanitize";
import { isUSDomain } from "@/lib/siteConfig";
import { AffiliateDisclosure } from "@/components/AffiliateDisclosure";
import { useParams, Link } from "react-router-dom";
import { format, isValid } from "date-fns";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/AdSlot";
import { ArrowLeft, Clock, Calendar, User, ChevronRight, AlertTriangle, Sun, Moon, Phone, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  published_at: string;
  created_at: string;
  updated_at?: string;
}

function safeUnescape(str: string): string {
  if (!str || typeof str !== 'string') return "";
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function safeFormatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "March 2026";
  const d = new Date(dateStr);
  if (!isValid(d)) return "March 2026";
  return format(d, 'MMMM d, yyyy');
}

function getImageUrl(path: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  let normalized = path.startsWith('/') ? path : `/${path}`;
  // Prefer WebP over PNG/SVG for much smaller file sizes (critical for mobile)
  if (/\.(png|svg)$/i.test(normalized)) {
    normalized = normalized.replace(/\.(png|svg)$/i, '.webp');
  }
  return normalized;
}

function calcReadingTime(content: string): number {
  const wordCount = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

interface AmazonProduct {
  image: string;
  title: string;
  description: string;
  url: string;
}

const AMAZON_PRODUCTS: Record<string, AmazonProduct> = {
  'portable-power-stations-backup-gb': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl'
  },
  'smart-leak-detection-gb': {
    image: '/images/blog/generated/xsense-leak-detector.png',
    title: 'X-Sense Smart Leak Detector',
    description: 'Real-time water leak detection with app alerts. Protect your home from costly water damage.',
    url: 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?linkCode=ll2&tag=et0a8-21&linkId=59e2f49a85a9ef7241ad48de13eb4450&ref_=as_li_ss_tl'
  },
  'smart-leak-detection-2026-gb': {
    image: '/images/blog/generated/xsense-leak-detector.png',
    title: 'X-Sense Smart Leak Detector',
    description: 'Real-time water leak detection with app alerts. Protect your home from costly water damage.',
    url: 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?linkCode=ll2&tag=et0a8-21&linkId=59e2f49a85a9ef7241ad48de13eb4450&ref_=as_li_ss_tl'
  },
  'carbon-monoxide-gb': {
    image: '/images/blog/generated/smart-water-sensor.png',
    title: 'Smart CO & Smoke Detector',
    description: 'Protect your family from carbon monoxide and smoke with smart detection alerts.',
    url: 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?linkCode=ll2&tag=et0a8-21&linkId=719133608c5932412e2e1e7586a679f6&ref_=as_li_ss_tl'
  },
  'refrigerant-leak-safety-gb': {
    image: '/images/blog/generated/costway-ac.png',
    title: 'COSTWAY Portable Air Conditioner',
    description: 'Keep cool during heatwaves. Portable AC with dehumidifier function for home comfort.',
    url: 'https://www.amazon.co.uk/COSTWAY-Portable-Conditioner-Dehumidifier-Automatic/dp/B0D2W516B5?linkCode=ll2&tag=et0a8-21&linkId=6196e1b84afed702131bb76d77875625&ref_=as_li_ss_tl'
  },
  'emergency-drain-cleaning-gb': {
    image: '/images/blog/generated/drain-cleaning.png',
    title: 'PLUMBERSHARK Plumbing Tool Keyring',
    description: 'Essential plumbing tool for quick fixes. Multi-tool for common pipe and drain emergencies.',
    url: 'https://www.amazon.co.uk/PLUMBSHARK-Plumbing-Heating-Keyring-Multitool/dp/B0C9Y6S4V6?linkCode=ll2&tag=et0a8-21&linkId=0648590de956f1939cac94ea26bb9f94&ref_=as_li_ss_tl'
  },
  'emergency-pest-control-gb': {
    image: '/images/blog/generated/pest-control.png',
    title: 'Smart Home Security System',
    description: 'Monitor and protect your home 24/7 with smart security and entry detection.',
    url: 'https://www.amazon.co.uk/dp/B0CRB9QP1T?linkCode=ll2&tag=et0a8-21&linkId=d8fae4654b45091258990f733c782256&ref_=as_li_ss_tl'
  },
  'portable-power-stations-emergency-backup-us': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl'
  },
  'smart-leak-detection-us': {
    image: '/images/blog/generated/smart-water-sensor.png',
    title: 'Smart Water Sensor',
    description: 'WiFi water leak detector with real-time alerts. Prevent costly water damage emergencies.',
    url: 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl'
  },
  'plug-in-solar-gb': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl'
  },
  'plug-in-solar-us': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl'
  },
  'emergency-ev-charger-repair-gb': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0BZZ47J4T?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl'
  },
  'emergency-ev-charger-repair-us': {
    image: '/images/blog/generated/bluetti-power-station.png',
    title: 'BLUETTI Portable Power Station',
    description: 'Emergency backup power for home outages. Portable camping battery with multiple outlets.',
    url: 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl'
  },
};

// ---------------------------------------------------------------------------
// Inline styles for the SEO template  -  injected once per page
// ---------------------------------------------------------------------------
const BLOG_STYLES = `
  /* ── TYPOGRAPHY SYSTEM ─────────────────────────── */
  .blog-body {
    font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
    color: #1f2937;
    line-height: 1.8;
    max-width: 760px;
    width: 100%;
    margin: 0 auto;
    padding: 0 1.25rem;
    box-sizing: border-box;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;
    overflow-x: hidden;
  }
  .blog-body.dark { color: #e5e7eb; }

  /* ── H1 ─────────────────────────────────────────── */
  .blog-h1 { font-size: clamp(1.75rem, 5vw, 3.25rem); font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }

  /* ── H2 NUMBERED + ORANGE ACCENT ────────────────── */
  .blog-body h2 {
    font-size: clamp(1.35rem, 3vw, 1.75rem); font-weight: 800;
    color: #1f2937; margin: 3.5rem 0 1.5rem;
    padding-left: 1.1rem; border-left: 5px solid #e8923a;
    line-height: 1.35;
    overflow-wrap: break-word;
  }
  .dark .blog-body h2 { color: #f3f4f6; }

  /* ── H3 (FAQ + subpoints) ───────────────────────── */
  .blog-body h3 {
    font-size: 1.15rem; font-weight: 700; color: #e8923a;
    margin: 2.5rem 0 1rem;
    line-height: 1.4;
    overflow-wrap: break-word;
  }

  /* ── PARAGRAPHS ─────────────────────────────────── */
  .blog-body p { margin-bottom: 1.75rem; font-size: 1.0625rem; line-height: 1.8; overflow-wrap: break-word; }

  /* ── LISTS ──────────────────────────────────────── */
  .blog-body ul { list-style: disc; padding-left: 1.75rem; margin-bottom: 1.75rem; }
  .blog-body ol { list-style: decimal; padding-left: 1.75rem; margin-bottom: 1.75rem; }
  .blog-body li { margin-bottom: 0.65rem; line-height: 1.75; overflow-wrap: break-word; }

  /* ── STRONG ─────────────────────────────────────── */
  .blog-body strong { color: #111827; font-weight: 700; }
  .dark .blog-body strong { color: #f9fafb; }

  /* ── LINKS ──────────────────────────────────────── */
  .blog-body a { color: #e8923a; text-decoration: underline; text-underline-offset: 3px; }
  .blog-body a:hover { color: #c97a2b; }

  /* ── BLOCKQUOTE → PULL QUOTE ────────────────────── */
  .blog-body blockquote {
    border-left: 5px solid #e8923a; background: #fff8f3;
    border-radius: 0 12px 12px 0; padding: 1.25rem 1.75rem;
    margin: 2.5rem 0; color: #7c3d0f; font-style: normal;
    font-weight: 600; font-size: 1.05rem; line-height: 1.7;
  }
  .dark .blog-body blockquote { background: rgba(232,146,58,0.08); color: #fed7aa; }

  /* ── IMAGES ─────────────────────────────────────── */
  .blog-body img {
    border-radius: 14px; max-width: 100%; width: 100%; height: auto; margin: 1rem auto;
    display: block; box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    object-fit: cover;
  }
  .blog-body figure { text-align: center; margin: 1rem 0; width: 100% !important; }
  .blog-body figcaption { font-size: 0.75rem; color: #6b7280; margin-top: 0.5rem; font-style: italic; padding: 0 0.5rem; }

  @media (max-width: 640px) {
    .blog-body img {
      margin: 0.75rem 0;
      border-radius: 10px;
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
    }
    .blog-body figure {
      width: 100% !important;
      max-width: 100% !important;
    }
  }

  /* ── TOC BOX ────────────────────────────────────── */
  .blog-body .toc-box, .blog-body [id="in-this-article"] {
    background: #fff8f3 !important; border: 1.5px solid #e8923a !important;
    border-radius: 14px !important; padding: 1.5rem 2rem !important;
    margin: 2rem 0 2.5rem !important;
  }
  .dark .blog-body .toc-box, .dark .blog-body [id="in-this-article"] {
    background: rgba(232,146,58,0.07) !important;
  }
  .blog-body .toc-box p, .blog-body .toc-box strong { color: #b45309 !important; font-weight: 800; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .blog-body .toc-box ul { list-style: none; padding: 0; margin: 0.75rem 0 0; }
  .blog-body .toc-box li { margin-bottom: 0.4rem; }
  .blog-body .toc-box a { color: #1f2937 !important; font-size: 0.95rem; font-weight: 500; }
  .dark .blog-body .toc-box a { color: #e5e7eb !important; }
  .blog-body .toc-box a:hover { color: #e8923a !important; }

  /* ── AUTHOR BIO ─────────────────────────────────── */
  .blog-body .author-bio {
    border: 1.5px solid #e5e7eb !important; border-radius: 12px !important;
    padding: 1.25rem 1.75rem !important; margin: 2.5rem 0 !important;
    background: #f9fafb !important; display: flex; align-items: flex-start; gap: 1rem;
  }
  .dark .blog-body .author-bio { background: #1f2937 !important; border-color: #374151 !important; }
  .blog-body .author-bio strong { color: #111827 !important; font-size: 0.95rem; }
  .dark .blog-body .author-bio strong { color: #f3f4f6 !important; }
  .blog-body .author-bio p { font-size: 0.9rem; color: #4b5563; margin: 0; line-height: 1.6; }
  .dark .blog-body .author-bio p { color: #9ca3af; }

  /* ── FAQ SECTION ────────────────────────────────── */
  .blog-body h2:has(+ h3) { border-left-color: #e8923a; }

  /* ── CALLOUT TIP BOX (class="callout" or "tip-box") */
  .blog-body .callout, .blog-body .fun-fact, .blog-body .expert-tip {
    background: #fff8f3; border-left: 4px solid #e8923a;
    border-radius: 10px; padding: 1.25rem 1.75rem; margin: 2.5rem 0;
    display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;
  }
  .dark .blog-body .callout, .dark .blog-body .fun-fact { background: rgba(232,146,58,0.1); }

  /* ── AMAZON PRODUCT SECTION ───────────────────────────── */
  .blog-body .amazon-product-section { 
    margin: 3rem 0 !important; 
    padding: 0 !important;
  }
  .blog-body .product-box {
    display: flex !important; 
    flex-direction: column !important; 
    align-items: center !important;
    background: linear-gradient(145deg, #fff8f3 0%, #fff 100%) !important; 
    border: 2px solid #e8923a !important;
    border-radius: 20px !important; 
    padding: 2.5rem 2rem !important; 
    margin: 2rem auto !important; 
    max-width: 500px !important; 
    box-shadow: 0 12px 40px rgba(232,146,58,0.12) !important;
    transition: transform 0.3s ease, box-shadow 0.3s ease !important;
  }
  .blog-body .product-box:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 16px 48px rgba(232,146,58,0.18) !important;
  }
  .dark .blog-body .product-box { 
    background: linear-gradient(145deg, #1f2937 0%, #111827 100%) !important; 
    border-color: #e8923a !important; 
  }
  .blog-body .product-image-wrapper {
    margin-bottom: 1.5rem !important; 
    text-align: center !important;
    width: 100% !important;
  }
  .blog-body .product-box .product-image {
    width: 100% !important; 
    max-width: 280px !important;
    height: auto !important;
    aspect-ratio: 1/1 !important;
    object-fit: contain !important;
    border-radius: 16px !important; 
    background: #fff !important; 
    box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important;
  }
  .dark .blog-body .product-box .product-image {
    background: #111827 !important;
  }

  @media (max-width: 640px) {
    .blog-body .product-box .product-image {
      max-width: 100% !important;
      width: 100% !important;
    }
  }
  .blog-body .product-box .product-info { 
    text-align: center !important; 
    width: 100% !important; 
  }
  .blog-body .product-box .product-info h3 {
    font-size: 1.35rem !important; 
    font-weight: 800 !important; 
    color: #1f2937 !important;
    margin: 0 0 0.75rem !important;
    line-height: 1.3 !important;
  }
  .dark .blog-body .product-box .product-info h3 { 
    color: #f9fafb !important; 
  }
  .blog-body .product-box .product-info p {
    font-size: 1rem !important; 
    color: #6b7280 !important; 
    margin: 0 0 1.5rem !important; 
    line-height: 1.6 !important;
  }
  .dark .blog-body .product-box .product-info p { 
    color: #9ca3af !important; 
  }
  .blog-body .amazon-button {
    display: inline-block !important; 
    width: 100% !important; 
    padding: 1rem 2rem !important;
    background: linear-gradient(135deg, #e8923a 0%, #c97a2b 100%) !important; 
    color: #fff !important; 
    font-weight: 700 !important; 
    font-size: 1.1rem !important;
    border-radius: 14px !important; 
    text-decoration: none !important; 
    text-align: center !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 4px 16px rgba(232,146,58,0.35) !important;
    border: none !important;
    letter-spacing: 0.02em !important;
  }
  .blog-body .amazon-button:hover { 
    background: linear-gradient(135deg, #c97a2b 0%, #a86820 100%) !important; 
    color: #fff !important; 
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(232,146,58,0.45) !important;
  }
  .blog-body .amazon-button:active {
    transform: translateY(0) !important;
  }

  /* ── AMAZON INFOGRAPHIC IMAGES ──────────────────────── */
  .blog-body #amazon-infographic-fix {
    width: 100% !important; 
    height: auto !important; 
    max-width: 100% !important; 
    display: block !important; 
    border-radius: 16px !important; 
    margin: 2rem auto !important; 
    padding: 0 !important; 
    box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; 
    border: none !important; 
    overflow: visible !important; 
    aspect-ratio: auto !important; 
    object-fit: contain !important;
  }

  /* ── AMAZON PRODUCT HEADER ──────────────────────────── */
  .blog-body .amazon-product-section h3 {
    font-size: clamp(1.5rem, 4vw, 2rem) !important;
    font-weight: 800 !important;
    color: #1f2937 !important;
    margin: 0 0 1rem !important;
    line-height: 1.2 !important;
    letter-spacing: -0.02em !important;
  }
  .dark .blog-body .amazon-product-section h3 {
    color: #f9fafb !important;
  }

  /* ── AMAZON PRODUCT GRID ────────────────────────────── */
  .blog-body .amazon-product-section .feature-grid,
  .blog-body .amazon-product-section div[style*="grid"] {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
    gap: 1rem !important;
    margin: 1.5rem 0 !important;
    padding: 0 !important;
  }

  @media (max-width: 640px) {
    .blog-body .amazon-product-section .feature-grid,
    .blog-body .amazon-product-section div[style*="grid"] {
      grid-template-columns: 1fr !important;
      gap: 1rem !important;
    }
  }

  /* ── HIDE RAW URLs ──────────────────────────────────── */
  .blog-body a[href*="amazon"] {
    text-decoration: none !important;
  }
  .blog-body a[href*="amazon"] span,
  .blog-body a[href*="amazon"] p {
    display: none !important;
  }
  /* Force product images visible */
  .blog-body img.product-image {
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    width: 280px !important;
    height: 280px !important;
  }

  /* ── FUNKY MAGAZINE LAYOUT SYSTEM ─────────────────── */
  .blog-magazine-wrap { font-family: 'DM Sans', 'Inter', system-ui, sans-serif; color: #1f2937; line-height: 1.75; }
  .dark .blog-magazine-wrap { color: #e5e7eb; }

  .blog-step-card {
    border: 1.5px solid #e5e7eb;
    border-radius: 16px;
    padding: 1.75rem 2rem;
    margin: 2rem 0;
    background: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .dark .blog-step-card { background: #111827; border-color: #374151; box-shadow: none; }

  .blog-step-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .blog-step-number {
    display: inline-block;
    background: #e8923a;
    color: #fff;
    font-weight: 800;
    font-size: 0.78rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    padding: 0.3rem 0.85rem;
    border-radius: 999px;
    white-space: nowrap;
  }
  .blog-step-header h2 {
    font-size: 1.2rem !important;
    font-weight: 800 !important;
    color: #111827 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
  }
  .dark .blog-step-header h2 { color: #f9fafb !important; }

  .blog-step-body p { margin-bottom: 0.85rem; }
  .blog-step-body ul, .blog-step-body ol { padding-left: 1.5rem; margin-bottom: 0.85rem; }
  .blog-step-body li { margin-bottom: 0.4rem; }

  .blog-tips-block {
    border-left: 5px solid #e8923a;
    background: #fff8f3;
    border-radius: 0 14px 14px 0;
    padding: 1.5rem 1.75rem;
    margin: 2.5rem 0;
  }
  .dark .blog-tips-block { background: rgba(232, 146, 58, 0.08); }
  .blog-tips-block h2 {
    font-size: 1.15rem !important;
    font-weight: 800 !important;
    color: #c97a2b !important;
    margin: 0 0 1rem !important;
    padding: 0 !important;
    border: none !important;
  }
  .blog-tips-block ul { padding-left: 1.5rem; margin: 0; }
  .blog-tips-block li { margin-bottom: 0.5rem; }

  .blog-when-block {
    border-left: 5px solid #ef4444;
    background: #fff5f5;
    border-radius: 0 14px 14px 0;
    padding: 1.5rem 1.75rem;
    margin: 2.5rem 0;
  }
  .dark .blog-when-block { background: rgba(239, 68, 68, 0.08); }
  .blog-when-block h2 {
    font-size: 1.15rem !important;
    font-weight: 800 !important;
    color: #b91c1c !important;
    margin: 0 0 1rem !important;
    padding: 0 !important;
    border: none !important;
  }
  .blog-when-block ul { padding-left: 1.5rem; margin: 0; }
  .blog-when-block li { margin-bottom: 0.5rem; }

  .blog-qa-section { margin: 3rem 0; }
  .blog-qa-section > h2 {
    font-size: 1.35rem !important;
    font-weight: 800 !important;
    color: #1f2937 !important;
    margin: 0 0 1.5rem !important;
    padding-left: 1.1rem !important;
    border-left: 5px solid #e8923a !important;
  }
  .dark .blog-qa-section > h2 { color: #f3f4f6 !important; }

  .blog-qa-card {
    background: #f9fafb;
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
  }
  .dark .blog-qa-card { background: #1f2937; border-color: #374151; }

  .blog-qa-q {
    font-weight: 700;
    color: #e8923a;
    margin: 0 0 0.5rem !important;
    font-size: 0.975rem;
  }
  .blog-qa-card ul { padding-left: 1.5rem; margin: 0; }
  .blog-qa-card li { margin-bottom: 0.35rem; font-size: 0.9rem; color: #374151; }
  .dark .blog-qa-card li { color: #9ca3af; }

  .blog-fun-facts {
    background: linear-gradient(135deg, #fff8f3 0%, #fef3c7 100%);
    border: 1.5px solid #fbbf24;
    border-radius: 16px;
    padding: 1.75rem 2rem;
    margin: 3rem 0;
  }
  .dark .blog-fun-facts { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-color: #92400e; }
  .blog-fun-facts h2 {
    font-size: 1.15rem !important;
    font-weight: 800 !important;
    color: #92400e !important;
    margin: 0 0 1rem !important;
    padding: 0 !important;
    border: none !important;
  }
  .dark .blog-fun-facts h2 { color: #fcd34d !important; }
  .blog-fun-facts ul { padding-left: 1.5rem; margin: 0; }
  .blog-fun-facts li { margin-bottom: 0.6rem; color: #78350f; }
  .dark .blog-fun-facts li { color: #d1d5db; }

  .blog-cta-block {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    border-radius: 20px;
    padding: 2.5rem 2rem;
    margin: 3rem 0;
    text-align: center;
    color: #fff;
  }
  .blog-cta-block h2 {
    font-size: 1.5rem !important;
    font-weight: 800 !important;
    color: #fff !important;
    margin: 0 0 0.75rem !important;
    padding: 0 !important;
    border: none !important;
  }
  .blog-cta-block p { color: #d1d5db; margin-bottom: 1.5rem; }
  .blog-cta-btn {
    display: inline-block;
    background: linear-gradient(135deg, #e8923a 0%, #c97a2b 100%);
    color: #fff !important;
    font-weight: 800;
    font-size: 1rem;
    padding: 1rem 2.5rem;
    border-radius: 999px;
    text-decoration: none !important;
    letter-spacing: 0.03em;
    box-shadow: 0 4px 20px rgba(232,146,58,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .blog-cta-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(232,146,58,0.5);
    color: #fff !important;
  }

  .blog-intro { font-size: 1.1rem; line-height: 1.85; color: #374151; margin-bottom: 2rem; }
  .dark .blog-intro { color: #9ca3af; }
  .blog-divider { border: none; border-top: 1.5px solid #e5e7eb; margin: 2.5rem 0; }
  .dark .blog-divider { border-color: #374151; }

  /* ── COMPARISON GRID (GREEN/RED) ────────────────── */
  .blog-comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin: 2.5rem 0;
  }
  .blog-comp-col {
    border-radius: 16px;
    padding: 1.5rem;
    border: 1.5px solid #e5e7eb;
  }
  .blog-comp-col.green { background: #f0fdf4; border-color: #86efac; }
  .blog-comp-col.red { background: #fef2f2; border-color: #fecaca; }
  .dark .blog-comp-col.green { background: rgba(22, 163, 74, 0.05); border-color: #166534; }
  .dark .blog-comp-col.red { background: rgba(220, 38, 38, 0.05); border-color: #991b1b; }

  .blog-comp-header {
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .blog-comp-col.green .blog-comp-header { color: #166534; }
  .blog-comp-col.red .blog-comp-header { color: #991b1b; }
  .dark .blog-comp-col.green .blog-comp-header { color: #4ade80; }
  .dark .blog-comp-col.red .blog-comp-header { color: #f87171; }

  .blog-comp-list { list-style: none !important; padding: 0 !important; margin: 0 !important; }
  .blog-comp-list li {
    position: relative;
    padding-left: 1.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    font-weight: 500;
  }
  .blog-comp-list li::before {
    content: "✓";
    position: absolute;
    left: 0;
    font-weight: 900;
  }
  .blog-comp-col.green .blog-comp-list li::before { content: "✓"; color: #22c55e; }
  .blog-comp-col.red .blog-comp-list li::before { content: "✕"; color: #ef4444; }

  @media (max-width: 640px) {
    .blog-comparison-grid { grid-template-columns: 1fr; gap: 1rem; }
  }
`;

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWhiteMode, setIsWhiteMode] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) { setIsLoading(false); return; }
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('undefined') || supabaseKey.includes('undefined')) {
          console.error('[BlogPostPage] Supabase env vars are missing. Check .env.production or Cloudflare Pages environment variables.');
          setIsLoading(false);
          return;
        }

        const postUrl = `${supabaseUrl}/rest/v1/posts?select=*&slug=eq.${encodeURIComponent(slug)}`;
        const postResponse = await fetch(postUrl, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' }
        });
        const postData = await postResponse.json();

        if (postData && postData.length > 0) {
          const data = postData[0];
          setPost(data);
          const isUS = slug.toLowerCase().includes('usa') || slug.toLowerCase().includes('-us');
          const relatedUrl = `${supabaseUrl}/rest/v1/posts?select=id,title,slug,excerpt,cover_image,published_at,created_at&published=eq.true&order=published_at.desc`;
          const relatedResponse = await fetch(relatedUrl, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json', 'Prefer': 'count=exact', 'Range-Unit': 'items', 'Range': '0-9' }
          });
          const relatedData = (await relatedResponse.json()) as BlogPost[];
          if (relatedData) {
            let filtered = relatedData.filter((p: BlogPost) => {
              const s = p.slug?.toLowerCase() || "";
              const pIsUS = s.includes('usa') || s.includes('-us');
              const pIsUK = s.includes('-gb') || s.includes('-uk');
              return isUS ? (pIsUS || (!pIsUK)) : (pIsUK || (!pIsUS));
            });
            if (filtered.length === 0) filtered = relatedData;
            setRelatedPosts(filtered.slice(0, 3) as BlogPost[]);
          }
        }
      } catch (err) {
        console.error("Failed to load post:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-orange-500 mb-4">Post Not Found</h1>
        <Button asChild variant="outline"><Link to="/blog">← Back to Blog</Link></Button>
      </div>
    );
  }

  const rawContent = (post.content || "").trim();
  const unescaped = safeUnescape(rawContent);
  let displayContent = unescaped
    .replace(/<html[^>]*>|<\/html>|<body[^>]*>|<\/body>|<head[^>]*>[\s\S]*?<\/head>|<meta[^>]*>|<title[^>]*>[\s\S]*?<\/title>|<header[^>]*>[\s\S]*?<\/header>|<\/header>|<footer[^>]*>[\s\S]*?<\/footer>|<\/footer>/gi, '');

  // ── Clean up Amazon elements ─────────────────────────────────────────
  // Remove inline <style> blocks that define Amazon styling (we handle it globally)
  displayContent = displayContent.replace(/<style>[\s\S]*?#amazon-infographic-fix[\s\S]*?<\/style>/gi, '');
  displayContent = displayContent.replace(/<style>[\s\S]*?\.amazon-product-section[\s\S]*?<\/style>/gi, '');
  displayContent = displayContent.replace(/<style>\s*<\/style>/gi, '');

  // Convert inline-styled Amazon buttons to class-based (handles any attribute order)
  displayContent = displayContent.replace(
    /<a\s+href="(https:\/\/www\.amazon\.[^"]+)"\s+[^>]*style="[^"]*background-color:\s*#f0c14b[^"]*"[^>]*>([^<]+)<\/a>/gi,
    '<a href="$1" class="amazon-button" target="_blank" rel="noopener noreferrer">$2</a>'
  );

  // Fix mangled Amazon buttons where the <a href="..." part got truncated
  // Pattern: leftover style fragment like 'y: inline-block; background-color: #f0c14b;...' followed by ">Buy on Amazon →</a>"
  const amazonLinks: Record<string, string> = {
    'aranet-radon': 'https://www.amazon.com/Aranet-Radon-Detector-Home-Ink/dp/B0DK3CRP79?linkCode=ll2&tag=emergencytrad-20&linkId=5db248b5c277b8e78e79ba9b615ca2d2&language=en_US&ref_=as_li_ss_tl',
    'bluetti-ac180-us': 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl',
    'bluetti-ac180-gb': 'https://www.amazon.co.uk/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl',
    'costway-us': 'https://www.amazon.com/COSTWAY-Portable-Conditioners-Dehumidifier-Voice-Enabled/dp/B0B1VK8MPK?linkCode=ll2&tag=emergencytrad-20&linkId=ef9e4b1859351e3c750e3205983121e6&language=en_US&ref_=as_li_ss_tl',
    'costway-gb': 'https://www.amazon.co.uk/COSTWAY-Portable-Conditioner-Dehumidifier-Automatic/dp/B0D2W516B5?linkCode=ll2&tag=et0a8-21&linkId=6196e1b84afed702131bb76d77875625&ref_=as_li_ss_tl',
    'xsense-gb': 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?linkCode=ll2&tag=et0a8-21&linkId=de799f2916e37bdff865e5bebfb3579b&ref_=as_li_ss_tl',
    'xsense-us': 'https://www.amazon.co.uk/X-Sense-Transmission-Basements-Bathrooms-SWS54/dp/B0BJ6B1LPQ?pd_rd_w=rNDRh&content-id=amzn1.sym.df4efede-68aa-45d9-931a-e3d20ef93ef8%3Aamzn1.symc.30e3dbb4-8dd8-4bad-b7a1-a45bcdbc49b8&pf_rd_p=df4efede-68aa-45d9-931a-e3d20ef93ef8&pf_rd_r=ZC4JED1ZT6D8A1H2K6S5&pd_rd_wg=XKm4D&pd_rd_r=9db38f10-2bf2-4692-bba4-4362c3207546&pd_rd_i=B0BJ6B1LPQ&th=1&linkCode=ll2&tag=et0a8-21&linkId=719133608c5932412e2e1e7586a679f6&ref_=as_li_ss_tl',
  };

  // Determine which Amazon link to use based on post slug
  const slugLower = (slug || '').toLowerCase();
  let amazonUrl = '';
  if (slugLower.includes('refrigerant') && slugLower.includes('us')) amazonUrl = amazonLinks['costway-us'];
  else if (slugLower.includes('refrigerant') && (slugLower.includes('gb') || slugLower.includes('uk'))) amazonUrl = amazonLinks['costway-gb'];
  else if (slugLower.includes('radon')) amazonUrl = amazonLinks['aranet-radon'];
  else if (slugLower.includes('portable-power') && (slugLower.includes('gb') || slugLower.includes('uk'))) amazonUrl = amazonLinks['bluetti-ac180-gb'];
  else if (slugLower.includes('portable-power') && slugLower.includes('us')) amazonUrl = amazonLinks['bluetti-ac180-us'];
  else if (slugLower.includes('smart-leak') && (slugLower.includes('gb') || slugLower.includes('uk'))) amazonUrl = amazonLinks['xsense-gb'];
  else if (slugLower.includes('smart-leak') && slugLower.includes('us')) amazonUrl = amazonLinks['xsense-us'];

  // Fix mangled buttons: replace orphaned style fragments + button text with proper <a> tag
  if (amazonUrl) {
    displayContent = displayContent.replace(
      /[^<]*#f0c14b[^>]*">([^<]*(?:Buy on Amazon|Order on Amazon|Get.*Amazon|Check.*Amazon)[^<]*)<\/a>/gi,
      `<a href="${amazonUrl}" class="amazon-button" target="_blank" rel="noopener noreferrer">$1</a>`
    );
  }

  // Convert markdown Amazon links to class-based buttons
  displayContent = displayContent.replace(
    /\[([^\]]*?(?:Amazon|amazon)[^\]]*?)\]\((https:\/\/www\.amazon\.[^)]+)\)/gi,
    '<a href="$2" class="amazon-button" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Clean up product-box inline styles
  displayContent = displayContent.replace(
    /<div\s+style="[^"]*"[^>]*class="product-box"/gi,
    '<div class="product-box"'
  );
  displayContent = displayContent.replace(
    /<div\s+class="product-box"\s+style="[^"]*"[^>]*>/gi,
    '<div class="product-box">'
  );

  // Clean up product-image inline styles
  displayContent = displayContent.replace(
    /<img\s+([^>]*)\s+class="product-image"/gi,
    '<img class="product-image"'
  );

  // Force product images to display with inline styles
  displayContent = displayContent.replace(
    /<img class="product-image"([^>]*)\/?>/gi,
    '<img class="product-image" style="display:block!important;visibility:visible!important;opacity:1!important;max-width:280px!important;width:min(280px, 90vw)!important;height:280px!important;object-fit:contain!important;"$1/>'
  );

  // Keep exactly one page-level h1: the post title rendered above the article body.
  // Convert any CMS/article-body h1s to h2s so imported HTML/Markdown cannot create duplicate h1s.
  displayContent = displayContent
    .replace(/<h1(\b[^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>')
    .replace(/^#\s+/gm, '## ');

  // Strip dangerous HTML before rendering
  displayContent = sanitizeHtml(displayContent);

  // Hard-fix formatting for specific broken paragraphs acting as merged sections
  displayContent = displayContent
    .replace(/(?:<p>)?\s*(3\.\s+Professional Diagnostics[^<.]*\.)\s*(?:<\/p>|<br\/?>)?/gi, '\n\n<h2>$1</h2>\n\n')
    .replace(/(?:<p>)?\s*(4\.\s+Safety First[^<.]*\.)\s*(?:<\/p>|<br\/?>)?/gi, '\n\n<h2>$1</h2>\n\n')
    .replace(/([.?!])\s+(3\.\s+Professional)/g, '$1</p><h2>$2')
    .replace(/([.?!])\s+(4\.\s+Safety First)/g, '$1</p><h2>$2');

  const isUS = slug?.toLowerCase().includes('usa') || slug?.toLowerCase().includes('-us');
  const readingTime = calcReadingTime(displayContent);
  const hasExcerpt = post.excerpt && post.excerpt !== '...' && post.excerpt.length > 50;

  // ── SEO SCHEMA ───────────────────────────────────────────────────────────
  const siteUrl = isUS ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';
  const absoluteImage = post.cover_image
    ? (post.cover_image.startsWith('http') ? post.cover_image : `${siteUrl}${post.cover_image}`)
    : `${siteUrl}/tradesman-hero-v2.webp`;

  const articleSchema = {
    "@context": "https://schema.org", "@type": "Article",
    "headline": post.title,
    "description": hasExcerpt ? post.excerpt : post.title,
    "image": absoluteImage,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.published_at || post.created_at,
    "author": { "@type": "Organization", "name": isUS ? "Emergency Contractors US Editorial Team" : "Emergency Tradesmen UK Editorial Team", "url": siteUrl },
    "publisher": { "@type": "Organization", "name": isUS ? "Emergency Contractors" : "Emergency Tradesmen", "logo": { "@type": "ImageObject", "url": `${siteUrl}/et-logo-v2.webp` } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${siteUrl}/blog/${post.slug}` }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${siteUrl}/blog` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `${siteUrl}/blog/${post.slug}` }
    ]
  };

  const faqMatches = [...displayContent.matchAll(/###\s+([^\n]+)\n+([^#]+?)(?=\n###|\n##|$)/g)];
  const faqSchema = faqMatches.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": faqMatches.slice(0, 6).map(m => ({
      "@type": "Question", "name": m[1].trim(),
      "acceptedAnswer": { "@type": "Answer", "text": m[2].trim().replace(/\*\*/g, '').substring(0, 300) }
    }))
  } : null;

  const jsonLdSchemas: object[] = [articleSchema, breadcrumbSchema];
  if (faqSchema) jsonLdSchemas.push(faqSchema);

  const isHtmlContent = /<\/h[1-6]>/i.test(displayContent);

  return (
    <div className={`min-h-screen font-sans transition-all duration-500 overflow-x-hidden ${isWhiteMode ? 'bg-[#fafafa] text-neutral-900' : 'bg-[#0a0a0a] text-neutral-100'}`}>
      <Header />
      <style>{`
              /* ── GLOBAL OVERFLOW GUARD ────────────────── */
              *, *::before, *::after { box-sizing: border-box; }
              body { overflow-x: hidden; }
              /* ── AMAZON PRODUCT SECTION ───────────────────────────── */
              .amazon-product-section { 
                margin: 3rem 0 !important; 
                padding: 0 !important;
              }
              .product-box {
                display: flex !important; 
                flex-direction: column !important; 
                align-items: center !important;
                background: linear-gradient(145deg, #fff8f3 0%, #fff 100%) !important; 
                border: 2px solid #e8923a !important;
                border-radius: 20px !important; 
                padding: 2.5rem 2rem !important; 
                margin: 2rem auto !important; 
                max-width: 500px !important; 
                box-shadow: 0 12px 40px rgba(232,146,58,0.12) !important;
                transition: transform 0.3s ease, box-shadow 0.3s ease !important;
              }
              .product-box:hover {
                transform: translateY(-4px) !important;
                box-shadow: 0 16px 48px rgba(232,146,58,0.18) !important;
              }
              .product-image-wrapper {
                margin-bottom: 1.5rem !important; 
                text-align: center !important;
                width: 100% !important;
              }
              .product-image {
                width: 280px !important; 
                height: 280px !important; 
                object-fit: contain !important;
                border-radius: 16px !important; 
                background: #fff !important; 
                box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important;
              }
              .product-info { 
                text-align: center !important; 
                width: 100% !important; 
              }
              .product-info h3 {
                font-size: 1.35rem !important; 
                font-weight: 800 !important; 
                color: #1f2937 !important;
                margin: 0 0 0.75rem !important;
                line-height: 1.3 !important;
              }
              .product-info p {
                font-size: 1rem !important; 
                color: #6b7280 !important; 
                margin: 0 0 1.5rem !important; 
                line-height: 1.6 !important;
              }
              .amazon-button {
                display: inline-block !important; 
                width: 100% !important; 
                padding: 1rem 2rem !important;
                background: linear-gradient(135deg, #e8923a 0%, #c97a2b 100%) !important; 
                color: #fff !important; 
                font-weight: 700 !important; 
                font-size: 1.1rem !important;
                border-radius: 14px !important; 
                text-decoration: none !important; 
                text-align: center !important;
                transition: all 0.3s ease !important;
                box-shadow: 0 4px 16px rgba(232,146,58,0.35) !important;
                border: none !important;
                letter-spacing: 0.02em !important;
              }
              .amazon-button:hover { 
                background: linear-gradient(135deg, #c97a2b 0%, #a86820 100%) !important; 
                color: #fff !important; 
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 24px rgba(232,146,58,0.45) !important;
              }
              .amazon-button:active {
                transform: translateY(0) !important;
              }

              /* ── AMAZON INFOGRAPHIC IMAGES ──────────────────────── */
              #amazon-infographic-fix {
                width: 100% !important; 
                height: auto !important; 
                max-width: 100% !important; 
                display: block !important; 
                border-radius: 16px !important; 
                margin: 2rem auto !important; 
                padding: 0 !important; 
                box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important; 
                border: none !important; 
                overflow: visible !important; 
                aspect-ratio: auto !important; 
                object-fit: contain !important;
              }

              /* ── HIDE RAW URLs IN AMAZON LINKS ──────────────────── */
              .blog-body a[href*="amazon"] {
                text-decoration: none !important;
              }
              .blog-body a[href*="amazon"] span,
              .blog-body a[href*="amazon"] p {
                display: none !important;
              }
              /* Force product images visible */
              .blog-body img.product-image {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 100% !important;
                max-width: 280px !important;
                height: auto !important;
              }

              @media (max-width: 640px) {
                .blog-body img.product-image {
                  max-width: 100% !important;
                }
                .blog-body img {
                  max-width: 100% !important;
                  width: 100% !important;
                  height: auto !important;
                  object-fit: cover !important;
                }
                .blog-body figure {
                  width: 100% !important;
                  max-width: 100% !important;
                }
                .blog-body .product-box {
                  max-width: 100% !important;
                  padding: 1.5rem 1rem !important;
                }
                .blog-body .amazon-product-section {
                  padding: 1rem !important;
                  margin: 1.5rem 0 !important;
                }
              }

              /* ── MOBILE RESPONSIVE ────────────────────── */
              @media (max-width: 640px) {
                .blog-body {
                  padding: 0 1rem !important;
                  font-size: 1rem !important;
                }
                .blog-body h2 {
                  font-size: 1.25rem !important;
                  margin: 2.5rem 0 1.25rem !important;
                }
                .blog-body h3 {
                  font-size: 1.05rem !important;
                  margin: 2rem 0 0.85rem !important;
                }
                .blog-body p {
                  font-size: 0.9875rem !important;
                  margin-bottom: 1.5rem !important;
                }
              }

              ${BLOG_STYLES}
            `}</style>
      <SEO
        title={post.title}
        description={hasExcerpt ? post.excerpt : undefined}
        canonical={`/blog/${post.slug}`}
        ogType="article" ogImage={absoluteImage} jsonLd={jsonLdSchemas}
        alternates={[
          { lang: 'en-GB', href: `https://emergencytradesmen.net/blog/${post.slug}` },
          { lang: 'en-US', href: `https://emergencycontractors.net/blog/${post.slug}` },
          { lang: 'x-default', href: `https://emergencytradesmen.net/blog/${post.slug}` },
        ]}
      />
      <Helmet>
        <meta property="article:published_time" content={post.published_at || post.created_at} />
        {post.updated_at && <meta property="article:modified_time" content={post.updated_at} />}
        <meta property="article:author" content={isUS ? "Emergency Contractors" : "Emergency Tradesmen"} />
        <meta property="article:section" content="Home Emergency Advice" />
      </Helmet>

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className={`sticky top-0 z-[100] backdrop-blur-xl border-b h-16 flex items-center shadow-sm transition-all ${isWhiteMode ? 'bg-white/90 border-neutral-200' : 'bg-black/80 border-white/10'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full flex justify-between items-center">
          <Link to="/blog" className={`flex items-center gap-2 text-sm font-semibold transition-colors ${isWhiteMode ? 'text-neutral-600 hover:text-orange-500' : 'text-neutral-400 hover:text-orange-400'}`}>
            <ArrowLeft className="w-4 h-4" /> All Articles
          </Link>
          <button onClick={() => setIsWhiteMode(!isWhiteMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${isWhiteMode ? 'border-neutral-200 text-neutral-500 hover:border-orange-300' : 'border-white/10 text-orange-400'}`}>
            {isWhiteMode ? <><Moon className="w-3 h-3" /> Dark</> : <><Sun className="w-3 h-3" /> Light</>}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 overflow-x-hidden">
        <main className="flex-1 min-w-0 max-w-4xl mx-auto lg:mx-0 w-full overflow-x-hidden">

          {/* ── HEADER ──────────────────────────────────────────────── */}
        <header className="mb-10 md:mb-14">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-400 mb-5 uppercase tracking-wider font-semibold">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-orange-500 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span aria-current="page" className={`truncate max-w-[16rem] normal-case tracking-normal ${isWhiteMode ? 'text-neutral-600' : 'text-neutral-300'}`}>{post.title}</span>
          </nav>

          {/* Category badge */}
          <div className="mb-4">
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-2 w-fit">
              {isUS ? '🇺🇸 US Expert Guide' : '🇬🇧 UK Expert Guide'} · 2026
            </span>
          </div>

          {/* Main header grid: title left, image right */}
          <div className="flex flex-col md:flex-row md:items-start md:gap-10">
            <div className="flex-1 min-w-0">
              <h1 className={`blog-h1 mb-5 ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>
                {post.title}
              </h1>

              {/* Meta row: author · date · reading time */}
              <div className={`flex flex-wrap items-center gap-4 text-sm mb-6 ${isWhiteMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                <span className="flex items-center gap-1.5 font-medium">
                  <User className="w-4 h-4 text-orange-400" />
                  {isUS ? 'Emergency Contractors US Team' : 'Emergency Tradesmen UK Team'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  {safeFormatDate(post.published_at || post.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-400" />
                  {readingTime} min read
                </span>
              </div>

              {/* TLDR / Key Takeaways */}
              {hasExcerpt && (
                <div className={`rounded-xl border-l-4 border-orange-400 p-4 mb-2 ${isWhiteMode ? 'bg-orange-50' : 'bg-orange-950/20'}`}>
                  <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isWhiteMode ? 'text-orange-600' : 'text-orange-400'}`}>
                    ⚡ TL;DR  -  Key Takeaway
                  </p>
                  <p className={`text-sm leading-relaxed font-medium m-0 ${isWhiteMode ? 'text-neutral-700' : 'text-neutral-200'}`}>
                    {post.excerpt}
                  </p>
                </div>
              )}
            </div>

            {/* Featured image  -  responsive, full width on mobile */}
            <div className="mt-6 md:mt-0 md:shrink-0 w-full md:w-auto min-w-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/10 aspect-[4/3] md:aspect-[9/16] w-full max-w-[280px] md:max-w-[320px] mx-auto md:mx-0 min-h-[200px]">
                {post.cover_image ? (
                  <img
                    src={getImageUrl(post.cover_image)}
                    alt={`${post.title}  -  ${isUS ? 'Emergency Contractors US' : 'Emergency Tradesmen UK'} expert guide`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const src = target.src;
                      if (src.endsWith('.webp')) {
                        target.src = src.replace(/\.webp$/i, '.png');
                      }
                    }}
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                      isWhiteMode
                        ? 'from-orange-50 via-amber-100 to-neutral-100'
                        : 'from-orange-950/40 via-amber-900/30 to-neutral-900'
                    }`}
                    aria-label={`${post.title} image pending`}
                  >
                    <span className={`text-5xl font-display font-black ${isWhiteMode ? 'text-orange-900/20' : 'text-orange-100/20'}`}>
                      {isUS ? 'EC' : 'ET'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <p className={`text-xs text-center mt-2 font-medium ${isWhiteMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  {isUS ? '24/7 Emergency Contractors' : '24/7 Emergency Tradesmen'} · Certified Professionals
                </p>
              </div>
          </div>
        </header>

        {/* ── ARTICLE BODY ──────────────────────────────────────── */}
        {(() => {
          // Split content at ~50% for mid-article ad
          const paragraphs = displayContent.split(/<\/p>/i);
          const midPoint = Math.max(1, Math.floor(paragraphs.length / 2));
          const firstHalf = paragraphs.slice(0, midPoint).join('</p>') + (paragraphs.length > midPoint ? '</p>' : '');
          const secondHalf = paragraphs.length > midPoint ? paragraphs.slice(midPoint).join('</p>') : '';

          return (
            <>
              <div className={`blog-body ${isWhiteMode ? '' : 'dark'}`}>
                {isHtmlContent
                  ? <div dangerouslySetInnerHTML={{ __html: firstHalf }} />
                  : <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{firstHalf}</ReactMarkdown>
                }
              </div>

              {/* Mid-article AdSense unit */}
              <div className="my-8 md:my-12">
                <AdSlot slot="7143278448" format="infeed" />
              </div>

              {secondHalf && (
                <div className={`blog-body ${isWhiteMode ? '' : 'dark'}`}>
                  {isHtmlContent
                    ? <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
                    : <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{secondHalf}</ReactMarkdown>
                  }
                </div>
              )}
            </>
          );
        })()}

        {/* ── FIND A PRO CTA ────────────────────────────────────────── */}
        <div className={`my-10 rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-4 ${isWhiteMode ? 'bg-orange-50 border-orange-200' : 'bg-orange-500/10 border-orange-500/30'}`}>
          <div className="flex-1">
            <p className={`font-bold text-lg mb-1 ${isWhiteMode ? 'text-neutral-800' : 'text-white'}`}>
              Need a professional right now?
            </p>
            <p className={`text-sm ${isWhiteMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
              Find local emergency {isUS ? 'contractor' : 'tradesman'} contacts near you and confirm details before booking.
            </p>
          </div>
          <Link
            to={isUS ? "/emergency-plumber" : "/emergency-plumber"}
            className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Find a Pro Near You →
          </Link>
        </div>

        {/* ── AMAZON PRODUCT SECTION ────────────────────────────────── */}
        {(() => {
          let matchedSlug = slug ? Object.keys(AMAZON_PRODUCTS).find(k => slug.toLowerCase().includes(k) || k.includes(slug.toLowerCase())) : null;
          
          // Failsafe for long slugs that detach core identifiers from regional identifiers
          if (!matchedSlug && slug) {
            const lowerSlug = slug.toLowerCase();
            if (lowerSlug.includes('plug-in-solar') || lowerSlug.includes('balcony-power')) {
              matchedSlug = lowerSlug.includes('-us') || lowerSlug.includes('usa') ? 'plug-in-solar-us' : 'plug-in-solar-gb';
            }
          }
          if (!matchedSlug) matchedSlug = slug;
          
          const product = matchedSlug ? AMAZON_PRODUCTS[matchedSlug] : null;

          if (!product) return null;

          // Ensure proper regional link structure for dynamic matches
          let targetUrl = product.url;
          if (slug?.toLowerCase().includes('us') || slug?.toLowerCase().includes('usa')) {
             if (targetUrl.includes('.co.uk')) {
                // If it's a US post but resolving to UK link, swap it to US Bluetti (safety fallback)
                if (targetUrl.includes('BLUETTI')) targetUrl = 'https://www.amazon.com/BLUETTI-Portable-AC180-Generator-Off-grid/dp/B0C1SMJTDT?linkCode=ll2&tag=emergencytrad-20&linkId=35e97d3caf51b17294501b87c3298638&language=en_US&ref_=as_li_ss_tl';
             }
          }

          return (
          <div className={`max-w-lg mx-auto my-8 md:my-12 p-4 md:p-6 rounded-2xl border-2 ${isWhiteMode ? 'bg-orange-50 border-orange-300' : 'bg-neutral-800 border-orange-500/50'}`}>
            <div className="text-center">
              <img
                src={product.image}
                alt={product.title}
                className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto object-contain rounded-xl"
              />
              <h3 className={`text-lg sm:text-xl font-bold mt-4 mb-2 ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>
                {product.title}
              </h3>
              <p className={`text-xs sm:text-sm mb-4 px-2 ${isWhiteMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
                {product.description}
              </p>
              <a
                href={targetUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                View on Amazon
              </a>
              <AffiliateDisclosure className="mt-3 text-center" />
            </div>
          </div>
          );
        })()}


        {/* ── CTA ───────────────────────────────────────────────── */}
        <div className={`my-14 rounded-2xl p-8 md:p-12 text-center border ${isWhiteMode ? 'bg-white border-orange-200 shadow-lg' : 'bg-neutral-900 border-white/10 shadow-xl'}`}>
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-5">
            <Phone className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>
            Need Professional Help?
          </h3>
          <p className={`text-base mb-6 max-w-lg mx-auto leading-relaxed ${isWhiteMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Browse public listings for local emergency {isUS ? 'contractors' : 'tradesmen'} near you and call them direct  -  no middlemen, no booking fees.
          </p>
          <Link
            to={`${isUS && !isUSDomain() ? '/us' : ''}/home#manual-search`}
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-orange-300/40 hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            {isUS ? "Find a Local Contractor" : "Find a Local Tradesperson"}
          </Link>
          <div className={`flex justify-center gap-6 mt-5 text-xs ${isWhiteMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            <span>✓ No booking fees</span>
            <span>✓ Speak direct to the business</span>
            <span>✓ Browse 24/7</span>
          </div>
        </div>

        {/* ── RELATED POSTS (MOBILE ONLY) ─────────────────────────────────────── */}
        {relatedPosts.length > 0 && (
          <section className={`mt-16 pt-10 border-t block lg:hidden ${isWhiteMode ? 'border-neutral-200' : 'border-white/10'}`}>
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-5 h-5 text-orange-400" />
              <h2 className={`text-lg font-bold uppercase tracking-widest ${isWhiteMode ? 'text-neutral-700' : 'text-neutral-300'}`}>Related Articles</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.slice(0, 2).map((rPost) => (
                <Link key={rPost.id} to={`/blog/${rPost.slug}`} className="no-underline block group">
                  <article className={`rounded-xl overflow-hidden shadow-sm border hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isWhiteMode ? 'bg-white border-neutral-200' : 'bg-neutral-900 border-white/10'}`}>
                    {rPost.cover_image && (
                      <div className="aspect-[16/9] overflow-hidden bg-neutral-100">
                        <img
                          src={getImageUrl(rPost.cover_image)}
                          alt={rPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const target = e.currentTarget;
                            const src = target.src;
                            if (src.endsWith('.webp')) {
                              target.src = src.replace(/\.webp$/i, '.png');
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className={`font-semibold text-sm leading-snug group-hover:text-orange-500 transition-colors ${isWhiteMode ? 'text-neutral-800' : 'text-neutral-200'}`}>
                        {rPost.title}
                      </h4>
                      <p className={`text-xs mt-2 ${isWhiteMode ? 'text-orange-500' : 'text-orange-400'}`}>Read more →</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── SIDEBAR (DESKTOP ONLY) ───────────────────────────────── */}
      <aside className="hidden lg:flex w-[320px] xl:w-[360px] shrink-0 flex-col gap-10">
        
        {/* 1. Request Service Widget */}
        <div className={`rounded-2xl p-6 text-center border shadow-lg sticky top-[5rem] ${isWhiteMode ? 'bg-white border-orange-200' : 'bg-neutral-900 border-white/10'}`}>
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-orange-500 relative z-10" />
            <div className="absolute w-16 h-16 bg-orange-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isWhiteMode ? 'text-neutral-900' : 'text-white'}`}>
            Need Help Now?
          </h3>
          <p className={`text-sm mb-6 leading-relaxed ${isWhiteMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            Browse local emergency {isUS ? 'contractors' : 'tradesmen'} and call them direct.
          </p>
          <Link
            to={`${isUS && !isUSDomain() ? '/us' : ''}/home#manual-search`}
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest"
          >
            Find a Local Pro
          </Link>
          <div className={`mt-4 text-xs font-semibold ${isWhiteMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            No middlemen · No booking fees
          </div>
        </div>

        {/* 2. Ad Slot */}
        <div className="w-full flex items-center justify-center rounded-xl overflow-hidden">
          <AdSlot slot="7143278448" format="infeed" />
        </div>

        {/* 3. Related Posts */}
        {relatedPosts.length > 0 && (
          <div className={`p-6 rounded-2xl border ${isWhiteMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900 border-white/10'}`}>
            <div className={`flex items-center gap-3 mb-6 border-b pb-4 ${isWhiteMode ? 'border-neutral-200' : 'border-white/10'}`}>
              <BookOpen className="w-5 h-5 text-orange-400" />
              <h3 className={`text-sm font-bold uppercase tracking-widest ${isWhiteMode ? 'text-neutral-700' : 'text-neutral-300'}`}>More Articles</h3>
            </div>
            <div className="space-y-6">
              {relatedPosts.map((rPost) => (
                <Link key={rPost.id} to={`/blog/${rPost.slug}`} className="group flex gap-4 no-underline items-start">
                  {rPost.cover_image && (
                    <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-neutral-100 ring-1 ring-black/5">
                      <img
                        src={getImageUrl(rPost.cover_image)}
                        alt={rPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const src = target.src;
                          if (src.endsWith('.webp')) {
                            target.src = src.replace(/\.webp$/i, '.png');
                          }
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <h4 className={`font-semibold text-sm leading-snug group-hover:text-orange-500 transition-colors line-clamp-3 ${isWhiteMode ? 'text-neutral-800' : 'text-neutral-200'}`}>
                      {rPost.title}
                    </h4>
                    <span className="text-xs text-orange-500 mt-1 inline-block font-medium">Read Article</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </aside>
      </div>
    </div>
  );
}
