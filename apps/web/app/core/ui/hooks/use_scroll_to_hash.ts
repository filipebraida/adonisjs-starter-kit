import { useEffect } from 'react'

/** The section an address's `#fragment` points at, decoded; `null` for none or a mangled one. */
export function hashSection(hash: string): string | null {
  const raw = hash.replace(/^#/, '')
  if (!raw) return null
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

/**
 * On a page whose text arrives after the browser looked for the address's section, scrolls to it
 * once `key` changes, or to the top when the address has none.
 */
export function useScrollToHash(key: string) {
  useEffect(() => {
    const id = hashSection(window.location.hash)
    const target = id ? document.getElementById(id) : null
    if (target) target.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
  }, [key])
}
