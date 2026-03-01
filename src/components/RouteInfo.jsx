/**
 * Display distance and ETA from a DirectionsResult.
 * Expects the first route's first leg.
 */
export default function RouteInfo({ directionsResult, destinationName, onClear }) {
  if (!directionsResult?.routes?.length) return null

  const route = directionsResult.routes[0]
  const leg = route.legs?.[0]
  if (!leg) return null

  const distance = leg.distance?.text ?? ''
  const duration = leg.duration?.text ?? ''

  return (
    <div className="route-info">
      <div className="route-info__summary">
        {destinationName && (
          <span className="route-info__destination">{destinationName}</span>
        )}
        <span className="route-info__stats">
          {distance}
          {duration && ` • ${duration}`}
        </span>
      </div>
      {onClear && (
        <button type="button" className="route-info__clear" onClick={onClear}>
          Clear route
        </button>
      )}
    </div>
  )
}
