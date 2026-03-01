import { useState, useCallback, useMemo, useEffect } from 'react'
import { useGoogleMaps } from './hooks/useGoogleMaps'
import { searchPlaces } from './services/places'
import { getDirections } from './services/directions'
import IPhoneFrame from './components/iPhoneFrame'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import PlaceSuggestions from './components/PlaceSuggestions'
import RouteInfo from './components/RouteInfo'

function App() {
  const { isLoaded, loadError, defaultCenter } = useGoogleMaps()
  const [suggestions, setSuggestions] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [directionsResult, setDirectionsResult] = useState(null)
  const [directionsLoading, setDirectionsLoading] = useState(false)
  const [directionsError, setDirectionsError] = useState(null)
  const [userLocation, setUserLocation] = useState(null)

  const center = userLocation ?? defaultCenter

  const directionsService = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return null
    return new window.google.maps.DirectionsService()
  }, [isLoaded])

  const handleSearch = useCallback(async (query) => {
    if (!query || typeof query !== 'string') {
      setSuggestions([])
      setSearchError(null)
      setSearchQuery('')
      return
    }
    setSearchQuery(query)
    setSearchLoading(true)
    setSearchError(null)
    try {
      const results = await searchPlaces(query, userLocation ?? undefined)
      setSuggestions(results)
      setSelectedPlace(null)
    } catch (err) {
      console.error('Place search failed:', err)
      setSuggestions([])
      setSearchError(err.message || 'Search failed. Check your connection or try again.')
    } finally {
      setSearchLoading(false)
    }
  }, [userLocation])

  const handleNavigate = useCallback(
    async (place) => {
      setSelectedPlace(place)
      setDirectionsError(null)
      if (!directionsService || !place) return
      const origin = userLocation ?? defaultCenter
      setDirectionsLoading(true)
      setDirectionsResult(null)
      try {
        const { result } = await getDirections(
          directionsService,
          origin,
          { lat: place.lat, lng: place.lng }
        )
        setDirectionsResult(result)
      } catch (err) {
        console.error('Directions failed:', err)
        setDirectionsError(err.message || 'Could not get directions.')
      } finally {
        setDirectionsLoading(false)
      }
    },
    [directionsService, userLocation, defaultCenter]
  )

  const handleClearRoute = useCallback(() => {
    setDirectionsResult(null)
  }, [])

  useEffect(() => {
    if (!navigator?.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  if (loadError) {
    return (
      <div style={{ color: '#fff', padding: 24, textAlign: 'center' }}>
        Failed to load Google Maps. Check your API key and console.
      </div>
    )
  }

  return (
    <IPhoneFrame>
      <div className="app-content">
        <SearchBar onSearch={handleSearch} disabled={!isLoaded} />
        <div className="app-content__map">
          {!isLoaded ? (
            <div className="map-placeholder">
              <span>Loading map…</span>
              <p className="map-placeholder__hint">
                Add VITE_GOOGLE_MAPS_API_KEY to .env if the map does not load.
              </p>
            </div>
          ) : (
            <MapView
            center={center}
            zoom={14}
            places={suggestions}
            selectedPlace={selectedPlace}
            onSelectPlace={setSelectedPlace}
            onNavigate={handleNavigate}
            directionsResult={directionsResult}
          />
          )}
        </div>
        {directionsLoading ? (
          <div className="panel-message panel-message--loading">
            Getting route…
          </div>
        ) : directionsError ? (
          <div className="panel-message panel-message--error">
            <span>{directionsError}</span>
            <button type="button" onClick={() => setDirectionsError(null)}>
              Dismiss
            </button>
          </div>
        ) : directionsResult ? (
          <RouteInfo
            directionsResult={directionsResult}
            destinationName={selectedPlace?.name}
            onClear={handleClearRoute}
          />
        ) : (
          <PlaceSuggestions
            places={suggestions}
            selectedId={selectedPlace?.id}
            onSelectPlace={setSelectedPlace}
            onNavigate={handleNavigate}
            loading={searchLoading}
            error={searchError}
            empty={!searchLoading && searchQuery && suggestions.length === 0}
          />
        )}
      </div>
    </IPhoneFrame>
  )
}

export default App
