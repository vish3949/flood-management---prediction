"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Location, FloodRiskData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface FloodRiskMapProps {
  location: Location;
  floodData: FloodRiskData;
}

export default function FloodRiskMap({
  location,
  floodData,
}: FloodRiskMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const mapboxToken = "mapboxToken";
  const customMapStyle = "mapbox://styles/vish3949/cm91g0e57009i01sdbrbo3ird";

  useEffect(() => {
    // Initialize map when component mounts
    if (map.current) return; // Skip if already initialized

    // Initialize Mapbox with the provided token
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: customMapStyle, // Use custom map style
      center: [location.longitude, location.latitude],
      zoom: 12,
      pitch: 40, // Add some tilt to better visualize terrain
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Add marker for current location
    new mapboxgl.Marker({ color: "#3b82f6" })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    // When map is loaded
    map.current.on("load", () => {
      setLoading(false);
      addFloodRiskLayers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [location]);

  // Update flood risk visualization when flood data changes
  useEffect(() => {
    if (map.current && map.current.loaded()) {
      updateFloodRiskLayers();
    }
  }, [floodData]);

  const addFloodRiskLayers = () => {
    if (!map.current || !map.current.loaded()) return;

    // Add terrain source for 3D visualization
    map.current.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      tileSize: 512,
      maxzoom: 14,
    });

    // Add 3D terrain
    map.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // Add flood risk areas as a GeoJSON source
    map.current.addSource("flood-risk", {
      type: "geojson",
      data: generateFloodRiskGeoJSON(),
    });

    // Add a fill layer for flood risk areas
    map.current.addLayer({
      id: "flood-risk-fill",
      type: "fill",
      source: "flood-risk",
      layout: {},
      paint: {
        "fill-color": [
          "match",
          ["get", "risk"],
          "low",
          "rgba(173, 216, 230, 0.5)", // Light blue
          "medium",
          "rgba(30, 144, 255, 0.5)", // Dodger blue
          "high",
          "rgba(0, 0, 139, 0.5)", // Dark blue
          "severe",
          "rgba(0, 0, 100, 0.7)", // Very dark blue
          "rgba(0, 0, 0, 0)", // Default transparent
        ],
        "fill-opacity": 0.7,
      },
    });

    // Add an outline for flood risk areas
    map.current.addLayer({
      id: "flood-risk-outline",
      type: "line",
      source: "flood-risk",
      layout: {},
      paint: {
        "line-color": [
          "match",
          ["get", "risk"],
          "low",
          "rgb(173, 216, 230)",
          "medium",
          "rgb(30, 144, 255)",
          "high",
          "rgb(0, 0, 139)",
          "severe",
          "rgb(0, 0, 100)",
          "rgb(0, 0, 0)",
        ],
        "line-width": 2,
      },
    });
  };

  const updateFloodRiskLayers = () => {
    if (!map.current || !map.current.getSource("flood-risk")) return; // Update the GeoJSON data for flood risk areas
    (map.current.getSource("flood-risk") as mapboxgl.GeoJSONSource).setData(
      generateFloodRiskGeoJSON()
    );
  };

  // Generate GeoJSON for flood risk visualization
  // In a real application, this would come from a backend service with actual flood modeling
  const generateFloodRiskGeoJSON = () => {
    // Create flood risk areas based on the flood data
    // This is a simplified example - real flood modeling would be much more complex
    const features = floodData.floodProneAreas.map((area) => {
      // Generate a polygon around the user location
      // In a real app, these would be actual geographic boundaries
      const center = [location.longitude, location.latitude];
      const radius = Math.random() * 0.01 + 0.005; // Random radius between 0.005 and 0.015 degrees
      const points = 64;
      const riskLevel = area.riskLevel.toLowerCase();

      // Create a rough circle
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        // Make the shape irregular for more realism
        const adjustedRadius = radius * (0.8 + Math.random() * 0.4);
        const x = center[0] + adjustedRadius * Math.cos(angle);
        const y = center[1] + adjustedRadius * Math.sin(angle);
        coords.push([x, y]);
      }
      coords.push(coords[0]); // Close the polygon

      return {
        type: "Feature",
        properties: {
          name: area.name,
          risk: riskLevel,
          reason: area.reason,
        },
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      };
    });

    return {
      type: "FeatureCollection",
      features,
    };
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Flood Risk Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border border-gray-700 rounded-md overflow-hidden"
          style={{ height: "400px" }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            </div>
          )}
          <div ref={mapContainer} className="w-full h-full" />
        </div>

        <div className="mt-4 flex justify-center items-center gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 mr-2"></div>
            <span className="text-xs text-gray-300">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 mr-2"></div>
            <span className="text-xs text-gray-300">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-600 mr-2"></div>
            <span className="text-xs text-gray-300">High Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-800 mr-2"></div>
            <span className="text-xs text-gray-300">Severe Risk</span>
          </div>
        </div>

        <div className="mt-4 text-sm">
          <p className="font-medium text-gray-300">Key Flood-Prone Areas:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {floodData.floodProneAreas.map((area, index) => (
              <li key={index} className="text-gray-400">
                {area.name} - {area.riskLevel} risk ({area.reason})
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
