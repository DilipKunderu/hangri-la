import { useState, useEffect } from 'react'

// 6.9" display: 2868×1320 px portrait. Aspect = 1320/2868.
const ASPECT_WIDTH = 1320
const ASPECT_HEIGHT = 2868
const PADDING = 32

function getDeviceSize() {
  if (typeof window === 'undefined') return { width: 440, height: 956 }
  const h = window.innerHeight - PADDING
  const w = (h * ASPECT_WIDTH) / ASPECT_HEIGHT
  return { width: Math.round(w), height: Math.round(h) }
}

export default function IPhoneFrame({ children }) {
  const [size, setSize] = useState(getDeviceSize)

  useEffect(() => {
    const update = () => setSize(getDeviceSize())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div className="iphone-frame">
      <div
        className="iphone-frame__device"
        style={{
          width: `${size.width}px`,
          height: `${size.height}px`,
        }}
      >
        <div className="iphone-frame__viewport">
          {children}
        </div>
      </div>
    </div>
  )
}
