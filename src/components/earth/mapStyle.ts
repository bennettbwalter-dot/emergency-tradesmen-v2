import type { StyleSpecification } from "maplibre-gl";

export const EARTH_FINAL_ZOOM = 17.15;
export const EARTH_FINAL_PITCH = 72;

export function buildEarthMapStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        ],
        tileSize: 256,
        attribution: "Tiles © Esri"
      },
      openfreemap: {
        type: "vector",
        url: "https://tiles.openfreemap.org/planet",
        attribution: "Map data © OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
        paint: {
          "raster-saturation": 0.08,
          "raster-contrast": 0.08,
          "raster-brightness-min": 0.02,
          "raster-brightness-max": 0.94
        }
      },
      {
        id: "earth-roads-glow",
        type: "line",
        source: "openfreemap",
        "source-layer": "transportation",
        minzoom: 11,
        filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary", "motorway", "trunk"]]],
        paint: {
          "line-color": "rgba(255, 215, 145, 0.38)",
          "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.25, 16, 2.8, 18, 7],
          "line-blur": 1.2
        }
      },
      {
        id: "earth-roads",
        type: "line",
        source: "openfreemap",
        "source-layer": "transportation",
        minzoom: 12,
        paint: {
          "line-color": "rgba(246, 239, 218, 0.68)",
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.2, 16, 1.1, 18, 3.2]
        }
      },
      {
        id: "earth-buildings",
        type: "fill-extrusion",
        source: "openfreemap",
        "source-layer": "building",
        minzoom: 14.5,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14.5,
            "#2f363c",
            17,
            "#8a8f8d"
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            14.5,
            0,
            16,
            ["coalesce", ["get", "render_height"], ["get", "height"], 14]
          ],
          "fill-extrusion-base": [
            "coalesce",
            ["get", "render_min_height"],
            ["get", "min_height"],
            0
          ],
          "fill-extrusion-opacity": 0.76
        }
      },
      {
        id: "earth-place-labels",
        type: "symbol",
        source: "openfreemap",
        "source-layer": "place",
        minzoom: 9,
        layout: {
          "text-field": ["coalesce", ["get", "name:en"], ["get", "name"]],
          "text-font": ["Noto Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 9, 11, 16, 15],
          "text-anchor": "center",
          "text-allow-overlap": false
        },
        paint: {
          "text-color": "#fff8df",
          "text-halo-color": "rgba(0, 0, 0, 0.78)",
          "text-halo-width": 1.4
        }
      }
    ]
  };
}
