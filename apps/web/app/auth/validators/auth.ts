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

/** The sign in form: email and password, checked against the account by the action. */
export const signInValidator = vine.create({
  email: vine.string().email().toLowerCase().trim(),
  password: vine.string(),
})

/**
 * The forgot password form. The email may be unknown: the action stays silent about it.
 * Normalized as the model stores it (trimmed, lower case) and no further, or an
 * address with a `+` tag or a provider alias would never find its account.
 */
export const forgotPasswordValidator = vine.create({
  email: vine.string().email().toLowerCase().trim(),
})

/** The new password chosen from the reset link, typed twice. The token comes from the URL. */
export const resetPasswordValidator = vine.create({
  password: vine.string().minLength(8).confirmed({ confirmationField: 'passwordConfirmation' }),
})
