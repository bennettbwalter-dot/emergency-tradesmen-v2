import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, LocateFixed, MapPin, Pause, Play, Square } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { findNearestCity } from "@/lib/cityCoordinates";
import "./SoloTradeSelector.css";

type SelectorTrade = {
  slug: string;
  label: string;
  actionLabel: string;
  backgroundLines: string[];
  italicLine?: string;
  image: string;
  accent: string;
};

const selectorTrades: SelectorTrade[] = [
  {
    slug: "plumber",
    label: "Plumber",
    actionLabel: "Find plumber",
    backgroundLines: ["PLUMBER"],
    image: "/assets/trade-selector/plumber.webp",
    accent: "#56b6ff",
  },
  {
    slug: "electrician",
    label: "Electrician",
    actionLabel: "Find electrician",
    backgroundLines: ["ELECTRICIAN"],
    image: "/assets/trade-selector/electrician.webp",
    accent: "#f1c84b",
  },
  {
    slug: "locksmith",
    label: "Locksmith",
    actionLabel: "Find locksmith",
    backgroundLines: ["LOCKSMITH"],
    image: "/assets/trade-selector/locksmith.webp",
    accent: "#74d49b",
  },
  {
    slug: "gas-engineer",
    label: "Gas Engineer / HVAC",
    actionLabel: "Find gas engineer",
    backgroundLines: ["GAS", "ENGINEER"],
    italicLine: "HVAC",
    image: "/assets/trade-selector/gas-engineer.webp",
    accent: "#ff8a3d",
  },
  {
    slug: "drain-specialist",
    label: "Drain Specialist",
    actionLabel: "Find drain specialist",
    backgroundLines: ["DRAIN"],
    italicLine: "Specialist",
    image: "/assets/trade-selector/drain-specialist.webp",
    accent: "#3ad0d8",
  },
  {
    slug: "glazier",
    label: "Glazier / Glass Repair",
    actionLabel: "Find glazier",
    backgroundLines: ["GLAZIER"],
    italicLine: "Glass Repair",
    image: "/assets/trade-selector/glazier.webp",
    accent: "#9bdcff",
  },
  {
    slug: "roofer",
    label: "Roofer",
    actionLabel: "Find roofer",
    backgroundLines: ["ROOFER"],
    image: "/assets/trade-selector/roofer.webp",
    accent: "#d4a755",
  },
  {
    slug: "builder",
    label: "Builder / Construction",
    actionLabel: "Find builder",
    backgroundLines: ["BUILDER"],
    italicLine: "Construction",
    image: "/assets/trade-selector/builder.webp",
    accent: "#c9895a",
  },
  {
    slug: "water-restoration",
    label: "Water Restoration",
    actionLabel: "Find restoration",
    backgroundLines: ["WATER"],
    italicLine: "Restoration",
    image: "/assets/trade-selector/water-restoration.webp",
    accent: "#4fb8ff",
  },
  {
    slug: "breakdown",
    label: "Breakdown Recovery",
    actionLabel: "Find recovery",
    backgroundLines: ["BREAKDOWN"],
    italicLine: "Recovery",
    image: "/assets/trade-selector/breakdown.webp",
    accent: "#ff7a2e",
  },
  {
    slug: "hvac",
    label: "Air Conditioning / HVAC",
    actionLabel: "Find HVAC",
    backgroundLines: ["AIR", "CONDITIONING"],
    italicLine: "HVAC",
    image: "/assets/trade-selector/hvac.webp",
    accent: "#74d8ff",
  },
];

function slugifyLocation(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

async function reverseGeocodeCity(lat: number, lng: number) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
    headers: { "Accept-Language": "en" },
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
}

export function SoloTradeSelector() {
  const navigate = useNavigate();
  const { settings, detectedCity, setOverride } = useLocalization();
  const { setDetectedTrade, setDetectedCity } = useChatbot();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [hasStoppedRotation, setHasStoppedRotation] = useState(false);
  const [locatingSlug, setLocatingSlug] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const wheelLockRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const activeTrade = selectorTrades[activeIndex];
  const activeAccent = activeTrade.accent;

  const clearResumeTimer = useCallback(() => {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }, []);

  const resumeAutoRotation = useCallback(() => {
    clearResumeTimer();
    setHasStoppedRotation(false);
    setIsAutoRotating(true);
  }, [clearResumeTimer]);

  const scheduleAutoResume = useCallback(() => {
    clearResumeTimer();
    resumeTimerRef.current = window.setTimeout(() => {
      setHasStoppedRotation(false);
      setIsAutoRotating(true);
      resumeTimerRef.current = null;
    }, 3200);
  }, [clearResumeTimer]);

  const pauseAutoRotation = useCallback((shouldResume = true) => {
    setIsAutoRotating(false);
    setHasStoppedRotation(false);
    if (shouldResume) scheduleAutoResume();
  }, [scheduleAutoResume]);

  const stopAutoRotation = useCallback(() => {
    clearResumeTimer();
    setIsAutoRotating(false);
    setHasStoppedRotation(true);
  }, [clearResumeTimer]);

  const selectIndex = useCallback(
    (nextIndex: number) => {
      const wrapped = (nextIndex + selectorTrades.length) % selectorTrades.length;
      if (wrapped === activeIndex) return;
      setDirection(wrapped > activeIndex || (activeIndex === selectorTrades.length - 1 && wrapped === 0) ? 1 : -1);
      setActiveIndex(wrapped);
    },
    [activeIndex],
  );

  const activeLocationLabel = useMemo(() => detectedCity || (settings.countryCode === "US" ? "your city" : "your area"), [detectedCity, settings.countryCode]);

  useEffect(() => {
    if (!isAutoRotating || locatingSlug) return undefined;

    const timer = window.setInterval(() => {
      selectIndex(activeIndex + 1);
    }, 3400);

    return () => window.clearInterval(timer);
  }, [activeIndex, isAutoRotating, locatingSlug, selectIndex]);

  useEffect(() => () => clearResumeTimer(), [clearResumeTimer]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) < 24 || wheelLockRef.current) return;
    event.preventDefault();
    pauseAutoRotation(true);
    wheelLockRef.current = true;
    selectIndex(activeIndex + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(() => {
      wheelLockRef.current = false;
    }, 560);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    pauseAutoRotation(false);
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null) return;
    const endY = event.changedTouches[0]?.clientY ?? touchStartYRef.current;
    const delta = touchStartYRef.current - endY;
    touchStartYRef.current = null;
    if (Math.abs(delta) > 34) {
      selectIndex(activeIndex + (delta > 0 ? 1 : -1));
    }
    scheduleAutoResume();
  };

  const handleFindLocal = async (trade: SelectorTrade) => {
    stopAutoRotation();
    setLocatingSlug(trade.slug);
    setLocationError(null);
    setDetectedTrade(trade.slug);

    let resolvedCity = detectedCity;

    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;
      const nearest = findNearestCity(latitude, longitude, settings.countryCode);
      resolvedCity = nearest?.city || (await reverseGeocodeCity(latitude, longitude)) || resolvedCity;

      if (resolvedCity) {
        setOverride({ latitude, longitude }, resolvedCity);
        setDetectedCity(resolvedCity);
      }
    } catch (error) {
      resolvedCity = resolvedCity || (settings.countryCode === "US" ? "Los Angeles" : "London");
      setLocationError("Using a fallback city because browser location was not available.");
    }

    const citySlug = slugifyLocation(resolvedCity || (settings.countryCode === "US" ? "Los Angeles" : "London"));
    navigate(`/emergency-${trade.slug}/${citySlug}`);
  };

  return (
    <div
      className="solo-trade-selector"
      style={{ ["--active-trade-accent" as string]: activeAccent }}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "PageDown") {
          pauseAutoRotation();
          selectIndex(activeIndex + 1);
        }
        if (event.key === "ArrowUp" || event.key === "PageUp") {
          pauseAutoRotation();
          selectIndex(activeIndex - 1);
        }
      }}
      aria-label="Choose an emergency trade"
    >
      <div className="solo-trade-stage">
        <div className="solo-trade-stage-controls" aria-label="Trade selector controls">
          <button
            type="button"
            className="solo-trade-stage-control"
            onClick={() => {
              pauseAutoRotation(true);
              selectIndex(activeIndex - 1);
            }}
            aria-label="Previous trade"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="solo-trade-stage-control solo-trade-stage-control--wide"
            onClick={isAutoRotating ? () => pauseAutoRotation(false) : resumeAutoRotation}
            aria-label={isAutoRotating ? "Pause trade rotation" : "Resume trade rotation"}
            aria-pressed={!isAutoRotating}
          >
            {isAutoRotating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isAutoRotating ? "Pause" : "Resume"}</span>
          </button>
          <button
            type="button"
            className="solo-trade-stage-control"
            onClick={stopAutoRotation}
            aria-label="Stop trade rotation"
            aria-pressed={hasStoppedRotation}
          >
            <Square className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="solo-trade-stage-control"
            onClick={() => {
              pauseAutoRotation(true);
              selectIndex(activeIndex + 1);
            }}
            aria-label="Next trade"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="solo-trade-stage-status" aria-live="polite">
          <span>{String(activeIndex + 1).padStart(2, "0")}</span>
          {isAutoRotating ? "Auto-rotating" : hasStoppedRotation ? "Stopped on selection" : "Paused"}
        </div>

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`text-${activeTrade.slug}`}
            className="solo-trade-backtext"
            initial={{ opacity: 0, scale: 0.1, filter: "blur(8px)", letterSpacing: "0.42em" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)", letterSpacing: "0.03em" }}
            exit={{ opacity: 0, scale: 1.05, y: -38, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTrade.backgroundLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            {activeTrade.italicLine && <em>{activeTrade.italicLine}</em>}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.img
            key={activeTrade.slug}
            src={activeTrade.image}
            alt={`${activeTrade.label} tradesperson`}
            className="solo-trade-person"
            initial={{ opacity: 0, x: "-50%", y: 90, scale: 0.96, filter: "blur(14px)" }}
            animate={{ opacity: 1, x: "-50%", y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: "-50%", y: -64, scale: 0.985, filter: "blur(18px)" }}
            transition={{ duration: 0.74, ease: [0.16, 1, 0.3, 1] }}
            draggable={false}
          />
        </AnimatePresence>

        <div className="solo-trade-orbit" aria-hidden="true" />

        <div className="solo-trade-action">
          <p>Selected trade</p>
          <h3>{activeTrade.label}</h3>
          <div className="solo-trade-linkbox">
            <MapPin className="h-4 w-4" />
            <span>/emergency-{activeTrade.slug}/{slugifyLocation(activeLocationLabel)}</span>
          </div>
          <button type="button" onClick={() => handleFindLocal(activeTrade)} disabled={locatingSlug === activeTrade.slug}>
            {locatingSlug === activeTrade.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            {locatingSlug === activeTrade.slug ? "Finding location" : activeTrade.actionLabel}
          </button>
          {locationError && <small>{locationError}</small>}
        </div>
      </div>
    </div>
  );
}
