import { usePage } from '@inertiajs/react'

import { isSection, type NavMainItem } from '#core/ui/app/navigation_types'

function matches(itemUrl: string, path: string): boolean {
  if (itemUrl === '/') return path === '/'
  return path === itemUrl || path.startsWith(itemUrl + '/')
}

/**
 * The URL of the one nav item to highlight: the most specific item whose URL
 * is the current path or a prefix of it. `/users/123/edit` still highlights
 * `/users`, while `/users/activity` highlights its own item and not `/users`.
 */
export function activeNavUrl(items: NavMainItem[], currentUrl: string): string | null {
  const path = currentUrl.split(/[?#]/)[0]
  const urls = items.flatMap((item) => (isSection(item) ? item.items : [item])).map((i) => i.url)

  let best: string | null = null
  for (const url of urls) {
    if (url && !url.startsWith('http') && matches(url, path)) {
      if (!best || url.length > best.length) best = url
    }
  }
  return best
}

export default function useActiveNavUrl(items: NavMainItem[]): string | null {
  const { url } = usePage()
  return activeNavUrl(items, url)
}
