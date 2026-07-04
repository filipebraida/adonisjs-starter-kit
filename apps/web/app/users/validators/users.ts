import vine from '@vinejs/vine'

import { baseSearchValidator } from '#common/validators/search'

import User from '#users/models/user'
import { ROLES } from '#users/enums/role'
import { SORT_DIRECTIONS, USERS_SORT_BY } from '#users/enums/sort'

const roleValues = Object.values(ROLES)

export const createUserValidator = vine.create({
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

export const editUserValidator = vine.withMetaData<{ userId: number }>().create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  email: vine
    .string()
    .email()
    .toLowerCase()
    .trim()
    .unique(async (_, value, field) => {
      const row = await User.query().where('email', value).whereNot('id', field.meta.userId).first()
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

export const listUserValidator = vine.create({
  ...baseSearchValidator.getProperties(),
  roles: vine.array(vine.enum(roleValues)).optional(),
  sort: vine.enum(USERS_SORT_BY).optional(),
  order: vine.enum(SORT_DIRECTIONS).optional(),
})

export const inviteUserValidator = vine.create({
  email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
  description: vine.string().trim().optional(),
  role: vine.enum(roleValues),
})

export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  avatar: vine
    .file({
      extnames: ['png', 'jpg', 'jpeg', 'gif'],
      size: 1 * 1024 * 1024,
    })
    .nullable(),
})

export const updatePasswordValidator = vine.create({
  password: vine
    .string()
    .minLength(8)
    .maxLength(255)
    .confirmed({ confirmationField: 'passwordConfirmation' }),
})
