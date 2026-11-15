import type { HttpContext } from '@adonisjs/core/http'

import { AUDIT_EVENT_KEYS } from '#auth/enums/audit_event'
import User from '#auth/models/user'
import UserPolicy from '#users/policies/user_policy'
import ListAudits from '#users/queries/list_audits'
import AuditTransformer from '#users/transformers/audit_transformer'
import { listAuditsValidator } from '#users/validators/audits'

/** The audit trail: what each user did, when and from where. */
export default class ActivityController {
  async handle({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewActivity')

    const payload = await request.validateUsing(listAuditsValidator)

    const audits = await new ListAudits().handle(
      { actorId: payload.actorId, q: payload.q, event: payload.event },
      { page: payload.page ?? 1, perPage: payload.perPage ?? 10 }
    )

    // The filtered user's name, so the filter bar can say whose activity it shows.
    const actor = payload.actorId ? await User.find(payload.actorId) : null

    return inertia.render('users/activity', {
      audits: AuditTransformer.paginate(audits.all(), audits.getMeta()).useVariant('forActivity'),
      events: AUDIT_EVENT_KEYS,
      q: payload.q,
      actor: actor ? { id: actor.id, name: actor.fullName ?? actor.email } : null,
      event: payload.event ?? null,
    })
  }
}
