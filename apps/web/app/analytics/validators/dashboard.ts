import vine from '@vinejs/vine'

import { PERIODS } from '#analytics/enums/period'

export const dashboardQueryValidator = vine.create({
  period: vine.enum(PERIODS).optional(),
})
