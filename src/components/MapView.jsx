import { useMemo } from 'react'
import { GoogleMap, MarkerF, InfoWindowF, DirectionsRenderer } from '@react-google-maps/api'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: 280,
}

const defaultOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
}

export default function MapView({
  center,
  zoom = 14,
  places = [],
  selectedPlace = null,
  onSelectPlace,
  onNavigate,
  directionsResult = null,
  children,
}) {
  const options = useMemo(() => defaultOptions, [])
  const mapCenter = selectedPlace
    ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
    : center

  return (
    <div className="map-view__wrapper">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={options}
      >
      {places.map((place) => (
        <MarkerF
          key={place.id}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          onClick={() => onSelectPlace?.(place)}
          zIndex={selectedPlace?.id === place.id ? 10 : 1}
          icon={
            selectedPlace?.id === place.id
              ? {
                  path: window.google?.maps?.SymbolPath?.CIRCLE ?? 0,
                  scale: 12,
                  fillColor: '#1a73e8',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }
              : undefined
          }
        />
      ))}
      {directionsResult && (
        <DirectionsRenderer
          directions={directionsResult}
          options={{ suppressMarkers: false }}
        />
      )}
      {selectedPlace && (
        <InfoWindowF
          position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
          onCloseClick={() => onSelectPlace?.(null)}
        >
          <div className="map-info-window">
            <div className="map-info-window__name">{selectedPlace.name}</div>
            {selectedPlace.address && (
              <div className="map-info-window__address">{selectedPlace.address}</div>
            )}
            {selectedPlace.rating != null && (
              <div className="map-info-window__rating">★ {selectedPlace.rating}</div>
            )}
            <button
              type="button"
              className="map-info-window__navigate"
              onClick={() => onNavigate?.(selectedPlace)}
            >
              Navigate
            </button>
          </div>
        </InfoWindowF>
      )}
      {children}
      </GoogleMap>
    </div>
  )
}
