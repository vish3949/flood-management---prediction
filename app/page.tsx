import ProjectHome from "@/components/project-home"
import FloodPredictionSystem from "@/components/flood-prediction-system"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-black bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto py-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="system">Prediction System</TabsTrigger>
          </TabsList>
          <TabsContent value="home">
            <ProjectHome />
          </TabsContent>
          <TabsContent value="system">
            <FloodPredictionSystem />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

