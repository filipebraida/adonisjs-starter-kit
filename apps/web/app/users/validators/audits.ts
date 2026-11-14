import vine from '@vinejs/vine'

import { AUDIT_EVENT_KEYS } from '#auth/enums/audit_event'
import { baseSearchValidator } from '#core/validators/search'

export const listAuditsValidator = vine.create({
  ...baseSearchValidator.getProperties(),
  actorId: vine.number().withoutDecimals().positive().optional(),
  event: vine.enum(AUDIT_EVENT_KEYS).optional(),
})
