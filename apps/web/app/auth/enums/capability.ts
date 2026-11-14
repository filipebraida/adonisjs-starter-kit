export const CAPABILITIES_AUTH = {
  usersManageRoles: 'users.manage_roles',
} as const

export type CapabilityAuth = (typeof CAPABILITIES_AUTH)[keyof typeof CAPABILITIES_AUTH]
