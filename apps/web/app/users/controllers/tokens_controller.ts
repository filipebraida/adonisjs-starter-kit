import type { HttpContext } from '@adonisjs/core/http'

import CreateToken from '#users/actions/create_token'
import DeleteToken from '#users/actions/delete_token'
import TokenPolicy from '#users/policies/token_policy'
import { createTokenValidator } from '#users/validators/tokens'

/** Creates and revokes the signed-in user's API tokens. A new secret is flashed to the settings page once. */
export default class TokensController {
  async store({ auth, bouncer, request, response, session }: HttpContext) {
    await bouncer.with(TokenPolicy).authorize('create')

    const owner = auth.getUserOrFail()
    const payload = await request.validateUsing(createTokenValidator)

    const created = await new CreateToken().handle({ owner, name: payload.name })

    session.flash('newToken', {
      name: payload.name ?? 'Secret Token',
      value: created.token,
    })

    return response.redirect().toRoute('settings.index')
  }

  async destroy({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(TokenPolicy).authorize('delete')

    const owner = auth.getUserOrFail()
    await new DeleteToken().handle({ owner, tokenId: params.id })

    return response.redirect().toRoute('settings.index')
  }
}
