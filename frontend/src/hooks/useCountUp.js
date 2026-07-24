import { useEffect, useState, useRef } from 'react'
import { useInView } from 'framer-motion'

/**
 * Animates a number from 0 to `end` once the element scrolls into view.
 */
export function useCountUp(end, duration = 1500) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return
    let start = null
    let frameId

    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * end))
      if (progress < 1) frameId = requestAnimationFrame(step)
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [isInView, end, duration])

  return { ref, value }
}
