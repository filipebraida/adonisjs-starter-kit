import { type Transmit } from '@adonisjs/transmit-client'

let transmitSingleton: Transmit | null = null
let transmitPromise: Promise<Transmit> | null = null

// crypto.randomUUID only exists in secure contexts (HTTPS or localhost); over
// plain HTTP on a LAN hostname the client's default generator throws.
function clientUid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Single Transmit (SSE) client per tab, lazily loaded (its own chunk).
 * All channel subscriptions reuse the same EventSource at `/__transmit/events`.
 */
export async function getTransmitSingleton(): Promise<Transmit> {
  if (transmitSingleton) return transmitSingleton

  if (!transmitPromise) {
    transmitPromise = (async () => {
      const { Transmit } = await import('@adonisjs/transmit-client')
      const instance = new Transmit({ baseUrl: window.location.origin, uidGenerator: clientUid })
      transmitSingleton = instance
      return instance
    })()
  }

  return transmitPromise
}
