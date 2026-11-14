/**
 * The `event` of every audit row the kit writes: the model CRUD events the
 * library records on its own, plus the security events actions record with
 * `auditCustom`. Labels are i18n keys (`users.activity.events.<value>`),
 * never stored here.
 */
export const AUDIT_EVENTS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  ROLES_SYNCED: 'roles_synced',
  IMPERSONATION_STARTED: 'impersonation_started',
  TOKEN_CREATED: 'token_created',
  TOKEN_REVOKED: 'token_revoked',
  USER_INVITED: 'user_invited',
} as const

export type AuditEvent = (typeof AUDIT_EVENTS)[keyof typeof AUDIT_EVENTS]

export const AUDIT_EVENT_KEYS = Object.values(AUDIT_EVENTS) as [AuditEvent, ...AuditEvent[]]
