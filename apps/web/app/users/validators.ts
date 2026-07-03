import vine from '@vinejs/vine'

import User from '#users/models/user'

import { baseSearchValidator } from '#common/validators/search'

import { ROLES } from '#users/enums/role'

const roleValues = Object.values(ROLES)

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    role: vine.enum(roleValues),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    avatar: vine
      .file({
        extnames: ['png', 'jpg', 'jpeg', 'gif'],
        size: 1 * 1024 * 1024,
      })
      .nullable(),
  })
)

export const listUserValidator = vine.compile(
  vine.object({
    ...baseSearchValidator.getProperties(),
    roles: vine.array(vine.enum(roleValues)).optional(),
  })
)

export const createTokenValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255).optional(),
  })
)

export const inviteUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
    description: vine.string().trim().optional(),
    role: vine.enum(roleValues),
  })
)

export const updatePasswordValidator = vine.compile(
  vine.object({
    password: vine
      .string()
      .minLength(8)
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
    role: vine.enum(roleValues),
    password: vine
      .string()
      .minLength(8)
      .maxLength(255)
      .confirmed({ confirmationField: 'passwordConfirmation' })
      .optional(),
  })
)
