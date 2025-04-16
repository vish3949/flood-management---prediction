"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ForecastRainfallData } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { CloudRain } from "lucide-react"

interface RainfallPredictionProps {
  data: ForecastRainfallData
}

export default function RainfallPrediction({ data }: RainfallPredictionProps) {
  // Process data for chart display
  const chartData = data.hourly.map((hour) => {
    // Format time for display
    const time = new Date(hour.time)
    const formattedTime = time.toLocaleTimeString("en-US", { hour: "2-digit", hour12: true })

    return {
      time: formattedTime,
      rainfall: hour.rainfall,
      probability: hour.probability * 100, // Convert to percentage
    }
  })

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Rainfall Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Next 24 Hours</p>
              <p className="text-2xl font-bold text-white">{data.summary.next24Hours.toFixed(1)}mm</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Next 48 Hours</p>
              <p className="text-2xl font-bold text-white">{data.summary.next48Hours.toFixed(1)}mm</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Next 7 Days</p>
              <p className="text-2xl font-bold text-white">{data.summary.next7Days.toFixed(1)}mm</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis
                  yAxisId="left"
                  stroke="#9ca3af"
                  label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#9ca3af"
                  label={{ value: "Probability (%)", angle: 90, position: "insideRight", fill: "#9ca3af" }}
                />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#e5e7eb" }} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="rainfall"
                  name="Expected Rainfall"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="probability"
                  name="Probability"
                  stroke="#f97316"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {data.alerts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.alerts.map((alert, index) => (
                <Card key={index} className="bg-amber-900/20 border-amber-700">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <CloudRain className="h-5 w-5 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-300">{alert.title}</p>
                        <p className="text-xs text-amber-400">{alert.time}</p>
                        <p className="text-sm text-amber-400 mt-1">{alert.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-sm">
            <p className="font-medium text-gray-300">Forecast Summary:</p>
            <p className="text-gray-400 mt-1">{data.analysis}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

