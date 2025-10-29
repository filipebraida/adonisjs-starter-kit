import vine from '@vinejs/vine'

export const baseSearchValidator = vine.object({
  page: vine.number().withoutDecimals().positive().optional(),
  perPage: vine.number().withoutDecimals().positive().optional(),
  q: vine.string().minLength(1).maxLength(255).optional(),
})
