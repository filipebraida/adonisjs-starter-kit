import vine from '@vinejs/vine'

import { baseSearchValidator } from '#core/validators/search'

import User from '#auth/models/user'
import { ROLE_NAME_PATTERN } from '#auth/enums/role'
import { SORT_DIRECTIONS, USERS_SORT_BY } from '#users/enums/sort'

// A role in code or an institutional one: the action checks that it exists.
const role = () => vine.string().trim().regex(ROLE_NAME_PATTERN)

/** A user created by an admin. Without a password the account gets an unguessable one. */
export const createUserValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
  role: role(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(255)
    .confirmed({ confirmationField: 'passwordConfirmation' })
    .optional(),
})

/**
 * A user edited by an admin. The email stays unique among the other users,
 * and without a password the current one is kept.
 */
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
  role: role(),
  password: vine
    .string()
    .minLength(8)
    .maxLength(255)
    .confirmed({ confirmationField: 'passwordConfirmation' })
    .optional(),
})

/** Filters of the users list: search, roles and sort, paginated. */
export const listUserValidator = vine.create({
  ...baseSearchValidator.getProperties(),
  roles: vine.array(role()).optional(),
  sort: vine.enum(USERS_SORT_BY).optional(),
  order: vine.enum(SORT_DIRECTIONS).optional(),
})

/** An invitation: the email to invite, its role and an optional note for the mail. */
export const inviteUserValidator = vine.create({
  email: vine.string().email().toLowerCase().trim().unique({ table: 'users', column: 'email' }),
  description: vine.string().trim().optional(),
  role: role(),
})

/** The signed-in user's profile: name and an optional avatar image up to 1 MB. */
export const updateProfileValidator = vine.create({
  fullName: vine.string().trim().minLength(3).maxLength(255),
  avatar: vine
    .file({
      extnames: ['png', 'jpg', 'jpeg', 'gif'],
      size: 1 * 1024 * 1024,
    })
    .nullable(),
})

/** The signed-in user's new password, typed twice. */
export const updatePasswordValidator = vine.create({
  password: vine
    .string()
    .minLength(8)
    .maxLength(255)
    .confirmed({ confirmationField: 'passwordConfirmation' }),
})
