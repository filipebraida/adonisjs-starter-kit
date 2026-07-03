/**
 * The full set of static capabilities the application supports.
 *
 * Naming convention: keys are camelCase for autocomplete ergonomics, values
 * are `resource.action` snake_case strings that get persisted in
 * `roles.permissions` and checked by `user.hasPermission(...)`.
 *
 * To add a permission: add an entry here, grant it to the relevant role in
 * the seeder (or via a UI/migration), and reference it wherever authorization
 * is required. New keys are picked up by the `Permission` union automatically.
 */
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
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

const PERMISSION_VALUES = new Set<string>(Object.values(PERMISSIONS))

export function isPermission(value: string): value is Permission {
  return PERMISSION_VALUES.has(value)
}

/** All permissions in the catalog — useful for seeding an "admin has everything" role. */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[]
