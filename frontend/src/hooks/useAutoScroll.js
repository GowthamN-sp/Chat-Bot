/**
 * useAutoScroll — scrolls a container to the bottom whenever deps change.
 * Also exposes a `scrollToBottom` function for manual triggering.
 */
import { useRef, useEffect, useCallback } from 'react'

export function useAutoScroll(deps = []) {
  const ref = useRef(null)

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (ref.current) {
      ref.current.scrollTo({ top: ref.current.scrollHeight, behavior })
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ref, scrollToBottom }
}
