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
const EARTH_SEGMENTS = 96;
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

function readThemeMode(): "light" | "dark" {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

type SceneRefs = {
  earthMaterial: THREE.MeshPhongMaterial;
  cloudsMaterial: THREE.MeshLambertMaterial;
  atmosphereMaterial: THREE.ShaderMaterial;
  sunLight: THREE.DirectionalLight;
  rimLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  sunGroup: THREE.Group;
  sunHaloMaterial: THREE.ShaderMaterial;
  dayTexture: THREE.Texture;
  nightTexture: THREE.Texture;
  specularTexture: THREE.Texture;
};

function applyThemeToScene(refs: SceneRefs, mode: "light" | "dark") {
  const {
    earthMaterial,
    cloudsMaterial,
    atmosphereMaterial,
    sunLight,
    rimLight,
    hemiLight,
    sunGroup,
    sunHaloMaterial,
    dayTexture,
    nightTexture,
    specularTexture
  } = refs;
  const glowColor = (atmosphereMaterial.uniforms as { glowColor: { value: THREE.Color } }).glowColor.value;
  const haloColor = (sunHaloMaterial.uniforms as { glowColor: { value: THREE.Color } }).glowColor.value;
  if (mode === "light") {
    earthMaterial.map = dayTexture;
    earthMaterial.emissiveMap = null;
    earthMaterial.emissive.setHex(0x000000);
    earthMaterial.emissiveIntensity = 0;
    earthMaterial.specularMap = specularTexture;
    earthMaterial.specular.setHex(0x4a6886);
    earthMaterial.shininess = 22;
    earthMaterial.needsUpdate = true;
    cloudsMaterial.opacity = 0.58;
    cloudsMaterial.needsUpdate = true;
    glowColor.setHex(0x9ad6ff);
    hemiLight.color.setHex(0xeaf6ff);
    hemiLight.groundColor.setHex(0x3a5870);
    hemiLight.intensity = 1.4;
    sunLight.color.setHex(0xfff4d6);
    sunLight.intensity = 3.6;
    rimLight.color.setHex(0x8fd5ff);
    rimLight.intensity = 1.0;
    sunGroup.visible = true;
    haloColor.setHex(0xffe6a8);
  } else {
    earthMaterial.map = nightTexture;
    earthMaterial.emissiveMap = nightTexture;
    earthMaterial.emissive.setHex(0xffd29a);
    earthMaterial.emissiveIntensity = 1.55;
    earthMaterial.specularMap = null;
    earthMaterial.specular.setHex(0x080808);
    earthMaterial.shininess = 4;
    earthMaterial.needsUpdate = true;
    cloudsMaterial.opacity = 0.14;
    cloudsMaterial.needsUpdate = true;
    glowColor.setHex(0x6ad8ff);
    hemiLight.color.setHex(0x12243a);
    hemiLight.groundColor.setHex(0x010205);
    hemiLight.intensity = 0.5;
    sunLight.color.setHex(0xffc880);
    sunLight.intensity = 0.9;
    rimLight.color.setHex(0x71d9ff);
    rimLight.intensity = 1.5;
    sunGroup.visible = false;
    haloColor.setHex(0xffd29a);
  }
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
  const sceneRefsRef = useRef<SceneRefs | null>(null);
  const themeModeRef = useRef<"light" | "dark">(readThemeMode());

  useEffect(() => {
    const apply = () => {
      const mode = readThemeMode();
      themeModeRef.current = mode;
      if (sceneRefsRef.current) applyThemeToScene(sceneRefsRef.current, mode);
    };
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 5.4);

    const loader = new THREE.TextureLoader();
    const dayTexture = loader.load("/assets/earth_atmos_2048.webp");
    const nightTexture = loader.load("/assets/earth_lights_4k.jpg");
    const cloudTexture = loader.load("/assets/earth_clouds_1024.webp");
    const normalTexture = loader.load("/assets/earth_normal_2048.jpg");
    const specularTexture = loader.load("/assets/earth_specular_2048.jpg");
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    [dayTexture, nightTexture, cloudTexture, normalTexture, specularTexture].forEach((t) => {
      t.anisotropy = maxAnisotropy;
    });

    const initialRotation = rotationForSite(countryCode);
    stateRef.current.targetRotation = initialRotation;

    const globe = new THREE.Group();
    globe.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    // UK is high latitude: pull globe up a touch so country isn't crowded by chat input below
    globe.position.y = countryCode === "US" ? -0.42 : -0.18;
    scene.add(globe);

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: dayTexture,
      normalMap: normalTexture,
      normalScale: new THREE.Vector2(0.85, 0.85),
      specularMap: specularTexture,
      specular: new THREE.Color(0x4a6886),
      shininess: 22
    });
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.16, EARTH_SEGMENTS, EARTH_SEGMENTS),
      earthMaterial
    );
    globe.add(earth);

    const cloudsMaterial = new THREE.MeshLambertMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.19, EARTH_SEGMENTS, EARTH_SEGMENTS),
      cloudsMaterial
    );
    globe.add(clouds);

    const atmosphereMaterial = new THREE.ShaderMaterial({
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
    });
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.29, EARTH_SEGMENTS, EARTH_SEGMENTS),
      atmosphereMaterial
    );
    globe.add(atmosphere);

    const hemiLight = new THREE.HemisphereLight(0xcaf2ff, 0x020305, 1.25);
    scene.add(hemiLight);
    const sunLight = new THREE.DirectionalLight(0xffedc2, 3.2);
    sunLight.position.set(-4, 2.2, 6);
    scene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x71d9ff, 1.5);
    rimLight.position.set(5, -2, -2.5);
    scene.add(rimLight);

    const sunGroup = new THREE.Group();
    const sunCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfff4d0 })
    );
    sunGroup.add(sunCore);
    const sunHaloMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: { glowColor: { value: new THREE.Color(0xffe6a8) } },
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
          float intensity = pow(0.86 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 1.6);
          gl_FragColor = vec4(glowColor, intensity * 0.9);
        }
      `
    });
    const sunHalo = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 48, 48),
      sunHaloMaterial
    );
    sunGroup.add(sunHalo);
    sunGroup.position.set(-9, 5.2, 0.5);
    scene.add(sunGroup);

    sceneRefsRef.current = {
      earthMaterial,
      cloudsMaterial,
      atmosphereMaterial,
      sunLight,
      rimLight,
      hemiLight,
      sunGroup,
      sunHaloMaterial,
      dayTexture,
      nightTexture,
      specularTexture
    };
    applyThemeToScene(sceneRefsRef.current, themeModeRef.current);

    const resize = () => {
      const width = window.innerWidth;
      const height = Math.max(window.innerHeight, wrapperRef.current?.clientHeight || 720);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // UK is geographically smaller than US: bring camera closer so the country reads at a glance
      const isUK = countryCode !== "US";
      if (isUK) {
        camera.position.z = width < 480 ? 8.8 : width < 700 ? 7.1 : 4.6;
      } else {
        camera.position.z = width < 480 ? 10.2 : width < 700 ? 8.4 : 5.4;
      }
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
      sunCore.geometry.dispose();
      sunHalo.geometry.dispose();
      earthMaterial.dispose();
      cloudsMaterial.dispose();
      atmosphereMaterial.dispose();
      sunHaloMaterial.dispose();
      (sunCore.material as THREE.Material).dispose();
      dayTexture.dispose();
      nightTexture.dispose();
      cloudTexture.dispose();
      normalTexture.dispose();
      specularTexture.dispose();
      sceneRefsRef.current = null;
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
