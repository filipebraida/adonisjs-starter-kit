/** `audits.auditable_type` of each auditable model (its `static auditableName`). */
export const AUDITABLE_TYPES = {
  USER: 'user',
} as const

export type AuditableType = (typeof AUDITABLE_TYPES)[keyof typeof AUDITABLE_TYPES]
