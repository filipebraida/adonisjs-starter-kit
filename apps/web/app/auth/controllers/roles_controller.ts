import type { HttpContext } from '@adonisjs/core/http'

import CreateRole from '#auth/actions/create_role'
import DeleteRole from '#auth/actions/delete_role'
import UpdateRoleCapabilities from '#auth/actions/update_role_capabilities'
import RolePolicy from '#auth/policies/role_policy'
import RolesMatrix from '#auth/queries/roles_matrix'
import { createRoleValidator, updateRoleCapabilitiesValidator } from '#auth/validators/roles'

/** The roles and what they grant: roles in code are shown, institutional ones are created, edited and deleted here. */
export default class RolesController {
  async index({ bouncer, inertia }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('viewList')

    return inertia.render('auth/roles/index', await new RolesMatrix().handle())
  }

  async create({ bouncer, inertia }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('manage')

    return inertia.modal('auth/roles/create', {}, { route: 'roles.index' })
  }

  async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('manage')

    const { name } = await request.validateUsing(createRoleValidator)
    await new CreateRole().handle({ name, executor: auth.getUserOrFail() })

    return response.redirect().toRoute('roles.index')
  }

  async update({ auth, bouncer, params, request, response }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('manage')

    const { capabilities } = await request.validateUsing(updateRoleCapabilitiesValidator)
    await new UpdateRoleCapabilities().handle({
      role: params.id,
      capabilities,
      executor: auth.getUserOrFail(),
    })

    return response.redirect().toRoute('roles.index')
  }

  async destroy({ auth, bouncer, params, response }: HttpContext) {
    await bouncer.with(RolePolicy).authorize('manage')

    await new DeleteRole().handle({ role: params.id, executor: auth.getUserOrFail() })

    return response.redirect().toRoute('roles.index')
  }
}
