import { registry } from '@generated/registry'
import { createTuyau } from '@tuyau/core/client'

export const client = createTuyau({
  // The page and the API share an origin, and `urlFor` only returns the path. The browser keeps a
  // full origin because `client.current()` parses the base with `new URL`.
  baseUrl: typeof window !== 'undefined' ? window.location.origin : '/',
  registry,
})

export const urlFor = client.urlFor
