import type { HttpContext } from '@adonisjs/core/http'

import User from '#users/models/user'

import TokenDto from '#users/dtos/token'
import { createTokenValidator } from '#users/validators'

export default class TokensController {
  async index({ auth, inertia }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)

    const tokens = await User.accessTokens.all(user)

    return inertia.render('users/tokens', {
      tokens: TokenDto.fromArray(tokens),
    })
  }

  async store({ auth, request }: HttpContext) {
    const user = await User.findOrFail(auth.user!.id)

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
