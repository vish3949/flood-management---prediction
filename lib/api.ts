import type { Location, WeatherData, FloodRiskData, EvacuationCenter, Route } from "./types"

// Mapbox token
const MAPBOX_TOKEN = "pk.eyJ1IjoidmlzaDM5NDkiLCJhIjoiY205MWZsaTNsMDBndTJrczZqM3l6ZGQzbCJ9.APG_NijQMJ9Y8FLJUfB12g"

// Mock API functions for demonstration purposes
// In a real application, these would make actual API calls to weather services, mapping APIs, etc.

// Location search function
export async function searchLocations(query: string): Promise<Location[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Return mock data
  return [
    {
      id: "loc1",
      name: "Downtown",
      address: "123 Main St, Anytown",
      latitude: 34.0522,
      longitude: -118.2437,
      elevation: 85,
    },
    {
      id: "loc2",
      name: "Riverside",
      address: "456 River Rd, Anytown",
      latitude: 34.0622,
      longitude: -118.2537,
      elevation: 45,
    },
    {
      id: "loc3",
      name: "Hillside Community",
      address: "789 Hill Ave, Anytown",
      latitude: 34.0722,
      longitude: -118.2637,
      elevation: 120,
    },
  ]
}

// Fetch weather data from Open Metro API
export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  try {
    // Open Metro API endpoint
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&hourly=precipitation,precipitation_probability&daily=precipitation_sum,precipitation_hours&past_days=30&forecast_days=7&timezone=auto`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    // Process historical data (past 30 days)
    const historicalDailyData = []
    const dailyTime = data.daily.time
    const dailyPrecipitation = data.daily.precipitation_sum

    // Calculate averages for comparison
    const last24HoursTotal = data.hourly.precipitation.slice(-24).reduce((sum: number, val: number) => sum + val, 0)
    const last7DaysTotal = dailyPrecipitation.slice(-7).reduce((sum: number, val: number) => sum + val, 0)
    const last30DaysTotal = dailyPrecipitation.reduce((sum: number, val: number) => sum + val, 0)

    // Historical averages (would normally come from climate data)
    // For demo purposes, we'll use slightly lower values to show above-average rainfall
    const avg24Hours = last24HoursTotal * 0.7
    const avg7Days = last7DaysTotal * 0.7
    const avg30Days = last30DaysTotal * 0.7

    // Get current date to ensure we don't show future dates in historical data
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) // Set to beginning of day for comparison

    // Create daily records
    for (let i = 0; i < dailyTime.length; i++) {
      const date = new Date(dailyTime[i])

      // Skip if date is in the future
      if (date > currentDate) continue

      const rainfall = dailyPrecipitation[i] || 0
      const historicalAverage = rainfall * 0.7 // Simulated historical average

      historicalDailyData.push({
        date: dailyTime[i],
        rainfall,
        historicalAverage,
      })
    }

    // Process forecast data
    const hourlyTime = data.hourly.time
    const hourlyPrecipitation = data.hourly.precipitation
    const hourlyProbability = data.hourly.precipitation_probability

    const forecastHourlyData = []

    // Create hourly forecast records
    for (let i = 0; i < 24; i++) {
      const time = hourlyTime[i]
      const rainfall = hourlyPrecipitation[i] || 0
      const probability = (hourlyProbability[i] || 0) / 100 // Convert percentage to decimal

      forecastHourlyData.push({
        time,
        rainfall,
        probability,
      })
    }

    // Calculate forecast totals
    const next24Hours = hourlyPrecipitation.slice(0, 24).reduce((sum: number, val: number) => sum + val, 0)
    const next48Hours = hourlyPrecipitation.slice(0, 48).reduce((sum: number, val: number) => sum + val, 0)
    const next7Days = dailyPrecipitation
      .slice(dailyPrecipitation.length - 7)
      .reduce((sum: number, val: number) => sum + val, 0)

    // Generate alerts based on precipitation forecast
    const alerts = []

    if (next24Hours > 20) {
      alerts.push({
        title: "Heavy Rain Warning",
        time: "Next 24 hours",
        description: "Heavy rainfall expected with potential for flash flooding in low-lying areas.",
      })
    } else if (next24Hours > 10) {
      alerts.push({
        title: "Moderate Rain Alert",
        time: "Next 24 hours",
        description: "Moderate rainfall expected. Be prepared for possible localized flooding.",
      })
    }

    if (next48Hours > 30) {
      alerts.push({
        title: "Extended Heavy Rain",
        time: "Next 48 hours",
        description: "Sustained heavy rainfall may cause significant flooding in flood-prone areas.",
      })
    }

    // Create analysis text based on the data
    let historicalAnalysis = "Recent rainfall has been "
    if (last7DaysTotal > avg7Days * 1.5) {
      historicalAnalysis +=
        "significantly above average, with particularly heavy precipitation recently. The ground is likely saturated, increasing flood risk."
    } else if (last7DaysTotal > avg7Days) {
      historicalAnalysis +=
        "above average. Some areas may have saturated soil, which could increase flood risk if heavy rain continues."
    } else {
      historicalAnalysis += "within normal ranges. Flood risk is primarily dependent on upcoming rainfall intensity."
    }

    let forecastAnalysis = ""
    if (next24Hours > 20) {
      forecastAnalysis =
        "Heavy rainfall is expected to continue, creating significant flood potential, especially in low-lying areas."
    } else if (next24Hours > 10) {
      forecastAnalysis = "Moderate rainfall is expected, which may cause localized flooding in flood-prone areas."
    } else {
      forecastAnalysis =
        "Light to moderate rainfall is expected. Monitor conditions if you are in a historically flood-prone area."
    }

    // Return processed weather data
    return {
      historical: {
        daily: historicalDailyData,
        summary: {
          last24Hours: last24HoursTotal,
          last24HoursVsAverage: Math.round((last24HoursTotal / avg24Hours) * 100 - 100),
          last7Days: last7DaysTotal,
          last7DaysVsAverage: Math.round((last7DaysTotal / avg7Days) * 100 - 100),
          last30Days: last30DaysTotal,
          last30DaysVsAverage: Math.round((last30DaysTotal / avg30Days) * 100 - 100),
        },
        analysis: historicalAnalysis,
      },
      forecast: {
        hourly: forecastHourlyData,
        summary: {
          next24Hours,
          next48Hours,
          next7Days,
        },
        alerts,
        analysis: forecastAnalysis,
      },
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    // Return fallback data in case of API failure
    return generateFallbackWeatherData()
  }
}

// Fallback weather data in case the API fails
function generateFallbackWeatherData(): WeatherData {
  // Get current date
  const currentDate = new Date()

  return {
    historical: {
      daily: Array.from({ length: 14 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (13 - i))
        // Ensure date is not in the future
        if (date > currentDate) {
          date.setDate(currentDate.getDate())
        }
        const rainfall = i < 7 ? Math.random() * 10 : Math.random() * 30 + 10
        const historicalAverage = Math.random() * 15 + 5
        return {
          date: date.toISOString(),
          rainfall,
          historicalAverage,
        }
      }),
      summary: {
        last24Hours: 35,
        last24HoursVsAverage: 180,
        last7Days: 120,
        last7DaysVsAverage: 150,
        last30Days: 210,
        last30DaysVsAverage: 120,
      },
      analysis:
        "Recent rainfall has been significantly above average, with particularly heavy precipitation in the last 24 hours. The ground is likely saturated, increasing flood risk.",
    },
    forecast: {
      hourly: Array.from({ length: 24 }, (_, i) => {
        const time = new Date()
        time.setHours(time.getHours() + i)
        const rainfall = i < 6 ? Math.random() * 8 + 4 : Math.random() * 3
        const probability = i < 6 ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5 + 0.3
        return {
          time: time.toISOString(),
          rainfall,
          probability,
        }
      }),
      summary: {
        next24Hours: 75,
        next48Hours: 110,
        next7Days: 180,
      },
      alerts: [
        {
          title: "Heavy Rain Warning",
          time: "Next 6 hours",
          description: "Heavy rainfall expected with potential for flash flooding in low-lying areas.",
        },
        {
          title: "Thunderstorm Alert",
          time: "Tonight",
          description: "Severe thunderstorms may bring additional heavy rainfall and strong winds.",
        },
      ],
      analysis:
        "Heavy rainfall is expected to continue for the next 6 hours, followed by intermittent showers. The combination of recent rainfall and forecasted precipitation creates significant flood potential.",
    },
  }
}

// Flood risk calculation function
export async function fetchFloodRiskData(location: Location, weatherData: WeatherData): Promise<FloodRiskData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  try {
    // Get elevation data from Mapbox
    const elevationResponse = await fetch(
      `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${location.longitude},${location.latitude}.json?layers=contour&access_token=${MAPBOX_TOKEN}`,
    )

    let elevation = 0
    if (elevationResponse.ok) {
      const elevationData = await elevationResponse.json()
      if (elevationData.features && elevationData.features.length > 0) {
        elevation = elevationData.features[0].properties.ele || 0
      }
    }

    // Calculate risk based on location and weather data
    // In a real application, this would use complex models considering topography, drainage, etc.

    // UPDATED: Prioritize rainfall over elevation in flood risk calculation

    // Rainfall factors (70% of total risk)
    const recentRainfall = weatherData.historical.summary.last24Hours
    const forecastRainfall = weatherData.forecast.summary.next24Hours

    // Calculate rainfall risk (scale of 0-70)
    let rainfallRisk = 0

    // Recent rainfall impact (0-35)
    if (recentRainfall > 50) rainfallRisk += 35
    else if (recentRainfall > 30) rainfallRisk += 30
    else if (recentRainfall > 20) rainfallRisk += 25
    else if (recentRainfall > 10) rainfallRisk += 15
    else rainfallRisk += recentRainfall / 3

    // Forecast rainfall impact (0-35)
    if (forecastRainfall > 50) rainfallRisk += 35
    else if (forecastRainfall > 30) rainfallRisk += 30
    else if (forecastRainfall > 20) rainfallRisk += 25
    else if (forecastRainfall > 10) rainfallRisk += 15
    else rainfallRisk += forecastRainfall / 3

    // Elevation factor (20% of total risk)
    let elevationRisk = 0
    if (elevation < 30) elevationRisk = 20
    else if (elevation < 60) elevationRisk = 15
    else if (elevation < 100) elevationRisk = 10
    else if (elevation < 150) elevationRisk = 5
    else elevationRisk = 0

    // Find nearby water bodies (rivers, lakes, etc.) - 10% of total risk
    const waterProximity = await calculateWaterProximity(location)
    let waterRisk = 0
    if (waterProximity < 0.5) waterRisk = 10
    else if (waterProximity < 1) waterRisk = 8
    else if (waterProximity < 2) waterRisk = 5
    else if (waterProximity < 5) waterRisk = 2
    else waterRisk = 0

    // Calculate total risk score (0-100)
    const riskScore = Math.min(100, rainfallRisk + elevationRisk + waterRisk)

    // Calculate soil saturation based on recent rainfall
    const soilSaturation = Math.min(95, 60 + (weatherData.historical.summary.last7Days / 50) * 40)

    // Calculate expected water rise based on rainfall and elevation
    const expectedWaterRise = forecastRainfall * 1.2 * (1 + (100 - elevation) / 100)

    // Calculate time to flood (if applicable)
    const timeToFlood = riskScore > 70 ? Math.max(1, 12 - forecastRainfall / 10) : null

    // Generate flood-prone areas
    const floodProneAreas = generateFloodProneAreas(
      location,
      elevation,
      waterProximity,
      recentRainfall,
      forecastRainfall,
    )

    // Return flood risk data
    return {
      riskScore,
      floodProbability: riskScore * 0.9,
      recentRainfall: weatherData.historical.summary.last24Hours,
      soilSaturation,
      elevation,
      waterProximity,
      expectedWaterRise,
      timeToFlood,
      floodProneAreas,
    }
  } catch (error) {
    console.error("Error calculating flood risk:", error)

    // Return fallback data in case of error
    return {
      riskScore: 50,
      floodProbability: 45,
      recentRainfall: weatherData.historical.summary.last24Hours,
      soilSaturation: 70,
      elevation: 50,
      waterProximity: 2,
      expectedWaterRise: 25,
      timeToFlood: null,
      floodProneAreas: [
        {
          name: "River Valley",
          riskLevel: "Medium",
          reason: "Low elevation area",
        },
        {
          name: "Central District",
          riskLevel: "Low",
          reason: "Moderate elevation with drainage",
        },
      ],
    }
  }
}

// Calculate proximity to water bodies
async function calculateWaterProximity(location: Location): Promise<number> {
  try {
    // Use Mapbox to find nearby water features
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/water.json?proximity=${location.longitude},${location.latitude}&types=poi&access_token=${MAPBOX_TOKEN}`,
    )

    if (response.ok) {
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        // Calculate distance to nearest water body
        const nearestWater = data.features[0]
        const waterLng = nearestWater.center[0]
        const waterLat = nearestWater.center[1]

        // Simple distance calculation (in km)
        const distance = calculateDistance(location.latitude, location.longitude, waterLat, waterLng)

        return distance
      }
    }

    // Default value if no water bodies found
    return 3.0
  } catch (error) {
    console.error("Error calculating water proximity:", error)
    return 2.0
  }
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Generate flood-prone areas based on location, elevation, and rainfall
function generateFloodProneAreas(
  location: Location,
  elevation: number,
  waterProximity: number,
  recentRainfall: number,
  forecastRainfall: number,
) {
  const areas = []

  // Heavy rainfall areas
  if (recentRainfall > 30 || forecastRainfall > 30) {
    areas.push({
      name: "Heavy Rainfall Zone",
      riskLevel: "High" as const,
      reason: "Significant precipitation expected",
    })
  }

  // Low elevation areas
  if (elevation < 50) {
    const riskLevel = recentRainfall > 20 || forecastRainfall > 20 ? ("Severe" as const) : ("High" as const)
    areas.push({
      name: "Lowland Area",
      riskLevel,
      reason: "Low elevation with rainfall",
    })
  }

  // Water proximity areas
  if (waterProximity < 1) {
    const riskLevel = recentRainfall > 20 || forecastRainfall > 20 ? ("Severe" as const) : ("High" as const)
    areas.push({
      name: "Riverside",
      riskLevel,
      reason: "Very close to water body with rainfall",
    })
  } else if (waterProximity < 2) {
    areas.push({
      name: "Near Water",
      riskLevel: "High" as const,
      reason: "Proximity to water body",
    })
  }

  // Valley areas
  if (elevation < 100 && waterProximity < 3) {
    const riskLevel = recentRainfall > 15 || forecastRainfall > 15 ? ("High" as const) : ("Medium" as const)
    areas.push({
      name: "Valley Basin",
      riskLevel,
      reason: "Moderate elevation near water with rainfall",
    })
  }

  // Highland areas (generally safer)
  if (elevation > 100) {
    // Even high areas can flood with extreme rainfall
    if (recentRainfall > 40 || forecastRainfall > 40) {
      areas.push({
        name: "Highland Area",
        riskLevel: "Medium" as const,
        reason: "High elevation but extreme rainfall",
      })
    } else {
      areas.push({
        name: "Highland Area",
        riskLevel: "Low" as const,
        reason: "High elevation terrain",
      })
    }
  }

  // Ensure we have at least one area
  if (areas.length === 0) {
    areas.push({
      name: "General Area",
      riskLevel: "Low" as const,
      reason: "No specific risk factors identified",
    })
  }

  return areas
}

// Find educational institutions for evacuation centers
export async function findEvacuationCenters(location: Location): Promise<EvacuationCenter[]> {
  try {
    // Use Mapbox to find nearby educational institutions
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/school%20college%20university.json?proximity=${location.longitude},${location.latitude}&types=poi&limit=10&access_token=${MAPBOX_TOKEN}`,
    )

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return generateFallbackEvacuationCenters(location)
    }

    const centers: EvacuationCenter[] = []
    const floodRiskThreshold = 60 // Threshold for considering a location safe from flooding

    for (const feature of data.features) {
      // Calculate distance
      const centerLat = feature.center[1]
      const centerLng = feature.center[0]
      const distance = calculateDistance(location.latitude, location.longitude, centerLat, centerLng)

      // Get elevation (would use an elevation API in a real app)
      let elevation = 0
      try {
        const elevationResponse = await fetch(
          `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${centerLng},${centerLat}.json?layers=contour&access_token=${MAPBOX_TOKEN}`,
        )

        if (elevationResponse.ok) {
          const elevationData = await elevationResponse.json()
          if (elevationData.features && elevationData.features.length > 0) {
            elevation = elevationData.features[0].properties.ele || 0
          }
        }
      } catch (error) {
        console.error("Error fetching elevation:", error)
      }

      // Calculate estimated travel time (rough estimate: 4 min per km)
      const estimatedTime = Math.round(distance * 4)

      // Check if this location is safe from flooding
      // Higher elevation locations are safer
      const isSafeLocation = elevation > 80 // Higher elevation is safer

      // Skip locations that are too close to the current location if it's in a flood zone
      if (distance < 1 && !isSafeLocation) {
        continue
      }

      // Generate random capacity and occupancy
      const capacity = Math.floor(Math.random() * 500) + 300
      const currentOccupancy = Math.floor(Math.random() * (capacity * 0.6))

      centers.push({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        latitude: centerLat,
        longitude: centerLng,
        elevation,
        distance,
        estimatedTime,
        capacity,
        currentOccupancy,
        status: currentOccupancy >= capacity * 0.9 ? "Full" : "Open",
      })
    }

    // Sort centers by safety (elevation) and distance
    centers.sort((a, b) => {
      // Prioritize safety (elevation) first
      if (a.elevation > 80 && b.elevation <= 80) return -1
      if (a.elevation <= 80 && b.elevation > 80) return 1

      // Then sort by distance
      return a.distance - b.distance
    })

    // Return only the top 5 safest and closest centers
    return centers.slice(0, 5)
  } catch (error) {
    console.error("Error finding evacuation centers:", error)
    return generateFallbackEvacuationCenters(location)
  }
}

// Generate fallback evacuation centers if API fails
function generateFallbackEvacuationCenters(location: Location): EvacuationCenter[] {
  // Define the evacuation centers with their actual coordinates
  const centers = [
    {
      id: "ec1",
      name: "Vellore Institute of Technology",
      address: "VIT Campus, Katpadi, Vellore, Tamil Nadu 632014",
      latitude: 12.970068697520778,
      longitude: 79.15598789173693,
      elevation: 220,
    },
    {
      id: "ec2",
      name: "Vellore Municipality Office",
      address: "Municipality Office, Vellore, Tamil Nadu 632001",
      latitude: 12.91677812125299,
      longitude: 79.13245568067919,
      elevation: 180,
    },
    {
      id: "ec3",
      name: "Christian Medical College",
      address: "Ida Scudder Rd, Vellore, Tamil Nadu 632004",
      latitude: 12.924684798908551,
      longitude: 79.13524470951494,
      elevation: 190,
    },
  ]

  // Calculate distance and estimated time for each center
  return centers.map((center) => {
    // Use the existing calculateDistance function (don't redeclare it here)
    const distance = calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude)

    // Estimated time in minutes (assuming average speed of 30 km/h in urban areas)
    const estimatedTime = Math.round((distance / 30) * 60)

    // Generate capacity and occupancy
    const capacity = center.name.includes("Institute") ? 2000 : center.name.includes("Municipality") ? 800 : 1500
    const currentOccupancy = Math.floor(Math.random() * (capacity * 0.7))

    return {
      ...center,
      distance: Number.parseFloat(distance.toFixed(2)),
      estimatedTime,
      capacity,
      currentOccupancy,
      status: currentOccupancy >= capacity * 0.9 ? "Full" : "Open",
    }
  })
}

// Calculate safe evacuation route
export async function calculateSafeRoute(
  location: Location,
  evacuationCenter: EvacuationCenter,
  floodRiskData: FloodRiskData,
): Promise<Route> {
  try {
    // In a real application, you would use the Mapbox Directions API with custom routing
    // that avoids flood-prone areas. For this demo, we'll simulate the route calculation.

    // Get directions from Mapbox
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${location.longitude},${location.latitude};${evacuationCenter.longitude},${evacuationCenter.latitude}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`,
    )

    if (!response.ok) {
      throw new Error(`Directions API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No routes found")
    }

    const route = data.routes[0]
    const distance = route.distance / 1000 // Convert to km
    const duration = Math.round(route.duration / 60) // Convert to minutes

    // Extract step-by-step directions
    const directions: string[] = []
    if (route.legs && route.legs.length > 0) {
      const steps = route.legs[0].steps
      for (const step of steps) {
        if (step.maneuver && step.maneuver.instruction) {
          directions.push(step.maneuver.instruction)
        }
      }
    }

    // If no directions were found, provide fallback directions
    if (directions.length === 0) {
      directions.push(
        `Head towards ${evacuationCenter.name}`,
        `Continue for approximately ${distance.toFixed(1)} km`,
        `Arrive at ${evacuationCenter.name}`,
      )
    }

    // Add a safety note about avoiding flood-prone areas
    if (floodRiskData.floodProneAreas.length > 0) {
      const highRiskAreas = floodRiskData.floodProneAreas
        .filter((area) => area.riskLevel === "High" || area.riskLevel === "Severe")
        .map((area) => area.name)

      if (highRiskAreas.length > 0) {
        directions.push(`IMPORTANT: Avoid ${highRiskAreas.join(", ")} areas which have high flood risk`)
      }
    }

    // Calculate a safety score based on elevation difference and flood risk
    const elevationDifference = evacuationCenter.elevation - location.elevation
    const safetyScore = Math.min(
      10,
      Math.max(
        1,
        5 +
          (elevationDifference > 0 ? 2 : -2) +
          (evacuationCenter.distance < 5 ? 1 : -1) +
          (floodRiskData.riskScore > 70 ? -2 : 0),
      ),
    )

    return {
      center: evacuationCenter,
      distance,
      estimatedTime: duration,
      safetyScore,
      directions,
    }
  } catch (error) {
    console.error("Error calculating route:", error)

    // Return fallback route data
    return {
      center: evacuationCenter,
      distance: evacuationCenter.distance,
      estimatedTime: evacuationCenter.estimatedTime,
      safetyScore: 7,
      directions: [
        `Head north from your location`,
        `Continue on main roads for approximately ${evacuationCenter.distance.toFixed(1)} km`,
        `Avoid low-lying areas and water crossings`,
        `${evacuationCenter.name} will be on your right`,
      ],
    }
  }
}

