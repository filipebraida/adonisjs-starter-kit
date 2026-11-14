import type { HttpContext } from '@adonisjs/core/http'

import User from '#auth/models/user'
import UserPolicy from '#users/policies/user_policy'
import TokenPolicy from '#users/policies/token_policy'
import ListUserTokens from '#users/queries/list_user_tokens'
import TokenTransformer from '#users/transformers/token_transformer'
import UserTransformer from '#users/transformers/user_transformer'

interface NewToken {
  name: string
  value: string
}

/**
 * The signed-in user's settings page: profile, password and, with the
 * capability, API tokens. A token just created is shown once, from the flash.
 */
export default class SettingsController {
  async show({ auth, bouncer, inertia, session }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('view', auth.user!)

    await User.preComputeUrls(auth.user!)

    const canManageTokens = await bouncer.with(TokenPolicy).allows('viewList')
    const tokens = canManageTokens
      ? TokenTransformer.transform(await new ListUserTokens().handle({ owner: auth.user! }))
      : []

    const newToken = (session.flashMessages.get('newToken') as NewToken | undefined) ?? null

    return inertia.render('users/settings', {
      profile: UserTransformer.transform(auth.user!).useVariant('forProfile'),
      tokens,
      newToken,
    })
  }
}
