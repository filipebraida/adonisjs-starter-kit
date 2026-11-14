import vine from '@vinejs/vine'

import { PERIODS } from '#analytics/enums/period'

/** The dashboard query string: the period, defaulting in the controller when absent. */
export const dashboardQueryValidator = vine.create({
  period: vine.enum(PERIODS).optional(),
})
