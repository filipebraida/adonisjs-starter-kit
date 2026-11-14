import { BaseWorkflow, type WorkflowCtx } from '@adonis-agora/durable'
import mail from '@adonisjs/mail/services/main'

import ResetPasswordNotification from '#auth/mails/reset_password_notification'
import User from '#auth/models/user'
import type { MailBasicTranslation } from '#core/models/mail_basic_translation'

/** What a reset mail needs, kept in the run: plain data, never the model. */
export interface SendPasswordResetInput {
  userId: number
  token: string
  translations: MailBasicTranslation
}

/** Mails the password reset link, retrying while the mail provider is down. */
export default class SendPasswordResetWorkflow extends BaseWorkflow {
  static workflow = { name: 'auth.send-password-reset', version: '1' }

  async run(ctx: WorkflowCtx, input: SendPasswordResetInput) {
    await ctx.localStep(
      'mail',
      async () => {
        const user = await User.findOrFail(input.userId)
        await mail.send(new ResetPasswordNotification(user, input.token, input.translations))
      },
      { retries: 5, backoff: 'exp', backoffMs: 1000 }
    )
  }
}
