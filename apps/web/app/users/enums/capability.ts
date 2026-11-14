export const CAPABILITIES_USERS = {
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

export type CapabilityUsers = (typeof CAPABILITIES_USERS)[keyof typeof CAPABILITIES_USERS]
