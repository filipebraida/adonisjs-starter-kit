import { type HttpContext } from '@adonisjs/core/http'
import type { Resolver } from '@filipebraida/adonis-auditing/types'

export default class IpAddressResolver implements Resolver {
  async resolve(ctx: HttpContext) {
    return ctx.request.ip()
  }
}
