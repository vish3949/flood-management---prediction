export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  elevation: number
}

// Weather Data Types
export interface DailyRainfallRecord {
  date: string
  rainfall: number
  historicalAverage: number
}

export interface HourlyRainfallForecast {
  time: string
  rainfall: number
  probability: number
}

export interface RainfallAlert {
  title: string
  time: string
  description: string
}

export interface HistoricalRainfallData {
  daily: DailyRainfallRecord[]
  summary: {
    last24Hours: number
    last24HoursVsAverage: number
    last7Days: number
    last7DaysVsAverage: number
    last30Days: number
    last30DaysVsAverage: number
  }
  analysis: string
}

export interface ForecastRainfallData {
  hourly: HourlyRainfallForecast[]
  summary: {
    next24Hours: number
    next48Hours: number
    next7Days: number
  }
  alerts: RainfallAlert[]
  analysis: string
}

export interface WeatherData {
  historical: HistoricalRainfallData
  forecast: ForecastRainfallData
}

// Flood Risk Types
export interface FloodProneArea {
  name: string
  riskLevel: "Low" | "Medium" | "High" | "Severe"
  reason: string
}

export interface FloodRiskData {
  riskScore: number
  floodProbability: number
  recentRainfall: number
  soilSaturation: number
  elevation: number
  waterProximity: number
  expectedWaterRise: number
  timeToFlood: number | null
  floodProneAreas: FloodProneArea[]
}

// Evacuation Types
export interface EvacuationCenter {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  elevation: number
  distance: number
  estimatedTime: number
  capacity: number
  currentOccupancy: number
  status: "Open" | "Full" | "Closed"
}

export interface Route {
  center: EvacuationCenter
  distance: number
  estimatedTime: number
  safetyScore: number
  directions: string[]
}

