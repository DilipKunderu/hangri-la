import { useJsApiLoader } from '@react-google-maps/api'

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 } // San Francisco
const LIBRARIES = ['places']

export function useGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    id: 'google-map-script',
    libraries: LIBRARIES,
  })

  return {
    isLoaded,
    loadError,
    defaultCenter: DEFAULT_CENTER,
  }
}
