import vine from '@vinejs/vine'

/** A new API token. Without a name it is called "Secret Token". */
export const createTokenValidator = vine.create({
  name: vine.string().trim().minLength(3).maxLength(255).optional(),
})
