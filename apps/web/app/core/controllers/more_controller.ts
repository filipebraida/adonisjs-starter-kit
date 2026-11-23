import type { HttpContext } from '@adonisjs/core/http'

import MorePolicy from '#core/policies/more_policy'
import { moreValidator } from '#core/validators/more'

/**
 * The phone's "More" page: what does not fit in the tab bar, grouped. It
 * exists in both shells, and the `area` of the query says which one it opens in.
 */
export default class MoreController {
  async handle({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(MorePolicy).authorize('view')

    const { area = 'app' } = await request.validateUsing(moreValidator, { data: request.qs() })

    return inertia.render('core/more', { area })
  }
}
