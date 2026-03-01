/**
 * Request route from Google Directions API (client-side).
 * Call only when google.maps is loaded.
 * @param {google.maps.DirectionsService} service
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {Promise<{ result: google.maps.DirectionsResult, status: string }>}
 */
export function getDirections(service, origin, destination) {
  return new Promise((resolve, reject) => {
    service.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          resolve({ result, status })
        } else {
          reject(new Error(status))
        }
      }
    )
  })
}
