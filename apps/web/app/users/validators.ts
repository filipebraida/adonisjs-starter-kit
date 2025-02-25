import vine from '@vinejs/vine'
import User from './models/user.js'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    roleId: vine.number().exists({ table: 'roles', column: 'id' }),
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' }),
  })
)

export const editUserValidator = vine.withMetaData<{ userId: number }>().compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine
      .string()
      .email()
      .toLowerCase()
      .trim()
      .unique(async (_, value, field) => {
        const row = await User.query()
          .where('email', value)
          .whereNot('id', field.meta.userId)
          .first()
        return row ? false : true
      }),
    roleId: vine.number().exists({ table: 'roles', column: 'id' }),
    password: vine
      .string()
      .minLength(1)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)
