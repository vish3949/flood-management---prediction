"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin, Search, Locate } from "lucide-react"
import type { Location } from "@/lib/types"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void
  selectedLocation: Location | null
}

export default function LocationSelector({ onLocationSelect, selectedLocation }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const mapboxToken = "pk.eyJ1IjoidmlzaDM5NDkiLCJhIjoiY205MWZsaTNsMDBndTJrczZqM3l6ZGQzbCJ9.APG_NijQMJ9Y8FLJUfB12g"
  const customMapStyle = "mapbox://styles/vish3949/cm91g0e57009i01sdbrbo3ird"

  useEffect(() => {
    // Initialize map
    if (mapContainer.current && !map.current) {
      initializeMap()
    }
  }, [])

  useEffect(() => {
    // Update marker when selected location changes
    if (selectedLocation && map.current) {
      updateMapMarker(selectedLocation)
    }
  }, [selectedLocation])

  const initializeMap = async () => {
    try {
      // Initialize Mapbox with the provided token
      mapboxgl.accessToken = mapboxToken

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: customMapStyle, // Use custom map style
        center: selectedLocation ? [selectedLocation.longitude, selectedLocation.latitude] : [0, 0],
        zoom: selectedLocation ? 12 : 2,
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // If we already have a selected location, add a marker
      if (selectedLocation) {
        updateMapMarker(selectedLocation)
      }

      // Allow clicking on the map to select a location
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat

        // Get the address using reverse geocoding
        fetchLocationAddress(lng, lat)
          .then((address) => {
            const clickedLocation: Location = {
              id: `clicked-${Date.now()}`,
              name: address.name || "Selected Location",
              address: address.full_address || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              latitude: lat,
              longitude: lng,
              elevation: 0, // This would be fetched from an elevation API in a real app
            }

            updateMapMarker(clickedLocation)
            onLocationSelect(clickedLocation)
          })
          .catch((err) => {
            console.error("Error getting address:", err)
            const clickedLocation: Location = {
              id: `clicked-${Date.now()}`,
              name: "Selected Location",
              address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              latitude: lat,
              longitude: lng,
              elevation: 0,
            }
            updateMapMarker(clickedLocation)
            onLocationSelect(clickedLocation)
          })
      })
    } catch (error) {
      console.error("Error initializing map:", error)
      setError("Failed to load map. Please refresh the page.")
    }
  }

  const updateMapMarker = (location: Location) => {
    if (!map.current) return

    // Update map center and zoom
    map.current.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 12,
      essential: true,
    })

    // Update or create marker
    if (marker.current) {
      marker.current.setLngLat([location.longitude, location.latitude])
    } else {
      marker.current = new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.name}</strong><br>${location.address}`))
        .addTo(map.current)
    }
  }

  const fetchLocationAddress = async (lng: number, lat: number) => {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`,
    )
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      return {
        name: feature.text || "Selected Location",
        full_address: feature.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }
    }

    return {
      name: "Selected Location",
      full_address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      // Use Mapbox Geocoding API to search for locations
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchQuery,
        )}.json?access_token=${mapboxToken}&limit=5`,
      )

      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const results: Location[] = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          latitude: feature.center[1],
          longitude: feature.center[0],
          elevation: 0, // Would need an elevation API for accurate data
        }))

        setSearchResults(results)
      } else {
        setSearchResults([])
        setError("No locations found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error searching locations:", error)
      setError("Failed to search locations. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Get address using reverse geocoding
          const address = await fetchLocationAddress(longitude, latitude)

          const currentLocation: Location = {
            id: "current",
            name: address.name,
            address: address.full_address,
            latitude,
            longitude,
            elevation: 0, // This would be fetched from an elevation API
          }

          onLocationSelect(currentLocation)
          updateMapMarker(currentLocation)
          setSearchResults([])
          setSearchQuery("")
        } catch (error) {
          console.error("Error getting location details:", error)
          setError("Failed to get your location details. Please try again.")
        } finally {
          setIsGettingLocation(false)
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        setError(`Failed to get your location: ${err.message}`)
        setIsGettingLocation(false)
      },
    )
  }

  const handleSelectLocation = (location: Location) => {
    onLocationSelect(location)
    updateMapMarker(location)
    setSearchResults([])
    setSearchQuery("")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="location-search" className="text-gray-300">
              Search for a location
            </Label>
            <div className="flex mt-1">
              <Input
                id="location-search"
                placeholder="Enter city, address, or coordinates"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="rounded-r-none bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="rounded-l-none">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <Button
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="h-10 border-gray-700 text-gray-300"
            >
              {isGettingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Locate className="h-4 w-4 mr-2" />
              )}
              Current Location
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {searchResults.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-2">
              <ul className="divide-y divide-gray-700">
                {searchResults.map((location) => (
                  <li key={location.id} className="py-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left text-gray-300 hover:bg-gray-700"
                      onClick={() => handleSelectLocation(location)}
                    >
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-400">{location.address}</p>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="border border-gray-700 rounded-md overflow-hidden" style={{ height: "400px" }}>
        <div ref={mapContainer} className="w-full h-full" />
      </div>

      {selectedLocation && (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-300">{selectedLocation.name}</h3>
            <p className="text-sm text-gray-400">{selectedLocation.address}</p>
          </div>
          <Button onClick={() => onLocationSelect(selectedLocation)}>Confirm Location</Button>
        </div>
      )}
    </div>
  )
}

