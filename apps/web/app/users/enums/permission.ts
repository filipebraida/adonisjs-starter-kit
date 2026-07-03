export const PERMISSIONS = {
  usersViewList: 'users.view_list',
  usersCreate: 'users.create',
  usersUpdate: 'users.update',
  usersDelete: 'users.delete',
  usersInvite: 'users.invite',
  usersImpersonate: 'users.impersonate',
  usersManageRoles: 'users.manage_roles',
  tokensViewList: 'tokens.view_list',
  tokensCreate: 'tokens.create',
  tokensDelete: 'tokens.delete',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const PERMISSION_VALUES = new Set<string>(Object.values(PERMISSIONS))

export function isPermission(value: string): value is Permission {
  return PERMISSION_VALUES.has(value)
}

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[]
