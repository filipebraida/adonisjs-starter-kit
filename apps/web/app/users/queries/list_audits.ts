import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Audit } from '@filipebraida/adonis-auditing'

import type { AuditEvent } from '#auth/enums/audit_event'

export interface ListAuditsFilters {
  /** Rows a given user acted in (`audits.user_id`). */
  actorId?: number
  /** Matches the actor's name or e-mail. */
  q?: string
  event?: AuditEvent
}

export interface ListAuditsPagination {
  page: number
  perPage: number
}

// The actor type the core user resolver writes (`audits.user_type`).
const USER_ACTOR = 'user'

/**
 * The audit trail, newest first, for the Activity page: who acted, when,
 * from where and on what. The actor's name and e-mail come joined
 * (`$extras.actor_full_name`, `$extras.actor_email`), and so do the admin's
 * behind an impersonation (`$extras.impersonator_*`); a row written outside
 * a request (seeder, job) has no actor.
 */
export default class ListAudits {
  async handle(
    filters: ListAuditsFilters = {},
    pag: ListAuditsPagination = { page: 1, perPage: 10 }
  ): Promise<ModelPaginatorContract<Audit>> {
    // `audits.user_id` is text: the library's actor is polymorphic.
    const query = Audit.query()
      .select(
        'audits.*',
        'users.full_name as actor_full_name',
        'users.email as actor_email',
        'impersonators.full_name as impersonator_full_name',
        'impersonators.email as impersonator_email'
      )
      .joinRaw('left join users on audits.user_type = ? and audits.user_id = users.id::text', [
        USER_ACTOR,
      ])
      .joinRaw(
        "left join users as impersonators on audits.metadata->>'impersonated_by' = impersonators.id::text"
      )

    if (filters.actorId) {
      query.where('audits.user_type', USER_ACTOR).where('audits.user_id', String(filters.actorId))
    }

    if (filters.q) {
      const term = `%${filters.q}%`
      query.where((actor) => {
        actor.where('users.full_name', 'ilike', term).orWhere('users.email', 'ilike', term)
      })
    }

    if (filters.event) {
      query.where('audits.event', filters.event)
    }

    // Tiebreaker: rows written in the same instant would otherwise swap pages.
    return query
      .orderBy('audits.created_at', 'desc')
      .orderBy('audits.id', 'desc')
      .paginate(pag.page, pag.perPage)
  }
}
