import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import TokenDto from '#users/dtos/token'

import TokenPolicy from '#users/policies/token_policy'

import { createTokenValidator } from '#users/validators'

export default class TokensController {
  async index({ auth, bouncer, inertia }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)

    await bouncer.with(TokenPolicy).authorize('viewList')

    const tokens = await User.accessTokens.all(user)

    return inertia.render('users/tokens', {
      tokens: TokenDto.fromArray(tokens),
    })
  }

  async store({ auth, bouncer, request }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)

    await bouncer.with(TokenPolicy).authorize('create')

    const payload = await request.validateUsing(createTokenValidator)

    const token = await User.accessTokens.create(user, undefined, {
      name: payload.name ? payload.name : 'Secret Token',
    })

    return {
      type: token.type,
      token: token.value!.release(),
    }
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)
    await User.accessTokens.delete(user, params.id)

    return response.redirect().toRoute('tokens.index')
  }
}
