"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Loader2, AlertTriangle, MapPin, Droplets, Navigation, ArrowRight } from "lucide-react"
import LocationSelector from "./location-selector"
import RainfallHistory from "./rainfall-history"
import RainfallPrediction from "./rainfall-prediction"
import FloodRiskMap from "./flood-risk-map"
import EvacuationRoutes from "./evacuation-routes"
import { fetchWeatherData, fetchFloodRiskData, findEvacuationCenters, calculateSafeRoute } from "@/lib/api"
import type { Location, WeatherData, FloodRiskData, EvacuationCenter, Route } from "@/lib/types"

export default function FloodPredictionSystem() {
  const [activeTab, setActiveTab] = useState("location")
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [floodRiskData, setFloodRiskData] = useState<FloodRiskData | null>(null)
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [floodAlertLevel, setFloodAlertLevel] = useState<"low" | "medium" | "high" | null>(null)

  useEffect(() => {
    if (location) {
      loadData()
    }
  }, [location])

  const loadData = async () => {
    if (!location) return

    setIsLoading(true)
    try {
      // Fetch weather data (historical and forecast)
      const weather = await fetchWeatherData(location)
      setWeatherData(weather)

      // Calculate flood risk based on weather data and terrain
      const floodRisk = await fetchFloodRiskData(location, weather)
      setFloodRiskData(floodRisk)

      // Determine flood alert level
      if (floodRisk.riskScore > 75) {
        setFloodAlertLevel("high")
      } else if (floodRisk.riskScore > 40) {
        setFloodAlertLevel("medium")
      } else {
        setFloodAlertLevel("low")
      }

      // Find nearby evacuation centers
      const centers = await findEvacuationCenters(location)
      setEvacuationCenters(centers)

      // If there's a high flood risk, automatically calculate the best evacuation route
      if (floodRisk.riskScore > 60 && centers.length > 0) {
        const bestRoute = await calculateSafeRoute(location, centers[0], floodRisk)
        setSelectedRoute(bestRoute)
      }

      // Move to the next tab if this is the first data load
      if (activeTab === "location") {
        setActiveTab("rainfall")
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation)
  }

  const handleFindRoute = async (center: EvacuationCenter) => {
    if (!location || !floodRiskData) return

    setIsLoading(true)
    try {
      const route = await calculateSafeRoute(location, center, floodRiskData)
      setSelectedRoute(route)
      setActiveTab("evacuation")
    } catch (error) {
      console.error("Error calculating route:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Flood Prediction & Evacuation System</CardTitle>
          <CardDescription className="text-gray-400">
            Get real-time flood predictions and find the safest route to evacuation centers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {floodAlertLevel && (
            <Alert
              className={`mb-6 border ${
                floodAlertLevel === "high"
                  ? "bg-red-900/20 border-red-700 text-red-400"
                  : floodAlertLevel === "medium"
                    ? "bg-amber-900/20 border-amber-700 text-amber-400"
                    : "bg-green-900/20 border-green-700 text-green-400"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  floodAlertLevel === "high"
                    ? "text-red-400"
                    : floodAlertLevel === "medium"
                      ? "text-amber-400"
                      : "text-green-400"
                }`}
              />
              <AlertTitle>
                {floodAlertLevel === "high"
                  ? "High Flood Risk"
                  : floodAlertLevel === "medium"
                    ? "Medium Flood Risk"
                    : "Low Flood Risk"}
              </AlertTitle>
              <AlertDescription>
                {floodAlertLevel === "high"
                  ? "Immediate action recommended. Please consider evacuation."
                  : floodAlertLevel === "medium"
                    ? "Be prepared for possible flooding in the next 24-48 hours."
                    : "No significant flood risk detected at this time."}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-gray-800">
              <TabsTrigger value="location" disabled={isLoading} className="data-[state=active]:bg-gray-700">
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </TabsTrigger>
              <TabsTrigger
                value="rainfall"
                disabled={isLoading || !location}
                className="data-[state=active]:bg-gray-700"
              >
                <Droplets className="h-4 w-4 mr-2" />
                Rainfall Data
              </TabsTrigger>
              <TabsTrigger
                value="flood"
                disabled={isLoading || !weatherData}
                className="data-[state=active]:bg-gray-700"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Flood Risk
              </TabsTrigger>
              <TabsTrigger
                value="evacuation"
                disabled={isLoading || !floodRiskData}
                className="data-[state=active]:bg-gray-700"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Evacuation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="location" className="mt-0">
              <LocationSelector onLocationSelect={handleLocationSelect} selectedLocation={location} />
            </TabsContent>

            <TabsContent value="rainfall" className="mt-0">
              {weatherData ? (
                <div className="space-y-6">
                  <RainfallHistory data={weatherData.historical} />
                  <RainfallPrediction data={weatherData.forecast} />
                  <Button onClick={() => setActiveTab("flood")} className="mt-4">
                    View Flood Risk <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <p className="mt-2 text-gray-400">Loading rainfall data...</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">Please select a location first</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="flood" className="mt-0">
              {floodRiskData ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white">Current Flood Risk</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <Label className="text-gray-300">Risk Level</Label>
                              <span className="text-sm font-medium text-gray-300">{floodRiskData.riskScore}%</span>
                            </div>
                            <Progress
                              value={floodRiskData.riskScore}
                              className={`h-2 ${
                                floodRiskData.riskScore > 75
                                  ? "bg-red-900"
                                  : floodRiskData.riskScore > 40
                                    ? "bg-amber-900"
                                    : "bg-green-900"
                              }`}
                            />
                          </div>
                          <div className="text-sm">
                            <p className="text-gray-300">
                              <strong>Factors:</strong>
                            </p>
                            <ul className="list-disc pl-5 space-y-1 mt-1 text-gray-400">
                              <li>Recent rainfall: {floodRiskData.recentRainfall}mm</li>
                              <li>Soil saturation: {floodRiskData.soilSaturation}%</li>
                              <li>Terrain elevation: {floodRiskData.elevation}m</li>
                              <li>Proximity to water bodies: {floodRiskData.waterProximity}km</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white">Flood Prediction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-300">
                            Based on current conditions and forecast, there is a
                            <span
                              className={`font-bold ${
                                floodRiskData.floodProbability > 75
                                  ? "text-red-400"
                                  : floodRiskData.floodProbability > 40
                                    ? "text-amber-400"
                                    : "text-green-400"
                              }`}
                            >
                              {" "}
                              {floodRiskData.floodProbability}%{" "}
                            </span>
                            probability of flooding in the next 48 hours.
                          </p>

                          <div>
                            <p className="text-sm font-medium mb-1 text-gray-300">Expected water level rise:</p>
                            <p className="text-sm text-gray-400">{floodRiskData.expectedWaterRise}cm above normal</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium mb-1 text-gray-300">Estimated time to flooding:</p>
                            <p className="text-sm text-gray-400">
                              {floodRiskData.timeToFlood
                                ? `${floodRiskData.timeToFlood} hours`
                                : "No imminent flooding expected"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <FloodRiskMap location={location!} floodData={floodRiskData} />

                  <Button onClick={() => setActiveTab("evacuation")} className="mt-4">
                    Find Evacuation Routes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <p className="mt-2 text-gray-400">Calculating flood risk...</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">Rainfall data not available</p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="evacuation" className="mt-0">
              {evacuationCenters.length > 0 ? (
                <EvacuationRoutes
                  location={location!}
                  evacuationCenters={evacuationCenters}
                  floodRiskData={floodRiskData!}
                  selectedRoute={selectedRoute}
                  onSelectRoute={handleFindRoute}
                  isLoading={isLoading}
                />
              ) : (
                <div className="flex justify-center items-center h-64">
                  {isLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <p className="mt-2 text-gray-400">Finding evacuation centers...</p>
                    </div>
                  ) : (
                    <p className="text-gray-400">No evacuation centers found. Please try a different location.</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

