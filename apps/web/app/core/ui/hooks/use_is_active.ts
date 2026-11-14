import { usePage } from '@inertiajs/react'

// Root ('/') only matches exact; others match exact or `${url}/...`
// (so `/users/123/edit` still highlights the `/users` item).
export function isNavItemActive(itemUrl: string | undefined, currentUrl: string): boolean {
  if (!itemUrl) return false
  if (itemUrl === '/') return currentUrl === '/'
  return currentUrl === itemUrl || currentUrl.startsWith(itemUrl + '/')
}

export default function useCurrentUrl(): string {
  const { url } = usePage()
  return url
}
