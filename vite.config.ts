import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { handleLiveAlertsRequest } from "./src/lib/alerts/server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Map packages must be matched BEFORE the generic `react` test:
            // `react-leaflet` contains "react", so it was landing in
            // vendor-react, which every page loads. That made vendor-react
            // import leaflet (~322 kB gzipped) on the landing page and every
            // other route that has no map at all.
            if (id.includes('leaflet') || id.includes('react-leaflet') || id.includes('maplibre-gl')) {
              return 'vendor-maps';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-animation';
            }
            if (id.includes('leaflet') || id.includes('react-leaflet') || id.includes('maplibre-gl')) {
              return 'vendor-maps';
            }
            if (id.includes('posthog-js')) {
              return 'vendor-analytics';
            }
            if (id.includes('@sentry/react')) {
              return 'vendor-sentry';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform/resolvers')) {
              return 'vendor-forms';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('three') || id.includes('ogl') || id.includes('gsap') || id.includes('lenis')) {
              return 'vendor-3d';
            }
            if (id.includes('embla-carousel-react')) {
              return 'vendor-carousel';
            }
            if (id.includes('microsoft-cognitiveservices-speech-sdk')) {
              return 'vendor-speech';
            }
            if (id.includes('@xenova/transformers') || id.includes('@huggingface/transformers')) {
              return 'vendor-transformers';
            }
            if (id.includes('react-markdown') || id.includes('rehype-raw') || id.includes('remark-gfm') || id.includes('dompurify')) {
              return 'vendor-markdown';
            }
            return 'vendor';
          }
        },
      },
    },
  },
}));
