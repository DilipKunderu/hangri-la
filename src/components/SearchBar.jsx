import { useState, useCallback, useRef } from 'react'

const DEBOUNCE_MS = 400

export default function SearchBar({ onSearch, placeholder = "e.g. I'm hungry, need food right now", disabled }) {
  const [value, setValue] = useState('')
  const timeoutRef = useRef(null)

  const handleChange = useCallback(
    (e) => {
      const next = e.target.value
      setValue(next)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (!next.trim()) {
        onSearch?.([])
        return
      }
      timeoutRef.current = setTimeout(() => {
        onSearch?.(next)
      }, DEBOUNCE_MS)
    },
    [onSearch]
  )

  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Search for places"
      />
    </div>
  )
}
