import type { EventsList } from '@adonisjs/core/types'

import SendPasswordResetWorkflow from '#auth/workflows/send_password_reset_workflow'

/** Schedules the password reset mail; the workflow sends it. */
export default class SendPasswordReset {
  async handle({ user, token, translations }: EventsList['auth:forgot_password']) {
    await SendPasswordResetWorkflow.dispatch({ userId: user.id, token, translations })
  }
}
