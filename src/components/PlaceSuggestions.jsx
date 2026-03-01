export default function PlaceSuggestions({ places, selectedId, onSelectPlace, onNavigate, loading, error, empty }) {
  if (loading) {
    return (
      <div className="place-suggestions place-suggestions--loading">
        <span>Finding places…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="place-suggestions place-suggestions--error">
        <span>{error}</span>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="place-suggestions place-suggestions--empty">
        <span>No places found. Try a different search.</span>
      </div>
    )
  }

  if (!places?.length) {
    return null
  }

  return (
    <div className="place-suggestions">
      <ul className="place-suggestions__list">
        {places.map((place, index) => (
          <li
            key={place.id}
            className="place-suggestions__item"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <button
              type="button"
              className={`place-suggestions__card ${selectedId === place.id ? 'place-suggestions__card--selected' : ''}`}
              onClick={() => onSelectPlace?.(place)}
            >
              <div className="place-suggestions__name">{place.name}</div>
              {place.address && (
                <div className="place-suggestions__address">{place.address}</div>
              )}
              <div className="place-suggestions__meta">
                {place.rating != null && (
                  <span className="place-suggestions__rating">★ {place.rating}</span>
                )}
                {place.distance != null && (
                  <span className="place-suggestions__distance">{place.distance}</span>
                )}
              </div>
              <button
                type="button"
                className="place-suggestions__navigate"
                onClick={(e) => {
                  e.stopPropagation()
                  onNavigate?.(place)
                }}
              >
                Navigate
              </button>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
