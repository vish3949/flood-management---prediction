import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CloudRain, School, Navigation, AlertTriangle, Users, BookOpen } from "lucide-react"

export default function ProjectHome() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                Smart Flood Prediction System
              </CardTitle>
              <CardDescription className="text-gray-400 mt-2">
                Real-time flood prediction and evacuation planning using AI and geospatial data
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
              Smart Cities Project
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 mt-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Project Overview</h3>
              <p className="text-gray-400">
                This smart flood prediction system uses real-time weather data, terrain analysis, and machine learning
                to predict flood risks and provide evacuation guidance. The system helps citizens and authorities make
                informed decisions during potential flood events.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-start space-x-3">
                  <CloudRain className="h-6 w-6 text-blue-400" />
                  <div>
                    <h4 className="font-medium text-gray-200">Rainfall Analysis</h4>
                    <p className="text-sm text-gray-400">Historical and forecast data analysis</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <div>
                    <h4 className="font-medium text-gray-200">Risk Assessment</h4>
                    <p className="text-sm text-gray-400">AI-powered flood risk prediction</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <School className="h-6 w-6 text-green-400" />
                  <div>
                    <h4 className="font-medium text-gray-200">Safe Centers</h4>
                    <p className="text-sm text-gray-400">Educational institutions as evacuation points</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Navigation className="h-6 w-6 text-purple-400" />
                  <div>
                    <h4 className="font-medium text-gray-200">Safe Routes</h4>
                    <p className="text-sm text-gray-400">Optimized evacuation path planning</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-200">Project Details</h3>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Course</p>
                    <p className="font-medium text-gray-200">Design of Smart Cities</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <School className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">University</p>
                    <p className="font-medium text-gray-200">Vellore Institute of Technology</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Faculty</p>
                    <p className="font-medium text-gray-200">Dr. Balakrishnan P</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-200 mb-2">Team Members</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-200">Vishwakanth G</p>
                      <p className="text-sm text-gray-400">22BCE3311</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <p className="font-medium text-gray-200">Nivethan Raaj T</p>
                      <p className="text-sm text-gray-400">22BCE2956</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

