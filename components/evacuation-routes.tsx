"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Location,
  FloodRiskData,
  EvacuationCenter,
  Route,
} from "@/lib/types";
import {
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  School,
  GraduationCap,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface EvacuationRoutesProps {
  location: Location;
  evacuationCenters: EvacuationCenter[];
  floodRiskData: FloodRiskData;
  selectedRoute: Route | null;
  onSelectRoute: (center: EvacuationCenter) => void;
  isLoading: boolean;
}

export default function EvacuationRoutes({
  location,
  evacuationCenters,
  floodRiskData,
  selectedRoute,
  onSelectRoute,
  isLoading,
}: EvacuationRoutesProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const mapboxToken =
    "pk.eyJ1IjoidmlzaDM5NDkiLCJhIjoiY205MWZsaTNsMDBndTJrczZqM3l6ZGQzbCJ9.APG_NijQMJ9Y8FLJUfB12g";
  const customMapStyle = "mapbox://styles/vish3949/cm91g0e57009i01sdbrbo3ird";

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Skip if already initialized

    // Initialize Mapbox with the provided token
    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: customMapStyle, // Use custom map style
      center: [location.longitude, location.latitude],
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add scale
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    // Add marker for current location
    new mapboxgl.Marker({ color: "#22c55e" }) // Green marker
      .setLngLat([location.longitude, location.latitude])
      .setPopup(new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"))
      .addTo(map.current);

    // Add markers for evacuation centers
    evacuationCenters.forEach((center) => {
      const el = document.createElement("div");
      el.className = "evacuation-marker";
      el.style.backgroundColor = "#ef4444"; // Red marker
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.border = "2px solid white";

      new mapboxgl.Marker(el)
        .setLngLat([center.longitude, center.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${center.name}</strong><br>
            ${center.status} - ${center.currentOccupancy}/${
              center.capacity
            } people<br>
            ${center.distance.toFixed(1)} km away`
          )
        )
        .addTo(map.current);
    });

    // When map is loaded
    map.current.on("load", () => {
      setMapLoading(false);

      // Add flood risk areas as a GeoJSON source
      map.current.addSource("flood-risk", {
        type: "geojson",
        data: generateFloodRiskGeoJSON(),
      });

      // Add a fill layer for flood risk areas with low opacity
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
            "rgba(173, 216, 230, 0.3)",
            "medium",
            "rgba(30, 144, 255, 0.3)",
            "high",
            "rgba(0, 0, 139, 0.3)",
            "severe",
            "rgba(0, 0, 100, 0.3)",
            "rgba(0, 0, 0, 0)",
          ],
          "fill-opacity": 0.5,
        },
      });

      // If there's a selected route, display it
      if (selectedRoute) {
        displayRoutes(selectedRoute);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [location, evacuationCenters]);

  // Update the map when the selected route changes
  useEffect(() => {
    if (!map.current || !map.current.loaded()) return;

    // Clear any existing routes
    clearRoutes();

    // If there's a selected route, display it
    if (selectedRoute) {
      displayRoutes(selectedRoute);
    }
  }, [selectedRoute]);

  // Clear existing routes from the map
  const clearRoutes = () => {
    if (!map.current) return;

    // Remove original route
    if (map.current.getLayer("original-route")) {
      map.current.removeLayer("original-route");
    }
    if (map.current.getSource("original-route")) {
      map.current.removeSource("original-route");
    }

    // Remove safe route
    if (map.current.getLayer("safe-route")) {
      map.current.removeLayer("safe-route");
    }
    if (map.current.getSource("safe-route")) {
      map.current.removeSource("safe-route");
    }
  };

  // Generate GeoJSON for flood risk visualization
  const generateFloodRiskGeoJSON = () => {
    // Create flood risk areas based on the flood data
    // This is a simplified example - real flood modeling would be much more complex
    const features = floodRiskData.floodProneAreas.map((area) => {
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

  // Display both original and safe routes on the map
  const displayRoutes = (route: Route) => {
    if (!map.current || !map.current.loaded()) return;

    try {
      // Clear any existing routes
      clearRoutes();

      // Get the start and end points
      const startPoint = [location.longitude, location.latitude];
      const endPoint = [route.center.longitude, route.center.latitude];

      // First, fetch the original route
      fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?steps=true&geometries=geojson&access_token=${mapboxToken}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (!data.routes || data.routes.length === 0) {
            throw new Error("No routes found");
          }

          // Get the original route geometry from the API response
          const originalRouteGeometry = data.routes[0].geometry;

          // Add the original route source (red)
          map.current?.addSource("original-route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: originalRouteGeometry,
            },
          });

          // Add the original route layer (red)
          map.current?.addLayer({
            id: "original-route",
            type: "line",
            source: "original-route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#ef4444", // Red color
              "line-width": 5,
              "line-opacity": 0.8,
            },
          });

          // Now fetch an alternative route that avoids flood-prone areas
          // We'll use the Mapbox Directions API with waypoints to create an alternative route
          // In a real app, you would use more sophisticated routing algorithms

          // Create waypoints to avoid flood-prone areas
          // For this demo, we'll use predefined waypoints to ensure the route follows roads
          const waypointsParam = getAlternativeRouteWaypoints(
            startPoint,
            endPoint
          );

          fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsParam}?steps=true&geometries=geojson&access_token=${mapboxToken}`
          )
            .then((response) => response.json())
            .then((altData) => {
              if (!altData.routes || altData.routes.length === 0) {
                throw new Error("No alternative routes found");
              }

              // Get the alternative route geometry
              const safeRouteGeometry = altData.routes[0].geometry;

              // Add the safe route source (light blue)
              map.current?.addSource("safe-route", {
                type: "geojson",
                data: {
                  type: "Feature",
                  properties: {},
                  geometry: safeRouteGeometry,
                },
              });

              // Add the safe route layer (light blue)
              map.current?.addLayer({
                id: "safe-route",
                type: "line",
                source: "safe-route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": "#38bdf8", // Brighter light blue color
                  "line-width": 6, // Slightly thicker for better visibility
                  "line-opacity": 0.9, // Higher opacity
                  "line-dasharray": [0.5, 1], // Dashed line for safe route
                },
              });

              // Fit the map to show both routes
              const bounds = new mapboxgl.LngLatBounds();

              // Include all coordinates from both routes
              originalRouteGeometry.coordinates.forEach((coord) => {
                bounds.extend(coord as [number, number]);
              });

              safeRouteGeometry.coordinates.forEach((coord) => {
                bounds.extend(coord as [number, number]);
              });

              map.current?.fitBounds(bounds, {
                padding: 50,
                duration: 1000,
              });
            })
            .catch((error) => {
              console.error("Error fetching alternative route:", error);
              // If alternative route fails, just show the original route
            });
        })
        .catch((error) => {
          console.error("Error fetching route:", error);
          // Fallback to simple routes if API fails
          fallbackRoutesDisplay(startPoint, endPoint);
        });
    } catch (error) {
      console.error("Error displaying routes:", error);
      // Fallback to simple routes
      const startPoint = [location.longitude, location.latitude];
      const endPoint = [route.center.longitude, route.center.latitude];
      fallbackRoutesDisplay(startPoint, endPoint);
    }
  };

  // Get waypoints for alternative route that follows roads
  const getAlternativeRouteWaypoints = (
    start: [number, number],
    end: [number, number]
  ) => {
    // For a more direct route, we'll use fewer waypoints and keep them closer to the direct path
    // This will create a route that follows roads but doesn't take unnecessary diversions

    // Calculate the direct distance between start and end
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const directDistance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is very short, don't add waypoints
    if (directDistance < 0.01) {
      return `${start[0]},${start[1]};${end[0]},${end[1]}`;
    }

    // For longer distances, add just one waypoint that's slightly offset
    // to create an alternative route without excessive diversions
    const midLng = (start[0] + end[0]) / 2;
    const midLat = (start[1] + end[1]) / 2;

    // Create a very small offset (much smaller than before)
    const perpX = (-dy / directDistance) * 0.002; // Reduced from 0.01
    const perpY = (dx / directDistance) * 0.002; // Reduced from 0.01

    const waypoint = [midLng + perpX, midLat + perpY];

    // Format the waypoints for the API request
    return `${start[0]},${start[1]};${waypoint[0]},${waypoint[1]};${end[0]},${end[1]}`;
  };

  // Fallback route display if the Directions API fails
  const fallbackRoutesDisplay = (
    startPoint: [number, number],
    endPoint: [number, number]
  ) => {
    if (!map.current) return;

    // For the original route, create a direct line
    map.current.addSource("original-route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [startPoint, endPoint],
        },
      },
    });

    // Add the original route layer (red)
    map.current.addLayer({
      id: "original-route",
      type: "line",
      source: "original-route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#ef4444", // Red
        "line-width": 5,
        "line-opacity": 0.8,
      },
    });

    // For the safe route, create a slightly different path
    const midpoint = [
      (startPoint[0] + endPoint[0]) / 2,
      (startPoint[1] + endPoint[1]) / 2,
    ];

    // Offset the midpoint slightly
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    const length = Math.sqrt(dx * dx + dy * dy);

    // Perpendicular vector
    const perpX = (-dy / length) * 0.01;
    const perpY = (dx / length) * 0.01;

    const offsetMidpoint = [midpoint[0] + perpX, midpoint[1] + perpY];

    // Add the safe route source (light blue)
    map.current.addSource("safe-route", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [startPoint, offsetMidpoint, endPoint],
        },
      },
    });

    // Update the fallback route display to use the same brighter blue color

    // In the fallbackRoutesDisplay function, update the safe route layer
    map.current.addLayer({
      id: "safe-route",
      type: "line",
      source: "safe-route",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#38bdf8", // Brighter light blue color
        "line-width": 6, // Slightly thicker
        "line-opacity": 0.9, // Higher opacity
        "line-dasharray": [0.5, 1], // Dashed line for safe route
      },
    });

    // Fit the map to show both routes
    const bounds = new mapboxgl.LngLatBounds()
      .extend(startPoint)
      .extend(endPoint)
      .extend(offsetMidpoint as [number, number]);

    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    });
  };

  // Get the appropriate icon for the educational institution
  const getInstitutionIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (
      nameLower.includes("university") ||
      nameLower.includes("college") ||
      nameLower.includes("institute")
    ) {
      return <GraduationCap className="h-5 w-5 text-blue-400 mt-0.5" />;
    }
    return <School className="h-5 w-5 text-blue-400 mt-0.5" />;
  };

  // Also update the generateWaypoints function to create fewer waypoints with less jitter
  const generateWaypoints = (
    start: [number, number],
    end: [number, number],
    numPoints: number,
    jitterFactor = 0.0005 // Reduced jitter factor
  ) => {
    const waypoints = [];

    // Use fewer waypoints for a more direct route
    const actualPoints = Math.min(numPoints, 3);

    for (let i = 1; i <= actualPoints; i++) {
      // Calculate position along the line
      const ratio = i / (actualPoints + 1);

      // Add minimal randomness
      const jitter = jitterFactor * (Math.random() - 0.5);

      const x = start[0] + (end[0] - start[0]) * ratio + jitter;
      const y = start[1] + (end[1] - start[1]) * ratio + jitter;

      waypoints.push([x, y]);
    }

    return waypoints;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 space-y-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">
              Educational Evacuation Centers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-700">
              {evacuationCenters.map((center) => (
                <li key={center.id} className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2">
                      {getInstitutionIcon(center.name)}
                      <div>
                        <p className="font-medium text-gray-300">
                          {center.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {center.address}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        center.status === "Open" ? "success" : "destructive"
                      }
                      className="bg-gray-700 text-gray-300 border-gray-600"
                    >
                      {center.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {center.distance.toFixed(1)} km away
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {center.estimatedTime} min travel
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      <span className="font-medium">Capacity:</span>{" "}
                      {center.currentOccupancy}/{center.capacity} people
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectRoute(center)}
                      disabled={
                        isLoading || selectedRoute?.center.id === center.id
                      }
                    >
                      {isLoading && selectedRoute?.center.id === center.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Navigation className="h-3 w-3 mr-1" />
                      )}
                      {selectedRoute?.center.id === center.id
                        ? "Selected"
                        : "Get Route"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="h-full bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">
              {selectedRoute
                ? `Route to ${selectedRoute.center.name}`
                : "Select an Evacuation Center"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="border border-gray-700 rounded-md overflow-hidden"
                style={{ height: "300px" }}
              >
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                  </div>
                )}
                <div ref={mapContainer} className="w-full h-full" />
              </div>

              {selectedRoute && (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Distance</p>
                          <p className="text-xl font-bold text-white">
                            {selectedRoute.distance.toFixed(1)} km
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">
                            Estimated Time
                          </p>
                          <p className="text-xl font-bold text-white">
                            {selectedRoute.estimatedTime} min
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-700 border-gray-600">
                      <CardContent className="p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-400">Safety Score</p>
                          <p className="text-xl font-bold text-white">
                            {selectedRoute.safetyScore}/10
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-gray-700 border-gray-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-white">
                        Route Instructions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        {selectedRoute.directions.map((direction, index) => (
                          <li key={index} className="text-gray-400">
                            {direction}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>

                  <div className="text-sm">
                    <p className="font-medium text-gray-300">Route Legend:</p>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center">
                        <div className="w-6 h-1 bg-red-500 mr-2"></div>
                        <span className="text-gray-400">Original Route</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-1 bg-[#38bdf8] mr-2 border-t border-b border-dashed border-[#38bdf8]"></div>
                        <span className="text-gray-400">
                          Safe Route (Avoids Flood-Prone Areas)
                        </span>
                      </div>
                    </div>

                    <p className="font-medium text-gray-300 mt-4">
                      Important Notes:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-400">
                      <li>
                        The safe route (light blue) avoids flood-prone areas.
                      </li>
                      <li>
                        The original route (red) may pass through potential
                        flood zones.
                      </li>
                      <li>Route is updated based on real-time flood data.</li>
                      <li>
                        If conditions change, the recommended route may update.
                      </li>
                      <li>
                        Follow official evacuation orders and instructions.
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {!selectedRoute && (
                <div className="flex flex-col items-center justify-center py-6">
                  <h3 className="text-lg font-medium mb-2 text-gray-300">
                    Select an Educational Evacuation Center
                  </h3>
                  <p className="text-sm text-gray-400 text-center max-w-md mb-6">
                    Choose an educational institution from the list to see the
                    safest route based on current flood predictions.
                  </p>
                  <div className="flex items-center text-sm text-gray-400">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    <span>
                      Routes are calculated to avoid flood-prone areas
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
