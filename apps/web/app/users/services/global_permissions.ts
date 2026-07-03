import { PERMISSIONS } from '#users/enums/permission'
import type User from '#users/models/user'

/**
 * Global UI flags shared with every Inertia page as the `can` shared prop.
 * These drive layout-level decisions (menus, sidebars) — NOT per-resource
 * gates. For per-resource permissions, pass a `permissions: { ... }` prop
 * from the controller after calling `bouncer.with(Policy).allows(...)`.
 *
 * To add a new global flag:
 *   1. Add a field to this type;
 *   2. Add the check inside `globalPermissions()`;
 *   3. Add the field to `EMPTY_GLOBAL_PERMISSIONS`.
 * The type flows automatically to the `useCan()` hook in the frontend.
 */
export type GlobalPermissions = {
  manageUsers: boolean
  manageTokens: boolean
}

export const EMPTY_GLOBAL_PERMISSIONS: GlobalPermissions = {
  manageUsers: false,
  manageTokens: false,
}

export async function globalPermissions(user: User | undefined): Promise<GlobalPermissions> {
  if (!user) return EMPTY_GLOBAL_PERMISSIONS
  return {
    manageUsers: await user.hasPermission(PERMISSIONS.usersViewList),
    manageTokens: await user.hasPermission(PERMISSIONS.tokensViewList),
  }
}
