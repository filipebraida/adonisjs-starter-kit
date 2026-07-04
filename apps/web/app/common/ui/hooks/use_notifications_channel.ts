import { useEffect } from 'react'

import { getTransmitSingleton } from '#common/ui/hooks/use_transmit'

/**
 * Subscribes the logged-in user to their personal SSE channel
 * (`notifications/user-<id>`) and calls `onMessage` on every event. Reuses
 * the singleton Transmit client — one EventSource per tab.
 */
export function useNotificationsChannel(userId: number | undefined, onMessage: () => void) {
  useEffect(() => {
    if (!userId) return

    let cancelled = false
    let subscription: { delete?: () => void } | null = null

    const init = async () => {
      const transmit = await getTransmitSingleton()
      if (cancelled) return

      const sub = transmit.subscription(`notifications/user-${userId}`)
      sub.onMessage(() => onMessage())
      void sub.create()
      subscription = sub
    }

    void init()

    return () => {
      cancelled = true
      subscription?.delete?.()
    }
  }, [userId, onMessage])
}
