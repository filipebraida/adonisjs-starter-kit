import { type HttpContext } from '@adonisjs/core/http'
import type { Resolver } from '@filipebraida/adonis-auditing/types'

export default class UserAgentResolver implements Resolver {
  async resolve(ctx: HttpContext) {
    return ctx.request.header('user-agent') ?? null
  }
}
