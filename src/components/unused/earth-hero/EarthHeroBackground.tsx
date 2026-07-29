import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import maplibregl, { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cityCoordinates } from "@/lib/cityCoordinates";
import { usCityCoordinates } from "@/lib/usCityCoordinates";
import { buildEarthMapStyle, EARTH_FINAL_PITCH, EARTH_FINAL_ZOOM } from "@/components/earth/mapStyle";

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
const MOBILE_QUERY = "(max-width: 767px)";
const SITE_FOCUS_COORDS = {
  GB: { lat: 54.4, lng: -2.6 },
  US: { lat: 39.8, lng: -98.6 }
};
const EARTH_HERO_IMAGES = {
  GB: {
    day: {
      src: "/assets/archive/earth-hero/earth-hero/earth-hero-day-gb-full.webp",
      srcSet: "/assets/archive/earth-hero/earth-hero/earth-hero-day-gb-1280.webp 1280w, /assets/archive/earth-hero/earth-hero/earth-hero-day-gb-full.webp 1672w"
    },
    night: {
      src: "/assets/archive/earth-hero/earth-hero/earth-hero-night-gb-full.webp",
      srcSet: "/assets/archive/earth-hero/earth-hero/earth-hero-night-gb-1280.webp 1280w, /assets/archive/earth-hero/earth-hero/earth-hero-night-gb-full.webp 1672w"
    }
  },
  US: {
    day: {
      src: "/assets/archive/earth-hero/earth-hero/earth-hero-day-us-full.webp",
      srcSet: "/assets/archive/earth-hero/earth-hero/earth-hero-day-us-1280.webp 1280w, /assets/archive/earth-hero/earth-hero/earth-hero-day-us-full.webp 1672w"
    },
    night: {
      src: "/assets/archive/earth-hero/earth-hero/earth-hero-night-us-full.webp",
      srcSet: "/assets/archive/earth-hero/earth-hero/earth-hero-night-us-1280.webp 1280w, /assets/archive/earth-hero/earth-hero/earth-hero-night-us-full.webp 1672w"
    }
  }
} as const;

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

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

function rotationForLocation(location?: string | null, countryCode?: string | null) {
  const coords = getCoords(location);
  if (!coords) return rotationForSite(countryCode);
  return rotationForCoords(coords);
}

export function EarthHeroBackground({ countryCode = "GB" }: EarthHeroBackgroundProps) {
  const [webGLAvailable, setWebGLAvailable] = useState(() => checkWebGLSupport());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const launchIdRef = useRef(0);
  const stateRef = useRef({
    targetRotation: rotationForSite(countryCode),
    isLaunching: false
  });
  const siteKey = countryCode === "US" ? "US" : "GB";
  const heroImages = EARTH_HERO_IMAGES[siteKey];

  useEffect(() => {
    if (stateRef.current.isLaunching) return;
    stateRef.current.targetRotation = rotationForSite(countryCode);
  }, [countryCode]);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        reduceMotion: "(prefers-reduced-motion: reduce)"
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions as { isDesktop: boolean; reduceMotion: boolean };

        gsap.set(".earth-hero-visual-frame", {
          scale: isDesktop ? 1.015 : 1.04,
          xPercent: isDesktop ? 0 : -1,
          yPercent: isDesktop ? 0 : 1,
          transformOrigin: "50% 48%"
        });

        if (reduceMotion) return undefined;

        // Perpetual ambient breath. Country focus must stay locked, so amplitudes
        // are kept tight: no translation, micro-rotation only, scale breath only.
        const ambient = gsap.timeline({
          repeat: -1,
          yoyo: true,
          defaults: { ease: "sine.inOut" }
        });

        ambient
          .to(".earth-hero-visual-frame", {
            duration: isDesktop ? 22 : 24,
            scale: isDesktop ? 1.035 : 1.06,
            rotation: isDesktop ? 0.25 : 0.15
          }, 0)
          .to(".earth-hero-stars", {
            duration: isDesktop ? 22 : 24,
            xPercent: isDesktop ? 0.6 : 0.35,
            yPercent: isDesktop ? -0.45 : -0.25,
            opacity: isDesktop ? 0.72 : 0.54
          }, 0);

        return () => ambient.kill();
      }
    );

    return () => mm.revert();
  }, []);

  useEffect(() => {
    if (!webGLAvailable || !mapRef.current || mapInstanceRef.current) return;

    try {
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

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.warn("[EarthHeroBackground] Failed to initialize MapLibre Map due to WebGL issues:", err);
      setWebGLAvailable(false);
    }
  }, [countryCode, webGLAvailable]);

  useEffect(() => {
    if (!webGLAvailable || !canvasRef.current) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (err) {
      console.warn("[EarthHeroBackground] Failed to initialize Three.js WebGLRenderer:", err);
      setWebGLAvailable(false);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.3);

    const loader = new THREE.TextureLoader();
    const earthTexture = loader.load("/assets/archive/earth-hero/textures/earth_atmos_2048.webp");
    const cloudTexture = loader.load("/assets/archive/earth-hero/textures/earth_clouds_1024.webp");
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.colorSpace = THREE.SRGBColorSpace;

    const initialRotation = rotationForSite(countryCode);
    stateRef.current.targetRotation = initialRotation;

    const globe = new THREE.Group();
    globe.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    scene.add(globe);

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.16, 96, 96),
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.7,
        metalness: 0.03
      })
    );
    globe.add(earth);

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.19, 96, 96),
      new THREE.MeshLambertMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.34,
        depthWrite: false
      })
    );
    globe.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.29, 96, 96),
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
    let isFirstFrame = true;
    let lastTime = performance.now();
    const animate = () => {
      const state = stateRef.current;
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isFirstFrame) {
        isFirstFrame = false;
        wrapperRef.current?.classList.add("webgl-ready");
      }

      if (!state.isLaunching) {
        // Slowly spin the earth continuously around its Y axis
        // 0.02 radians per second is a beautiful slow spin (~5 minutes per rotation)
        state.targetRotation.y += 0.02 * delta;
      }

      globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, state.targetRotation.x, 0.025);
      globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, state.targetRotation.y, state.isLaunching ? 0.04 : 0.018);
      globe.rotation.z = THREE.MathUtils.lerp(globe.rotation.z, state.targetRotation.z, 0.025);
      
      // Rotate clouds slightly faster for a rich multi-layered depth effect
      clouds.rotation.y += 0.028 * delta;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const syncLocation = (event: Event) => {
      const detail = (event as CustomEvent<EarthLaunchDetail>).detail;
      stateRef.current.targetRotation = rotationForLocation(detail?.location, countryCode);
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
      wrapperRef.current?.classList.add("earth-launching");

      const coords = await resolveCoords(detail?.location);
      if (launchIdRef.current !== currentLaunchId) return;

      const map = mapInstanceRef.current;
      const isMobileFlight = window.matchMedia(MOBILE_QUERY).matches;
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

      const waitForMapReady = () =>
        new Promise<void>((resolve) => {
          if (map.loaded() || map.isStyleLoaded()) {
            resolve();
            return;
          }

          let resolved = false;
          const done = () => {
            if (resolved) return;
            resolved = true;
            resolve();
          };

          map.once("load", done);
          window.setTimeout(done, 1400);
        });

      const fly = (options: maplibregl.FlyToOptions) =>
        new Promise<void>((resolve) => {
          let resolved = false;
          const done = () => {
            if (resolved) return;
            resolved = true;
            resolve();
          };
          map.once("moveend", done);
          map.flyTo(options);
          window.setTimeout(done, (options.duration || 0) + 900);
        });

      try {
        await waitForMapReady();
        map.stop();
        map.resize();
        map.jumpTo({
          center: countryCode === "US" ? [-98.6, 39.8] : [-2.6, 54.4],
          zoom: 0.35,
          pitch: 0,
          bearing: countryCode === "US" ? 8 : -12
        });
        wrapperRef.current?.classList.add("earth-map-active");
        await new Promise((resolve) => window.setTimeout(resolve, isMobileFlight ? 90 : 140));

        await fly({
          center: [coords.lng, coords.lat],
          zoom: isMobileFlight ? 6.15 : 5.4,
          pitch: 10,
          bearing: finalBearing - 34,
          duration: isMobileFlight ? 1650 : 2200,
          essential: true,
          curve: isMobileFlight ? 1.62 : 1.45,
          speed: isMobileFlight ? 0.78 : 0.65
        });
        await fly({
          center: [coords.lng, coords.lat],
          zoom: isMobileFlight ? 13.2 : 12.4,
          pitch: isMobileFlight ? 54 : 50,
          bearing: finalBearing - 12,
          duration: isMobileFlight ? 1800 : 2400,
          essential: true,
          curve: isMobileFlight ? 1.36 : 1.25,
          speed: isMobileFlight ? 0.82 : 0.7
        });
        await fly({
          center: [coords.lng, coords.lat],
          zoom: EARTH_FINAL_ZOOM,
          pitch: EARTH_FINAL_PITCH,
          bearing: finalBearing,
          duration: isMobileFlight ? 2050 : 2600,
          essential: true,
          curve: isMobileFlight ? 1.12 : 1.05,
          speed: isMobileFlight ? 0.72 : 0.55
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
    };
  }, [countryCode, webGLAvailable]);

  return (
    <div ref={wrapperRef} className="earth-hero-bg" aria-hidden="true">
      <div className="earth-hero-deep-space" />
      <div className="earth-hero-milky-way" />
      <div className="earth-hero-galaxies" />
      <div className="earth-hero-stars" />
      <div className="earth-hero-collision earth-hero-collision-a" />
      <div className="earth-hero-collision earth-hero-collision-b" />
      <div className="earth-hero-visual" data-country={siteKey.toLowerCase()}>
        <div className="earth-hero-visual-frame">
          <div className="earth-hero-visual-layer earth-hero-visual-layer--day">
            <img
              src={heroImages.day.src}
              srcSet={heroImages.day.srcSet}
              sizes="100vw"
              alt=""
              decoding="async"
              className={`earth-hero-visual-image earth-hero-visual-image--${siteKey.toLowerCase()}`}
            />
          </div>
          <div className="earth-hero-visual-layer earth-hero-visual-layer--night">
            <img
              src={heroImages.night.src}
              srcSet={heroImages.night.srcSet}
              sizes="100vw"
              alt=""
              decoding="async"
              className={`earth-hero-visual-image earth-hero-visual-image--${siteKey.toLowerCase()}`}
            />
          </div>
          <svg
            className={`earth-hero-country-glow earth-hero-country-glow--${siteKey.toLowerCase()}`}
            viewBox="0 0 1000 562"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <filter id="earth-country-glow-outer" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                </feMerge>
              </filter>
              <linearGradient id="earth-country-glow-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5dc8a" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#e3c063" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#b8893f" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            {siteKey === "GB" ? (
              <g filter="url(#earth-country-glow-outer)">
                {/* Great Britain  -  hand-fitted to the GB photo */}
                <path
                  d="M 540 198 L 552 195 L 565 200 L 575 215 L 580 235 L 590 252 L 600 275 L 605 295 L 615 315 L 630 335 L 650 350 L 665 370 L 680 385 L 678 405 L 660 420 L 645 432 L 650 445 L 635 452 L 605 458 L 575 462 L 545 460 L 520 455 L 500 450 L 482 442 L 478 425 L 488 412 L 510 405 L 502 392 L 482 380 L 470 368 L 472 350 L 462 335 L 470 320 L 478 305 L 472 290 L 462 275 L 470 258 L 460 240 L 470 225 L 478 215 L 480 200 L 495 195 L 515 198 L 530 198 Z"
                  fill="none"
                  stroke="url(#earth-country-glow-gold)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* Northern Ireland (NE corner of the Irish island; political border cut) */}
                <path
                  d="M 408 282 L 418 285 L 425 290 L 428 300 L 430 312 L 425 322 L 415 325 L 402 320 L 392 315 L 388 305 L 385 295 L 392 285 L 402 282 Z"
                  fill="none"
                  stroke="url(#earth-country-glow-gold)"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            ) : (
              <g filter="url(#earth-country-glow-outer)">
                {/* Contiguous-48  -  hand-fitted to the US photo */}
                <path
                  d="M 145 200 L 160 220 L 165 240 L 155 265 L 145 290 L 142 320 L 155 345 L 175 365 L 220 372 L 260 378 L 305 380 L 340 388 L 355 400 L 370 408 L 385 405 L 395 415 L 408 420 L 420 415 L 432 425 L 425 445 L 442 440 L 450 425 L 458 410 L 460 392 L 465 372 L 470 350 L 462 332 L 472 315 L 478 298 L 472 280 L 465 265 L 450 248 L 430 235 L 400 222 L 365 215 L 330 205 L 295 200 L 265 195 L 230 188 L 195 185 L 165 192 L 145 195 Z"
                  fill="none"
                  stroke="url(#earth-country-glow-gold)"
                  strokeWidth="2.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
      <div className="earth-hero-tiny-ship">
        <span className="earth-hero-ship-body" />
        <span className="earth-hero-ship-window" />
        <span className="earth-hero-ship-flame" />
      </div>
      <div ref={mapRef} className="earth-map-container" />
      <canvas ref={canvasRef} className="earth-hero-canvas" />
      <div className="earth-hero-scan" />
    </div>
  );
}
