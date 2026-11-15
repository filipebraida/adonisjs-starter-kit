import { useEffect, useRef, useState } from 'react'

import { SearchDebounce } from '#core/utils/search_debounce'

/**
 * A list's search box whose term lives in the URL: what the input shows, and
 * the change handler that searches 300 ms after the last keystroke with the
 * latest `onSearch` (at once when the box is cleared). The debounce is made once per box, so a re-render does
 * not drop the pending search; it is cancelled only on unmount. A term the
 * page receives from elsewhere (back/forward) replaces the input's; the box's
 * own search coming back does not, since the person may have typed on.
 */
export function useSearchBox(term: string | null | undefined, onSearch: (value: string) => void) {
  const incoming = term ?? ''
  const [search, setSearch] = useState(incoming)
  const [seen, setSeen] = useState(incoming)
  const onSearchRef = useRef(onSearch)
  const [debounce] = useState(() => new SearchDebounce(() => onSearchRef.current, incoming))

  // A new term from the props, adjusted during render rather than in an effect.
  if (incoming !== seen) {
    setSeen(incoming)
    if (!debounce.isOwn(incoming)) setSearch(incoming)
  }

  useEffect(() => {
    onSearchRef.current = onSearch
  })
  useEffect(() => {
    debounce.received(incoming)
  }, [debounce, incoming])
  useEffect(() => () => debounce.cancel(), [debounce])

  return {
    search,
    onChange: (value: string) => {
      setSearch(value)
      if (value.trim() === '') debounce.now(value)
      else debounce.type(value)
    },
  }
}
