import vine from '@vinejs/vine'

/** The slice of the notifications page: all of them, or only the ones not opened yet. */
export const listNotificationsValidator = vine.create({
  filter: vine.enum(['unread'] as const).optional(),
})
