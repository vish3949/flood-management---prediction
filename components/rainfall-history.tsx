"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { HistoricalRainfallData } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface RainfallHistoryProps {
  data: HistoricalRainfallData
}

export default function RainfallHistory({ data }: RainfallHistoryProps) {
  // Process data for chart display
  const chartData = data.daily.map((day) => {
    // Format date for display
    const date = new Date(day.date)
    const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    return {
      date: formattedDate,
      rainfall: day.rainfall,
      average: day.historicalAverage,
    }
  })

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">Historical Rainfall Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Last 30 Days</p>
              <p className="text-2xl font-bold text-white">{data.summary.last30Days.toFixed(1)}mm</p>
              <p className="text-xs text-gray-400">
                {data.summary.last30DaysVsAverage > 0
                  ? `+${data.summary.last30DaysVsAverage}%`
                  : `${data.summary.last30DaysVsAverage}%`}{" "}
                vs avg
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Last 7 Days</p>
              <p className="text-2xl font-bold text-white">{data.summary.last7Days.toFixed(1)}mm</p>
              <p className="text-xs text-gray-400">
                {data.summary.last7DaysVsAverage > 0
                  ? `+${data.summary.last7DaysVsAverage}%`
                  : `${data.summary.last7DaysVsAverage}%`}{" "}
                vs avg
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Last 24 Hours</p>
              <p className="text-2xl font-bold text-white">{data.summary.last24Hours.toFixed(1)}mm</p>
              <p className="text-xs text-gray-400">
                {data.summary.last24HoursVsAverage > 0
                  ? `+${data.summary.last24HoursVsAverage}%`
                  : `${data.summary.last24HoursVsAverage}%`}{" "}
                vs avg
              </p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis
                  stroke="#9ca3af"
                  label={{ value: "Rainfall (mm)", angle: -90, position: "insideLeft", fill: "#9ca3af" }}
                />
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "#e5e7eb" }} />
                <Legend />
                <Bar dataKey="rainfall" name="Actual Rainfall" fill="#3b82f6" />
                <Bar dataKey="average" name="Historical Average" fill="#6b7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-sm">
            <p className="font-medium text-gray-300">Analysis:</p>
            <p className="text-gray-400 mt-1">{data.analysis}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

