import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import User from '#users/models/user'
import Role from '#users/models/role'

import UserDto from '#users/dtos/user'
import RoleDto from '#users/dtos/role'

import UserPolicy from '#users/policies/user_policy'

import { createUserValidator, editUserValidator } from '#users/validators'

export default class UsersController {
  public async index({ bouncer, inertia, request, i18n }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewList')

    const limit = request.input('perPage', 10)
    const page = request.input('page', 1)

    const users = await User.query().preload('role').paginate(page, limit)
    const roles = await Role.all()

    await User.preComputeUrls(users)

    return inertia.render('users/index', {
      users: UserDto.fromPaginator(users),
      roles: RoleDto.fromArray(roles).map((role) => {
        return {
          ...role,
          name: i18n.t(`users.roles.${role.id}.name`),
          description: i18n.t(`users.roles.${role.id}.description`),
        }
      }),
    })
  }

  public async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    const payload = await request.validateUsing(createUserValidator)

    const user = new User()
    user.merge({
      ...payload,
      password: payload.password ? payload.password : cuid(),
    })

    await user.save()

    return response.redirect().toRoute('users.index')
  }

  public async update({ bouncer, params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('update', user)

    const payload = await request.validateUsing(editUserValidator, { meta: { userId: params.id } })
    user.merge({
      ...payload,
      password: payload.password ? payload.password : user.password,
    })

    await user.save()

    return response.redirect().toRoute('users.index')
  }

  public async destroy({ bouncer, params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('delete', user)

    await user.delete()

    return response.redirect().toRoute('users.index')
  }
}
