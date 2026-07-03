import type { HttpContext } from '@adonisjs/core/http'

import CreateToken from '#users/actions/create_token'
import DeleteToken from '#users/actions/delete_token'
import User from '#users/models/user'
import TokenPolicy from '#users/policies/token_policy'
import ListUserTokens from '#users/queries/list_user_tokens'
import TokenTransformer from '#users/transformers/token_transformer'
import { createTokenValidator } from '#users/validators'

export default class TokensController {
  async index({ auth, bouncer, inertia }: HttpContext) {
    await bouncer.with(TokenPolicy).authorize('viewList')

    const owner = await User.findOrFail(auth.user!.id)
    const tokens = await new ListUserTokens().handle({ owner })

    return inertia.render('users/tokens', {
      tokens: TokenTransformer.transform(tokens),
    })
  }

  async store({ auth, bouncer, request }: HttpContext) {
    await bouncer.with(TokenPolicy).authorize('create')

    const owner = await User.findOrFail(auth.user!.id)
    const payload = await request.validateUsing(createTokenValidator)

    return new CreateToken().handle({ owner, name: payload.name })
  }

  async destroy({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(TokenPolicy).authorize('delete')

    const owner = await User.findOrFail(auth.user!.id)
    await new DeleteToken().handle({ owner, tokenId: params.id })

    return response.redirect().toRoute('tokens.index')
  }
}
