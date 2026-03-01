let placesService = null

function getService() {
  if (placesService) return placesService
  if (!window.google?.maps?.places) {
    throw new Error('Google Maps Places library not loaded')
  }
  const div = document.createElement('div')
  placesService = new window.google.maps.places.PlacesService(div)
  return placesService
}

function normalizePlace(place) {
  const loc = place.geometry?.location
  return {
    id: place.place_id,
    name: place.name ?? '',
    address: place.formatted_address ?? place.vicinity ?? '',
    lat: typeof loc?.lat === 'function' ? loc.lat() : loc?.lat,
    lng: typeof loc?.lng === 'function' ? loc.lng() : loc?.lng,
    rating: place.rating,
  }
}

/**
 * Text search via Google Maps JavaScript API PlacesService.
 * Uses the client-side library (no CORS issues, no separate REST call).
 * @param {string} query
 * @param {{ lat: number, lng: number } | null} location
 * @returns {Promise<Array<{ id, name, address, lat, lng, rating? }>>}
 */
export function searchPlaces(query, location = null) {
  return new Promise((resolve, reject) => {
    const service = getService()
    const request = { query: query.trim() }
    if (location) {
      request.location = new window.google.maps.LatLng(location.lat, location.lng)
      request.radius = 5000
    }
    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results.map(normalizePlace))
      } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        resolve([])
      } else {
        reject(new Error(`Places search failed: ${status}`))
      }
    })
  })
}
