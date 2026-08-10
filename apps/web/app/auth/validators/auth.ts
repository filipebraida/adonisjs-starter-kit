import vine from '@vinejs/vine'

/**
 * "passwordConfirmation" is declared explicitly, so that it is part of the
 * request body type shared with the frontend. Otherwise the signup form has
 * no way to know about the errors reported for this field.
 */
export const signUpValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).confirmed({ confirmationField: 'passwordConfirmation' }),
  passwordConfirmation: vine.string(),
})

export const signInValidator = vine.create({
  email: vine.string().email().toLowerCase().trim(),
  password: vine.string(),
})

export const forgotPasswordValidator = vine.create({
  email: vine.string().email().trim().normalizeEmail({ gmail_remove_dots: false }),
})

export const resetPasswordValidator = vine.create({
  password: vine.string().minLength(8).confirmed({ confirmationField: 'passwordConfirmation' }),
})
