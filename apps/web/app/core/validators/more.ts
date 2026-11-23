import vine from '@vinejs/vine'

/** The shell the "More" page opens in; without it, the app's own. */
export const moreValidator = vine.create({
  area: vine.enum(['app', 'admin'] as const).optional(),
})
