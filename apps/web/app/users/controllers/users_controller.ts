import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'

import { modal } from '#core/inertia/modal'
import Role from '#users/models/role'
import User from '#users/models/user'

import UserTransformer from '#users/transformers/user_transformer'

import UserPolicy from '#users/policies/user_policy'

import SyncUserRoles, { requireManageRolesIfEscalating } from '#users/actions/sync_user_roles'
import type { Role as RoleSlug } from '#users/enums/role'

import { createUserValidator, editUserValidator, listUserValidator } from '#users/validators'

export default class UsersController {
  public async index({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewList')

    const payload = await request.validateUsing(listUserValidator)

    const limit = payload.perPage || 10
    const page = payload.page || 1
    const querySearch = payload.q || undefined
    const roles = payload.roles ?? []

    const query = User.query().preload('roles')

    if (querySearch) {
      query.where((subquery) => {
        subquery
          .where('full_name', 'ilike', `%${querySearch}%`)
          .orWhere('email', 'ilike', `%${querySearch}%`)
      })
    }

    if (roles.length > 0) {
      query.whereHas('roles', (rolesQuery) => rolesQuery.whereIn('name', roles))
    }

    const users = await query.paginate(page, limit)

    const usersData = users.all()

    await User.preComputeUrls(usersData)

    return inertia.render('users/index', {
      users: UserTransformer.paginate(usersData, users.getMeta()),
      q: querySearch,
      selectedRoles: roles,
    })
  }

  public async create({ bouncer, inertia }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    return modal(inertia, 'users/create', {}, { route: 'users.index' })
  }

  public async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    const payload = await request.validateUsing(createUserValidator)

    await requireManageRolesIfEscalating(auth.user!, [payload.role])

    const user = new User()
    user.merge({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password ? payload.password : randomUUID(),
    })

    await user.save()

    const role = await Role.findByOrFail('name', payload.role)
    await user.assignRole(role)

    return response.redirect().toRoute('users.index')
  }

  public async edit({ bouncer, inertia, params }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.load('roles')

    await bouncer.with(UserPolicy).authorize('update', user)

    return modal(
      inertia,
      'users/edit',
      { user: UserTransformer.transform(user) },
      { route: 'users.index' }
    )
  }

  public async update({ auth, bouncer, params, request, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('update', user)

    const payload = await request.validateUsing(editUserValidator, { meta: { userId: params.id } })
    user.merge({
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password ? payload.password : user.password,
    })

    await user.save()

    await new SyncUserRoles().handle({
      target: user,
      desiredRoles: [payload.role as RoleSlug],
      executor: auth.user!,
    })

    return response.redirect().toRoute('users.index')
  }

  public async destroy({ bouncer, params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('delete', user)

    await user.delete()

    return response.redirect().toRoute('users.index')
  }
}
