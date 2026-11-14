import { permissionSatisfied, useAuthz } from '@adonis-agora/authz-react'

import type { Capability } from '#core/authz/capability'

/**
 * A capability test over the shared `authz` prop, for lists that filter many
 * entries in one render (nav items) where `useCan` — one hook per check —
 * cannot be called. An entry without a capability is always allowed.
 */
export default function useAllows(): (capability?: Capability) => boolean {
  const { permissions } = useAuthz()
  return (capability) => !capability || permissionSatisfied(permissions, capability)
}
