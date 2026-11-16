import { useCallback } from 'react'

import { urlFor } from '~/app/client'

/** Where an article of `space` loads its `images/<file>` from, stable while the space is. */
export function useHelpImageUrl(space: string) {
  return useCallback((file: string) => urlFor('help.image', { space, file }), [space])
}
