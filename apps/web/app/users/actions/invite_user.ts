import emitter from '@adonisjs/core/services/emitter'
import type { I18n } from '@adonisjs/i18n'

import { requireManageRolesIfEscalating } from '#auth/actions/sync_user_roles'
import type { Role as RoleSlug } from '#auth/enums/role'
import User from '#auth/models/user'
import PasswordResetService from '#auth/services/password_reset_service'

export interface InviteUserInput {
  email: string
  role: RoleSlug
  description?: string
  executor: User
  i18n: I18n
}

export default class InviteUser {
  async handle(input: InviteUserInput): Promise<User> {
    await requireManageRolesIfEscalating(input.executor, [input.role])

    const user = await User.create({ email: input.email })
    await user.save()

    await user.assignRole(input.role)

    const { token } = await new PasswordResetService().generateToken(user)

    const translations = {
      subject: input.i18n.t('users.emails.welcome.subject'),
      title: input.i18n.t('users.emails.welcome.title', {
        full_name: user.fullName ?? user.email,
      }),
      subtitle: input.i18n.t('users.emails.welcome.subtitle'),
      actionBtn: input.i18n.t('users.emails.welcome.action_btn'),
      defaultMessage: input.i18n.t('users.emails.welcome.default_message'),
    }

    emitter.emit('user:registered', {
      user,
      token,
      translations,
      message: input.description,
    })

    return user
  }
}
