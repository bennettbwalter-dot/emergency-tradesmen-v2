import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleLiveAlertsRequest } from "./src/lib/alerts/server";

const chunkGroups: Record<string, string[]> = {
  "vendor-react": ["react", "react-dom", "react-router-dom"],
  "vendor-ui": [
    "@radix-ui/react-dialog",
    "@radix-ui/react-dropdown-menu",
    "@radix-ui/react-select",
    "@radix-ui/react-tabs",
    "@radix-ui/react-accordion",
    "@radix-ui/react-toast",
    "@radix-ui/react-tooltip",
  ],
  "vendor-query": ["@tanstack/react-query"],
  "vendor-animation": ["framer-motion", "motion"],
  "vendor-maps": ["leaflet", "react-leaflet", "maplibre-gl"],
  "vendor-analytics": ["posthog-js"],
  "vendor-sentry": ["@sentry/react"],
  "vendor-supabase": ["@supabase/supabase-js"],
  "vendor-icons": ["lucide-react"],
  "vendor-forms": ["react-hook-form", "zod", "@hookform/resolvers"],
  "vendor-charts": ["recharts"],
  "vendor-firebase": ["firebase"],
  "vendor-3d": ["three", "ogl", "gsap", "lenis"],
  "vendor-carousel": ["embla-carousel-react"],
  "vendor-speech": ["microsoft-cognitiveservices-speech-sdk"],
  "vendor-transformers": ["@huggingface/transformers"],
  "vendor-markdown": ["react-markdown", "rehype-raw", "remark-gfm", "dompurify"],
};

function manualChunks(id: string) {
  const normalizedId = id.replace(/\\/g, "/");
  if (!normalizedId.includes("/node_modules/")) return undefined;

  for (const [chunkName, packages] of Object.entries(chunkGroups)) {
    if (packages.some((pkg) => normalizedId.includes(`/node_modules/${pkg}/`))) {
      return chunkName;
    }
  }

  return undefined;
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    {
      name: "local-live-alerts-api",
      configureServer(server) {
        server.middlewares.use("/api/live-alerts", async (req, res) => {
          try {
            const host = req.headers.host || "127.0.0.1:3000";
            const request = new Request(`http://${host}${req.originalUrl || req.url || ""}`, {
              method: req.method || "GET",
              headers: new Headers(Object.entries(req.headers).flatMap(([key, value]) => {
                if (Array.isArray(value)) return value.map((entry) => [key, entry] as [string, string]);
                return value ? [[key, String(value)] as [string, string]] : [];
              })),
            });
            const response = await handleLiveAlertsRequest(request);
            res.statusCode = response.status;
            response.headers.forEach((value, key) => res.setHeader(key, value));
            res.end(await response.text());
          } catch (error) {
            console.warn("[vite] live alerts API failed", error);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({
              alerts: [],
              generatedAt: new Date().toISOString(),
              country: "GB",
              locationLabel: "United Kingdom",
              partialFailure: true,
              failedSources: ["Live alerts"],
            }));
          }
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "react": path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
}));
