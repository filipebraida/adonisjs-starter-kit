import { BaseWorkflow, type WorkflowCtx } from '@adonis-agora/durable'
import mail from '@adonisjs/mail/services/main'
import { urlFor } from '@adonisjs/core/services/url_builder'
import facteur from '@facteurjs/adonisjs/services/main'

import User from '#auth/models/user'
import type { MailBasicTranslation } from '#core/types/mail'
import WelcomeNotification from '#users/mails/welcome_notification'
import UserWelcomeNotification from '#users/notifications/user_welcome_notification'

/** What a welcome needs, kept in the run: plain data, never the model. */
export interface SendWelcomeInput {
  userId: number
  token: string
  translations: MailBasicTranslation
  message?: string
}

/**
 * Welcomes an invited user: mails the link to set a password, then records
 * the in-app notification. Each is its own checkpointed step, so a mail
 * provider outage retries the mail without notifying twice.
 */
export default class SendWelcomeWorkflow extends BaseWorkflow {
  static workflow = { name: 'users.send-welcome', version: '1' }

  async run(ctx: WorkflowCtx, input: SendWelcomeInput) {
    await ctx.localStep(
      'mail',
      async () => {
        const user = await User.findOrFail(input.userId)
        await mail.send(
          new WelcomeNotification(user, input.token, input.translations, input.message)
        )
      },
      { retries: 5, backoff: 'exp', backoffMs: 1000 }
    )

    await ctx.localStep('notification', async () => {
      const user = await User.findOrFail(input.userId)
      await facteur
        .notification(UserWelcomeNotification)
        .params({
          title: input.translations.title,
          body: input.translations.subtitle,
          link: urlFor('settings.index'),
        })
        .to([user])
        .send()
    })
  }
}
