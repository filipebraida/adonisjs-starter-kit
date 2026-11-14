import { type HttpContext } from '@adonisjs/core/http'
import type { Resolver } from '@filipebraida/adonis-auditing/types'

export default class UrlResolver implements Resolver {
  async resolve(ctx: HttpContext) {
    return ctx.request.url(true)
  }
}
