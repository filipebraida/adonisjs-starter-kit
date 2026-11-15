import vine from '@vinejs/vine'

import { ROLE_NAME_PATTERN } from '#auth/enums/role'

/** An institutional role's name, shaped like the ones in code. Length apart, so the message says what is wrong. */
export const createRoleValidator = vine.create({
  name: vine.string().trim().toLowerCase().minLength(2).maxLength(50).regex(ROLE_NAME_PATTERN),
})

/** The full list of an institutional role's capabilities, replacing the current one. */
export const updateRoleCapabilitiesValidator = vine.create({
  capabilities: vine.array(vine.string().trim()).distinct(),
})
