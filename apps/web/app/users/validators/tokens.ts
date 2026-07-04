import vine from '@vinejs/vine'

export const createTokenValidator = vine.create({
  name: vine.string().trim().minLength(3).maxLength(255).optional(),
})
