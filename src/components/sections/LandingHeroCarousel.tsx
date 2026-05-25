import { useEffect, useMemo, useState } from "react";

const HERO_IMAGES = [
  "/assets/landing-hero/hero-01.webp",
  "/assets/landing-hero/hero-02.webp",
  "/assets/landing-hero/hero-03.webp",
  "/assets/landing-hero/hero-04.webp",
  "/assets/landing-hero/hero-05.webp",
  "/assets/landing-hero/hero-06.webp",
  "/assets/landing-hero/hero-07.webp",
  "/assets/landing-hero/hero-08.webp",
  "/assets/landing-hero/hero-09.webp",
  "/assets/landing-hero/hero-10.webp",
  "/assets/landing-hero/hero-11.webp",
  "/assets/landing-hero/hero-12.webp",
  "/assets/landing-hero/hero-13.webp",
  "/assets/landing-hero/hero-14.webp",
  "/assets/landing-hero/hero-15.webp",
  "/assets/landing-hero/hero-16.webp",
  "/assets/landing-hero/hero-17.webp",
  "/assets/landing-hero/hero-18.webp",
  "/assets/landing-hero/hero-19.webp",
  "/assets/landing-hero/hero-20.webp",
  "/assets/landing-hero/hero-21.webp",
  "/assets/landing-hero/hero-22.webp",
  "/assets/landing-hero/hero-23.webp",
  "/assets/landing-hero/hero-24.webp",
];

type LandingHeroCarouselProps = {
  className?: string;
};

export function LandingHeroCarousel({ className }: LandingHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const visibleImages = useMemo(() => HERO_IMAGES, []);

  useEffect(() => {
    if (isPaused || visibleImages.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleImages.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [isPaused, visibleImages.length]);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="landing-hero-carousel" aria-label="Emergency tradesmen and roadside help imagery">
        <div
          className="landing-hero-carousel__track"
          style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
        >
          {visibleImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              width="1672"
              height="941"
              loading={index === 0 ? "eager" : "lazy"}
              decoding={index === 0 ? "sync" : "async"}
              {...(index === 0 ? ({ fetchpriority: "high" } as Record<string, string>) : {})}
            />
          ))}
        </div>
        <div className="landing-hero-carousel__shade" aria-hidden="true" />
        <div className="landing-hero-carousel__status" aria-hidden="true">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          <strong>{String(visibleImages.length).padStart(2, "0")}</strong>
        </div>
      </div>
    </div>
  );
}
