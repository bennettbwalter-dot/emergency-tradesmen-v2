import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cityCoordinates } from "@/lib/cityCoordinates";
import { usCityCoordinates } from "@/lib/usCityCoordinates";
import { buildEarthMapStyle, EARTH_FINAL_PITCH, EARTH_FINAL_ZOOM } from "./mapStyle";
import type { Map as MapLibreMap, FlyToOptions } from "maplibre-gl";

type EarthLaunchDetail = {
  location?: string;
  target?: string;
};

type EarthCompleteDetail = EarthLaunchDetail & {
  lat: number;
  lng: number;
  zoom: number;
  pitch: number;
  bearing: number;
};

type EarthHeroBackgroundProps = {
  countryCode?: string;
};

const FALLBACK_COORDS = { lat: 51.5074, lng: -0.1278 };
const FALLBACK_DURATION = 9800;
const EARTH_SEGMENTS = 64;
const MAX_PIXEL_RATIO = 1.5;
const SITE_FOCUS_COORDS = {
  GB: { lat: 54.4, lng: -2.6 },
  US: { lat: 39.8, lng: -98.6 }
};

function rotationForCoords(coords: { lat: number; lng: number }) {
  const lat = THREE.MathUtils.degToRad(coords.lat);
  const lng = THREE.MathUtils.degToRad(coords.lng);
  return {
    x: THREE.MathUtils.clamp(lat * 0.45, -0.55, 0.55),
    y: -lng - Math.PI * 0.54,
    z: 0.06
  };
}

function rotationForSite(countryCode?: string | null) {
  return rotationForCoords(countryCode === "US" ? SITE_FOCUS_COORDS.US : SITE_FOCUS_COORDS.GB);
}

function normalizeCityName(value?: string | null) {
  if (!value) return "";
  return value
    .split(",")[0]
    .replace(/-/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCoords(location?: string | null) {
  const city = normalizeCityName(location);
  return cityCoordinates[city] || usCityCoordinates[city] || null;
}

async function resolveCoords(location?: string | null) {
  const known = getCoords(location);
  if (known) return known;
  if (!location?.trim()) return FALLBACK_COORDS;

  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      limit: "1",
      countrycodes: "gb,us",
      q: location.trim()
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return FALLBACK_COORDS;
    const results = await response.json() as Array<{ lat?: string; lon?: string }>;
    const first = results[0];
    const lat = Number(first?.lat);
    const lng = Number(first?.lon);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  } catch (error) {
    console.warn("[EarthHeroBackground] Location lookup failed", error);
  }

  return FALLBACK_COORDS;
}

function rotationForLocation(location?: string | null, countryCode?: string | null) {
  const coords = getCoords(location);
  if (!coords) return rotationForSite(countryCode);
  return rotationForCoords(coords);
}

export function EarthHeroBackground({ countryCode = "GB" }: EarthHeroBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const mapModuleRef = useRef<typeof import("maplibre-gl") | null>(null);
  const mapReadyPromiseRef = useRef<Promise<MapLibreMap | null> | null>(null);
  const launchIdRef = useRef(0);
  const stateRef = useRef({
    targetRotation: rotationForSite(countryCode),
    isLaunching: false
  });

  useEffect(() => {
    if (stateRef.current.isLaunching) return;
    stateRef.current.targetRotation = rotationForSite(countryCode);
  }, [countryCode]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.3);

    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load("/assets/earth_atmos_2048.webp");
    const cloudTexture = loader.load("/assets/earth_clouds_1024.webp");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.colorSpace = THREE.SRGBColorSpace;

    const initialRotation = rotationForSite(countryCode);
    stateRef.current.targetRotation = initialRotation;

    const globe = new THREE.Group();
    globe.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    scene.add(globe);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.16, EARTH_SEGMENTS, EARTH_SEGMENTS),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.7,
        metalness: 0.03
      })
    );
    globe.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.19, EARTH_SEGMENTS, EARTH_SEGMENTS),
      new THREE.MeshLambertMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.34,
        depthWrite: false
      })
    );
    globe.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.29, EARTH_SEGMENTS, EARTH_SEGMENTS),
      new THREE.ShaderMaterial({
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        uniforms: {
          glowColor: { value: new THREE.Color(0x7ee4ff) }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.78 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.3);
            gl_FragColor = vec4(glowColor, intensity * 0.68);
          }
        `
      })
    );
    globe.add(atmosphere);

    scene.add(new THREE.HemisphereLight(0xcaf2ff, 0x020305, 1.25));
    const sun = new THREE.DirectionalLight(0xffedc2, 3.2);
    sun.position.set(-4, 2.2, 6);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x71d9ff, 1.5);
    rim.position.set(5, -2, -2.5);
    scene.add(rim);

    const resize = () => {
      const width = window.innerWidth;
      const height = Math.max(window.innerHeight, wrapperRef.current?.clientHeight || 720);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 480 ? 13.8 : width < 700 ? 12.3 : 7.25;
      camera.updateProjectionMatrix();
    };

    let animationId = 0;
    let lastRenderTime = 0;
    const animate = (time = 0) => {
      const state = stateRef.current;
      const targetFrameMs = state.isLaunching ? 16 : 33;
      if (time - lastRenderTime < targetFrameMs) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      lastRenderTime = time;

      globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, state.targetRotation.x, 0.025);
      globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, state.targetRotation.y, state.isLaunching ? 0.04 : 0.018);
      globe.rotation.z = THREE.MathUtils.lerp(globe.rotation.z, state.targetRotation.z, 0.025);
      if (!state.isLaunching) {
        globe.rotation.y += 0.0008;
      }
      clouds.rotation.y += 0.0014;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const syncLocation = (event: Event) => {
      const detail = (event as CustomEvent<EarthLaunchDetail>).detail;
      stateRef.current.targetRotation = rotationForLocation(detail?.location, countryCode);
    };

    const ensureMap = async () => {
      if (mapInstanceRef.current) return mapInstanceRef.current;
      if (mapReadyPromiseRef.current) return mapReadyPromiseRef.current;
      if (!mapRef.current) return null;

      mapReadyPromiseRef.current = (async () => {
        await import("maplibre-gl/dist/maplibre-gl.css");
        const maplibregl = await import("maplibre-gl");
        mapModuleRef.current = maplibregl;

        if (!mapRef.current) return null;

        const map = new maplibregl.Map({
          container: mapRef.current,
          style: buildEarthMapStyle(),
          center: countryCode === "US" ? [-98.6, 39.8] : [-2.6, 54.4],
          zoom: 0.35,
          pitch: 0,
          bearing: countryCode === "US" ? 8 : -12,
          attributionControl: false,
          interactive: false,
          fadeDuration: 0,
          maxPitch: 85
        });

        mapInstanceRef.current = map;
        await new Promise<void>((resolve) => {
          if (map.loaded()) {
            resolve();
            return;
          }
          map.once("load", () => resolve());
          window.setTimeout(resolve, 1400);
        });
        return map;
      })();

      return mapReadyPromiseRef.current;
    };

    const launch = async (event: Event) => {
      const detail = (event as CustomEvent<EarthLaunchDetail>).detail;
      const currentLaunchId = launchIdRef.current + 1;
      launchIdRef.current = currentLaunchId;
      const targetRotation = rotationForLocation(detail?.location, countryCode);
      stateRef.current = {
        targetRotation: {
          x: targetRotation.x * 0.75,
          y: targetRotation.y + Math.PI * 1.35,
          z: targetRotation.z
        },
        isLaunching: true
      };
      wrapperRef.current?.classList.add("earth-launching", "earth-map-active");

      const coords = await resolveCoords(detail?.location);
      if (launchIdRef.current !== currentLaunchId) return;

      const map = await ensureMap();
      const finalBearing = ((coords.lng * 0.8) % 80) - 22;
      const completeDetail: EarthCompleteDetail = {
        ...detail,
        lat: coords.lat,
        lng: coords.lng,
        zoom: EARTH_FINAL_ZOOM,
        pitch: EARTH_FINAL_PITCH,
        bearing: finalBearing
      };

      let hasCompleted = false;
      const complete = () => {
        if (hasCompleted) return;
        if (launchIdRef.current !== currentLaunchId) return;
        hasCompleted = true;
        window.dispatchEvent(new CustomEvent("emergency-earth:complete", { detail: completeDetail }));
      };

      const fallbackTimer = window.setTimeout(complete, FALLBACK_DURATION);

      if (!map) {
        complete();
        return;
      }

      const fly = (options: FlyToOptions) =>
        new Promise<void>((resolve) => {
          const done = () => resolve();
          map.once("moveend", done);
          map.flyTo(options);
          window.setTimeout(done, (options.duration || 0) + 900);
        });

      try {
        map.resize();
        map.jumpTo({
          center: countryCode === "US" ? [-98.6, 39.8] : [-2.6, 54.4],
          zoom: 0.35,
          pitch: 0,
          bearing: countryCode === "US" ? 8 : -12
        });
        await fly({
          center: [coords.lng, coords.lat],
          zoom: 5.4,
          pitch: 10,
          bearing: finalBearing - 34,
          duration: 2200,
          essential: true,
          curve: 1.45,
          speed: 0.65
        });
        await fly({
          center: [coords.lng, coords.lat],
          zoom: 12.4,
          pitch: 50,
          bearing: finalBearing - 12,
          duration: 2400,
          essential: true,
          curve: 1.25,
          speed: 0.7
        });
        await fly({
          center: [coords.lng, coords.lat],
          zoom: EARTH_FINAL_ZOOM,
          pitch: EARTH_FINAL_PITCH,
          bearing: finalBearing,
          duration: 2600,
          essential: true,
          curve: 1.05,
          speed: 0.55
        });
      } catch (error) {
        console.warn("[EarthHeroBackground] Street-level flight failed", error);
      } finally {
        window.clearTimeout(fallbackTimer);
        complete();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("emergency-earth:sync-location", syncLocation);
    window.addEventListener("emergency-earth:launch", launch);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("emergency-earth:sync-location", syncLocation);
      window.removeEventListener("emergency-earth:launch", launch);
      renderer.dispose();
      earth.geometry.dispose();
      clouds.geometry.dispose();
      atmosphere.geometry.dispose();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      mapReadyPromiseRef.current = null;
      mapModuleRef.current = null;
    };
  }, [countryCode]);

  return (
    <div ref={wrapperRef} className="earth-hero-bg" aria-hidden="true">
      <div className="earth-hero-deep-space" />
      <div className="earth-hero-milky-way" />
      <div className="earth-hero-stars" />
      <div ref={mapRef} className="earth-map-container" />
      <canvas ref={canvasRef} className="earth-hero-canvas" />
    </div>
  );
}
