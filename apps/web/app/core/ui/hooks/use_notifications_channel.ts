import { useEffect } from 'react'

import { getTransmitSingleton } from '#core/ui/hooks/use_transmit'

/**
 * Subscribes the logged-in user to their personal SSE channel
 * (`notifications/users/<id>`) and calls `onMessage` on every event. Reuses
 * the singleton Transmit client: one EventSource per tab.
 *
 * On unmount it removes only its handler and keeps the subscription. The
 * client holds one subscription per channel, shared by everyone: deleting it
 * would unsubscribe the page that just mounted on the same channel (its
 * `create()` sees the subscription still created and does nothing, and the
 * `delete()` finishes afterwards).
 */
export function useNotificationsChannel(userId: number | undefined, onMessage: () => void) {
  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let stopListening: (() => void) | null = null

    const init = async () => {
      const transmit = await getTransmitSingleton()
      if (cancelled) return

      const sub = transmit.subscription(`notifications/users/${userId}`)
      stopListening = sub.onMessage(() => onMessage())
      void sub.create()
    }

    void init()

    return () => {
      cancelled = true
      stopListening?.()
    }
  }, [userId, onMessage])
}
