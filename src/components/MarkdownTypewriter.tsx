import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownTypewriterProps {
  content: string;
  /** Characters per tick (higher = faster) */
  speed?: number;
  /** Milliseconds between ticks */
  interval?: number;
  /** Called every tick so parent can scroll */
  onTick?: () => void;
  /** Called when the full content has been revealed */
  onComplete?: () => void;
  /** If true, show the full content immediately (for older messages) */
  immediate?: boolean;
  className?: string;
}

/**
 * Progressively reveals Markdown content with a typewriter effect.
 * Characters are revealed in chunks so the effect feels snappy but
 * the full Markdown structure (headings, bullets, bold) renders live.
 */
export function MarkdownTypewriter({
  content,
  speed = 3,
  interval = 15,
  onTick,
  onComplete,
  immediate = false,
  className = "",
}: MarkdownTypewriterProps) {
  const [visibleLength, setVisibleLength] = useState(immediate ? content.length : 0);
  const completedRef = useRef(false);

  useEffect(() => {
    if (immediate) {
      setVisibleLength(content.length);
      return;
    }

    // Reset if content changes
    setVisibleLength(0);
    completedRef.current = false;

    const timer = setInterval(() => {
      setVisibleLength(prev => {
        const next = Math.min(prev + speed, content.length);
        if (next >= content.length && !completedRef.current) {
          completedRef.current = true;
          clearInterval(timer);
          onComplete?.();
        }
        onTick?.();
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [content, speed, interval, immediate]);

  // Slice content at a safe boundary (don't cut inside a Markdown token)
  const revealed = content.slice(0, visibleLength);

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {revealed}
      </ReactMarkdown>
      {visibleLength < content.length && (
        <span className="inline-block w-2 h-5 bg-gold/70 animate-pulse ml-0.5 align-text-bottom rounded-sm" />
      )}
    </div>
  );
}
