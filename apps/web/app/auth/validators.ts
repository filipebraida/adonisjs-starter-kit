import vine from '@vinejs/vine'

import i18nManager from '@adonisjs/i18n/services/main'
const i18n = i18nManager.locale('fr')
vine.messagesProvider = i18n.createMessagesProvider()

export const signUpValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(1).confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)

export const signInValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim(),
    password: vine.string().minLength(1),
  })
)

export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim().normalizeEmail({ gmail_remove_dots: false }),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(1).confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)
