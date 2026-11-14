import { BaseTransformer } from '@adonisjs/core/transformers'
import type { Audit } from '@filipebraida/adonis-auditing'

import type { AuditEvent } from '#auth/enums/audit_event'

/** A value of the trail as the page shows it: text as is, anything else as JSON. */
function display(value: unknown): string | null {
  if (value === null || value === undefined) return null
  return typeof value === 'string' ? value : JSON.stringify(value)
}

/** One row of the audit trail: when, who (and who behind them), from where, what changed. */
export default class AuditTransformer extends BaseTransformer<Audit> {
  toObject() {
    const audit = this.resource
    return {
      id: audit.id,
      createdAt: audit.createdAt.toISO()!,
      event: audit.event as AuditEvent,
      auditableType: audit.auditableType,
      auditableId: Number(audit.auditableId),
    }
  }

  /** Needs the actor joined, as `ListAudits` does. */
  forActivity() {
    const audit = this.resource
    const metadata = audit.metadata ?? {}
    return {
      ...this.toObject(),
      actor:
        audit.userId === null
          ? null
          : {
              id: Number(audit.userId),
              fullName: (audit.$extras.actor_full_name as string | null) ?? null,
              email: (audit.$extras.actor_email as string | null) ?? null,
            },
      impersonatedBy: metadata.impersonated_by ? Number(metadata.impersonated_by) : null,
      ipAddress: display(metadata.ip_address),
      userAgent: display(metadata.user_agent),
      url: display(metadata.url),
      changes: Object.entries(audit.changes()).map(([field, change]) => ({
        field,
        old: display(change.old),
        new: display(change.new),
      })),
    }
  }
}
