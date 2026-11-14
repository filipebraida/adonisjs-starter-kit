import type { EventsList } from '@adonisjs/core/types'

import SendWelcomeWorkflow from '#users/workflows/send_welcome_workflow'

/** Schedules the welcome of a registered user; the workflow sends it. */
export default class SendWelcome {
  async handle({ user, token, translations, message }: EventsList['user:registered']) {
    await SendWelcomeWorkflow.dispatch({ userId: user.id, token, translations, message })
  }
}
