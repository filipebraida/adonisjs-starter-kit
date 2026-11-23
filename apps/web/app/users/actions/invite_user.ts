import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import db from '@adonisjs/lucid/services/db'
import type { I18n } from '@adonisjs/i18n'
import { AuthzService } from '@adonis-agora/authz'

import { requireExistingRole, requireManageRolesIfEscalating } from '#auth/actions/sync_user_roles'
import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'

export interface InviteUserInput {
  email: string
  role: string
  description?: string
  executor: User
  i18n: I18n
}

/**
 * Invites a user: creates the account with its role and a reset token in one
 * transaction, then emits `user:registered`, whose listeners send the welcome
 * mail and notification. A failure halfway leaves no account without a role or
 * a link, and announces nothing.
 * @throws ManageRolesUnauthorizedException if granting a role above user without the capability.
 * @throws RoleNotFoundException if the role does not exist.
 */
export default class InviteUser {
  async handle(input: InviteUserInput): Promise<User> {
    await requireManageRolesIfEscalating(input.executor, [input.role])
    await requireExistingRole(input.role)

    const authz = await app.container.make(AuthzService)
    const { user, token } = await db.transaction(async (trx) => {
      const created = await User.create({ email: input.email }, { client: trx })
      await authz.store.withClient(trx).assignRole(authz.refOf(created)!, input.role)
      await created.auditCustom(AUDIT_EVENTS.USER_INVITED, { new: { role: input.role } })
      return { user: created, ...(await new PasswordResetService().generateToken(created)) }
    })

    const translations = {
      subject: input.i18n.t('users.emails.welcome.subject'),
      title: input.i18n.t('users.emails.welcome.title', {
        full_name: user.fullName ?? user.email,
      }),
      subtitle: input.i18n.t('users.emails.welcome.subtitle'),
      actionBtn: input.i18n.t('users.emails.welcome.action_btn'),
      defaultMessage: input.i18n.t('users.emails.welcome.default_message'),
    }

    await emitter.emit('user:registered', {
      user,
      token,
      translations,
      message: input.description,
    })

    return user
  }
}
