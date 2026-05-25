import { useEffect, useRef, useState } from "react";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cityCoordinates } from "@/lib/cityCoordinates";
import { usCityCoordinates } from "@/lib/usCityCoordinates";
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
  interactive?: boolean;
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
  interactive = true
}: LocalAreaBackdropProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number } | null>(() =>
    getKnownCoords(location || label)
  );
  const explicitCoords = isValidCoord(lat) && isValidCoord(lng);
  const effectiveLat = explicitCoords ? lat : resolvedCoords?.lat;
  const effectiveLng = explicitCoords ? lng : resolvedCoords?.lng;
  const hasCoords = isValidCoord(effectiveLat) && isValidCoord(effectiveLng);

  useEffect(() => {
    if (explicitCoords) return;

    let cancelled = false;
    const targetLocation = location || label;

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
  }, [explicitCoords, label, location]);

  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
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

    mapRef.current = map;
    const camera = {
      center: [effectiveLng!, effectiveLat!] as [number, number],
      zoom,
      pitch,
      bearing
    };
    const applyStreetCamera = () => {
      map.resize();
      map.jumpTo(camera);
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
    map.once("load", applyStreetCamera);
    map.once("idle", applyStreetCamera);
    const cameraTimer = window.setTimeout(applyStreetCamera, 500);

    return () => {
      window.clearTimeout(cameraTimer);
      map.remove();
      mapRef.current = null;
    };
  }, [bearing, effectiveLat, effectiveLng, hasCoords, interactive, pitch, zoom]);

  if (!hasCoords) {
    return (
      <div className="absolute inset-0 z-0">
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt={label || "Local area"}
            className="h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
        <div className="pointer-events-none absolute inset-0 bg-background/35 backdrop-blur-[2px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black">
      <div ref={mapContainerRef} className="local-area-map" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(0,0,0,0.04)_54%,rgba(0,0,0,0.36)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background/70 to-transparent" />
    </div>
  );
}
