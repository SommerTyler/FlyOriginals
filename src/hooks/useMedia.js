import { useState, useEffect } from 'react'

export function useMedia() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn, { passive: true })
    return () => window.removeEventListener('resize', fn)
  }, [])

  return {
    isMobile:  w < 640,
    isTablet:  w >= 640 && w < 1024,
    isDesktop: w >= 1024,
    w,
  }
}
