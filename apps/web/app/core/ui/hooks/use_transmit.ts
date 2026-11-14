import { type Transmit } from '@adonisjs/transmit-client'

let transmitSingleton: Transmit | null = null
let transmitPromise: Promise<Transmit> | null = null

/**
 * Single Transmit (SSE) client per tab, lazily loaded (its own chunk).
 * All channel subscriptions reuse the same EventSource at `/__transmit/events`.
 */
export async function getTransmitSingleton(): Promise<Transmit> {
  if (transmitSingleton) return transmitSingleton

  if (!transmitPromise) {
    transmitPromise = (async () => {
      const { Transmit } = await import('@adonisjs/transmit-client')
      const instance = new Transmit({ baseUrl: window.location.origin })
      transmitSingleton = instance
      return instance
    })()
  }

  return transmitPromise
}
