import { PERMISSIONS } from '#users/enums/permission'
import type User from '#users/models/user'

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
