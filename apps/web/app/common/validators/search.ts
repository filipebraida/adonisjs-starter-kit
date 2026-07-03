import vine from '@vinejs/vine'

export const MAX_PER_PAGE = 50

export const baseSearchValidator = vine.object({
  page: vine.number().withoutDecimals().positive().optional(),
  perPage: vine.number().withoutDecimals().positive().max(MAX_PER_PAGE).optional(),
  q: vine.string().minLength(1).maxLength(255).optional(),
})
