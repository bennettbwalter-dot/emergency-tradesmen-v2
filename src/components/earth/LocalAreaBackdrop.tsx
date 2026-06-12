import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cityCoordinates } from "@/lib/cityCoordinates";
import { usCityCoordinates } from "@/lib/usCityCoordinates";
import { InteractiveMap } from "@/components/InteractiveMap";
import { buildEarthMapStyle, EARTH_FINAL_PITCH, EARTH_FINAL_ZOOM } from "./mapStyle";

type LocalAreaBackdropProps = {
  lat?: number;
  lng?: number;
  zoom?: number;
  pitch?: number;
  bearing?: number;
  fallbackImage?: string;
  label?: string;
  location?: string;
  focusLabel?: string;
  focusDescription?: string;
  interactive?: boolean;
  staticFallback?: boolean;
};

function isValidCoord(value?: number) {
  return Number.isFinite(value);
}

function toTitleCase(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function cleanLocation(value?: string | null) {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function getKnownCoords(value?: string | null) {
  const raw = cleanLocation(value);
  if (!raw) return null;

  const bracketMatch = raw.match(/\(([^)]+)\)/);
  const candidates = [
    raw,
    raw.replace(/[()]/g, " "),
    raw.replace(/\([^)]*\)/g, " "),
    bracketMatch?.[1] || "",
    raw.split(",")[0] || ""
  ]
    .map(toTitleCase)
    .filter(Boolean);

  for (const candidate of candidates) {
    const coords = cityCoordinates[candidate] || usCityCoordinates[candidate];
    if (coords) return coords;
  }

  return null;
}

function LocalAreaFallback({
  fallbackImage,
  label,
  muted = false
}: {
  fallbackImage?: string;
  label?: string;
  muted?: boolean;
}) {
  return (
    <div className={`local-area-fallback${muted ? " local-area-fallback--muted" : ""}`}>
      {fallbackImage && (
        <img
          src={fallbackImage}
          alt={label || "Local area"}
          className="h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
      )}
      <div className="local-area-fallback__shade" />
    </div>
  );
}

async function geocodeLocation(value: string) {
  const query = cleanLocation(value).replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (!query) return null;

  const exactKnownCoords = cityCoordinates[toTitleCase(query)] || usCityCoordinates[toTitleCase(query)];
  if (exactKnownCoords) return exactKnownCoords;

  try {
    const params = new URLSearchParams({
      q: query,
      format: "jsonv2",
      limit: "1",
      countrycodes: "gb,us"
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return getKnownCoords(value);

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (!first) return getKnownCoords(value);

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : getKnownCoords(value);
  } catch {
    return getKnownCoords(value);
  }
}

export function LocalAreaBackdrop({
  lat,
  lng,
  zoom = EARTH_FINAL_ZOOM,
  pitch = EARTH_FINAL_PITCH,
  bearing = 0,
  fallbackImage,
  label,
  location,
  focusLabel,
  focusDescription,
  interactive = true,
  staticFallback = false
}: LocalAreaBackdropProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const initAttemptsRef = useRef(0);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(() =>
    getKnownCoords(location || focusLabel || label)
  );
  const [mapReady, setMapReady] = useState(false);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  const [webglError, setWebglError] = useState(false);
  const explicitCoords = isValidCoord(lat) && isValidCoord(lng);
  const effectiveLat = explicitCoords ? lat : resolvedCoords?.lat;
  const effectiveLng = explicitCoords ? lng : resolvedCoords?.lng;
  const hasCoords = isValidCoord(effectiveLat) && isValidCoord(effectiveLng);
  const fallbackCity = cleanLocation(location || focusLabel || label || "Local area");

  useEffect(() => {
    if (explicitCoords || staticFallback) return;

    let cancelled = false;
    const targetLocation = location || focusLabel || label;

    if (!targetLocation) {
      setResolvedCoords(null);
      return;
    }

    geocodeLocation(targetLocation).then((coords) => {
      if (!cancelled) setResolvedCoords(coords);
    });

    return () => {
      cancelled = true;
    };
  }, [explicitCoords, focusLabel, label, location, staticFallback]);

  useEffect(() => {
    if (staticFallback) return;

    initAttemptsRef.current = 0;
    setMapReady(false);
    setWebglError(false);
  }, [bearing, effectiveLat, effectiveLng, hasCoords, interactive, pitch, staticFallback, zoom]);

  useEffect(() => {
    if (staticFallback || !hasCoords || !mapContainerRef.current || webglError) return;

    let map: MapLibreMap | null = null;
    let retryTimer: number | undefined;
    let resizeObserver: ResizeObserver | undefined;
    const animationFrames: number[] = [];
    const resizeTimers: number[] = [];

    const retryInitialization = () => {
      if (initAttemptsRef.current < 2) {
        retryTimer = window.setTimeout(() => {
          setMapRetryKey((key) => key + 1);
        }, 450);
        return;
      }

      setWebglError(true);
    };

    try {
      initAttemptsRef.current += 1;
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: buildEarthMapStyle(),
        center: [effectiveLng!, effectiveLat!],
        zoom,
        pitch,
        bearing,
        attributionControl: false,
        interactive,
        dragPan: interactive,
        scrollZoom: interactive,
        boxZoom: interactive,
        dragRotate: interactive,
        keyboard: interactive,
        doubleClickZoom: interactive,
        touchZoomRotate: interactive,
        fadeDuration: 350,
        maxPitch: 85,
        maxZoom: 19
      });
    } catch (err) {
      console.warn("WebGL is not supported or failed to initialize, falling back to static view:", err);
      retryInitialization();
      return;
    }

    mapRef.current = map;
    const camera = {
      center: [effectiveLng!, effectiveLat!] as [number, number],
      zoom,
      pitch,
      bearing
    };
    const applyStreetCamera = () => {
      if (map) {
        map.resize();
        map.jumpTo(camera);
      }
    };

    const scheduleCameraRefresh = (delay = 0) => {
      if (delay > 0) {
        resizeTimers.push(window.setTimeout(applyStreetCamera, delay));
        return;
      }

      animationFrames.push(window.requestAnimationFrame(() => {
        animationFrames.push(window.requestAnimationFrame(applyStreetCamera));
      }));
    };

    if (interactive) {
      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showCompass: true,
          showZoom: true
        }),
        "bottom-right"
      );
    }

    applyStreetCamera();
    map.once("load", () => {
      setMapReady(true);
      applyStreetCamera();
    });
    map.once("idle", () => {
      setMapReady(true);
      applyStreetCamera();
    });
    map.once("error", (event) => {
      if (event?.error?.message?.toLowerCase().includes("webgl")) {
        retryInitialization();
      }
    });

    const canvas = map.getCanvas();
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setMapReady(false);
      setMapRetryKey((key) => key + 1);
    };
    const handleContextRestored = () => {
      setMapReady(false);
      setMapRetryKey((key) => key + 1);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => scheduleCameraRefresh());
      resizeObserver.observe(mapContainerRef.current);
      if (mapContainerRef.current.parentElement) {
        resizeObserver.observe(mapContainerRef.current.parentElement);
      }
    }

    scheduleCameraRefresh();
    scheduleCameraRefresh(250);
    scheduleCameraRefresh(900);

    return () => {
      if (retryTimer) window.clearTimeout(retryTimer);
      resizeTimers.forEach((timer) => window.clearTimeout(timer));
      animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
      resizeObserver?.disconnect();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      if (map) {
        try {
          map.remove();
        } catch (e) {
          // ignore
        }
      }
      mapRef.current = null;
    };
  }, [bearing, effectiveLat, effectiveLng, hasCoords, interactive, mapRetryKey, pitch, staticFallback, zoom, webglError]);

  if (staticFallback) {
    return (
      <div className="absolute inset-0 z-0">
        <LocalAreaFallback fallbackImage={fallbackImage} label={label} />
      </div>
    );
  }

  if (!hasCoords) {
    return (
      <div className="absolute inset-0 z-0">
        <LocalAreaFallback fallbackImage={fallbackImage} label={label} />
      </div>
    );
  }

  if (webglError) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <LocalAreaFallback fallbackImage={fallbackImage} label={label} muted />
        <InteractiveMap
          city={fallbackCity}
          latitude={effectiveLat}
          longitude={effectiveLng}
          className="local-area-leaflet-fallback absolute inset-0 h-full min-h-0 w-full rounded-none border-0"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.08)_54%,rgba(0,0,0,0.42)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/70 to-transparent" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden bg-black ${mapReady ? "local-area-backdrop--ready" : "local-area-backdrop--loading"}`}>
      <LocalAreaFallback fallbackImage={fallbackImage} label={label} muted />
      <div ref={mapContainerRef} className="local-area-map" />
      <div className="local-area-focus-reticle" aria-hidden="true">
        <span />
      </div>
      {(focusLabel || focusDescription) && (
        <div className="pointer-events-none absolute left-4 top-4 z-[12] max-w-[min(28rem,calc(100%-2rem))] rounded-md border border-white/15 bg-black/42 px-4 py-3 text-white shadow-[0_18px_54px_rgba(0,0,0,0.38)] backdrop-blur-md md:left-6 md:top-6">
          {focusLabel && (
            <p className="font-display text-sm tracking-wide text-white md:text-base">
              {focusLabel}
            </p>
          )}
          {focusDescription && (
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold/90">
              {focusDescription}
            </p>
          )}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.04)_54%,rgba(0,0,0,0.36)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/70 to-transparent" />
    </div>
  );
}
