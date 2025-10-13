import type { HttpContext } from '@adonisjs/core/http'
import { cuid } from '@adonisjs/core/helpers'

import User from '#users/models/user'
import Role from '#users/models/role'

import UserDto from '#users/dtos/user'
import RoleDto from '#users/dtos/role'

import UserPolicy from '#users/policies/user_policy'

import { createUserValidator, editUserValidator, listUserValidator } from '#users/validators'

export default class UsersController {
  public async index({ bouncer, inertia, request, i18n }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewList')

    const payload = await request.validateUsing(listUserValidator)

    const limit = payload.perPage || 2
    const page = payload.page || 1
    const querySearch = payload.q || undefined
    const roleIds = payload.roleIds || []

    const query = User.query()

    if (querySearch) {
      query.where((subquery) => {
        subquery
          .where('full_name', 'ilike', `%${querySearch}%`)
          .orWhere('email', 'ilike', `%${querySearch}%`)
      })
    }

    if (Array.isArray(roleIds) && roleIds.length > 0) {
      query.andWhereIn('role_id', roleIds)
    }

    const users = await query.preload('role').paginate(page, limit)
    const roles = await Role.all()

    await User.preComputeUrls(users)

    return inertia.render('users/index', {
      users: UserDto.fromPaginator(users),
      q: querySearch,
      selectedRoles: roleIds,
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
