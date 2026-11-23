export const policies = {
  UserPolicy: () => import('#users/policies/user_policy'),
  ImpersonatePolicy: () => import('#users/policies/impersonate_policy'),
  TokenPolicy: () => import('#users/policies/token_policy'),
  RolePolicy: () => import('#auth/policies/role_policy'),

  DashboardPolicy: () => import('#analytics/policies/dashboard_policy'),
  NotificationPolicy: () => import('#notifications/policies/notification_policy'),
}
