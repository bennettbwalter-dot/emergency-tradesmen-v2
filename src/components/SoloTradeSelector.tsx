import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, LocateFixed, MapPin, Pause, Play, Square } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
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

const REVERSE_GEOCODE_TIMEOUT_MS = 2500;
const UK_BOUNDS = { minLat: 49.8, maxLat: 60.9, minLng: -8.8, maxLng: 2.1 };
const US_BOUNDS = { minLat: 24.3, maxLat: 49.5, minLng: -125, maxLng: -66.8 };

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
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    if (typeof window !== "undefined" && !window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      reject(new Error("Location needs HTTPS"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

async function reverseGeocodeCity(lat: number, lng: number) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { "Accept-Language": "en" },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.county || null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function coordsWithinCountry(lat: number, lng: number, countryCode: "GB" | "US") {
  const bounds = countryCode === "US" ? US_BOUNDS : UK_BOUNDS;
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

function getLocationErrorMessage(error: unknown) {
  if (error instanceof Error && error.message === "Geolocation is not supported") {
    return "Your browser does not support location. Choose your area manually.";
  }
  if (error instanceof Error && error.message === "Location needs HTTPS") {
    return "Location needs a secure HTTPS connection. Choose your area manually.";
  }
  if (typeof error === "object" && error && "code" in error) {
    const code = Number((error as GeolocationPositionError).code);
    if (code === 1) {
      return "Location access was blocked. Choose your area manually.";
    }
    if (code === 2) {
      return "Your device could not provide a location. Check location services or choose your area manually.";
    }
    if (code === 3) {
      return "Location took too long to load. Try again or choose your area manually.";
    }
  }
  return "Unable to find your location right now. Choose your area manually.";
}

export function SoloTradeSelector() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/landing" || location.pathname === "/welcome";
  const { settings, detectedCity } = useLocalization();
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
    if (isLandingPage) {
      navigate("/");
      return;
    }
    stopAutoRotation();
    setLocatingSlug(trade.slug);
    setLocationError(null);
    setDetectedTrade(trade.slug);

    let resolvedCity = detectedCity;

    try {
      const position = await getBrowserPosition();
      const { latitude, longitude } = position.coords;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setLocationError("Your browser returned an invalid location. Choose your area manually.");
        setLocatingSlug(null);
        return;
      }

      if (!coordsWithinCountry(latitude, longitude, settings.countryCode)) {
        setLocationError(settings.countryCode === "GB"
          ? "This site only covers UK locations. Choose a UK area manually."
          : "This site only covers USA locations. Choose a US area manually.");
        setLocatingSlug(null);
        return;
      }

      const reverseCity = await reverseGeocodeCity(latitude, longitude);
      const nearest = findNearestCity(latitude, longitude, settings.countryCode);
      resolvedCity = reverseCity || nearest?.city || resolvedCity;

      if (resolvedCity) {
        setDetectedCity(resolvedCity);
      }
    } catch (error) {
      setLocationError(getLocationErrorMessage(error));
      setLocatingSlug(null);
      return;
    }

    if (!resolvedCity) {
      setLocationError("Unable to identify your current area. Choose your area manually.");
      setLocatingSlug(null);
      return;
    }

    const citySlug = slugifyLocation(resolvedCity);
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
