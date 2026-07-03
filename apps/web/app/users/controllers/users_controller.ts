import type { HttpContext } from '@adonisjs/core/http'

import { modal } from '#core/inertia/modal'

import CreateUser from '#users/actions/create_user'
import DeleteUser from '#users/actions/delete_user'
import UpdateUser from '#users/actions/update_user'
import User from '#users/models/user'
import UserPolicy from '#users/policies/user_policy'
import ListUsers from '#users/queries/list_users'
import UserTransformer from '#users/transformers/user_transformer'
import { createUserValidator, editUserValidator, listUserValidator } from '#users/validators'

export default class UsersController {
  public async index({ bouncer, inertia, request }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('viewList')

    const payload = await request.validateUsing(listUserValidator)

    const users = await new ListUsers().handle(
      { q: payload.q, roles: payload.roles, sort: payload.sort, order: payload.order },
      { page: payload.page ?? 1, perPage: payload.perPage ?? 10 }
    )

    const usersData = users.all()
    await User.preComputeUrls(usersData)

    return inertia.render('users/index', {
      users: UserTransformer.paginate(usersData, users.getMeta()),
      q: payload.q,
      selectedRoles: payload.roles ?? [],
      sort: payload.sort ?? null,
      order: payload.order ?? null,
    })
  }

  public async create({ bouncer, inertia }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    return modal(inertia, 'users/create', {}, { route: 'users.index' })
  }

  public async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    const payload = await request.validateUsing(createUserValidator)

    await new CreateUser().handle({
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      password: payload.password,
      executor: auth.user!,
    })

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

    await new UpdateUser().handle({
      target: user,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      password: payload.password,
      executor: auth.user!,
    })

    return response.redirect().toRoute('users.index')
  }

  public async destroy({ bouncer, params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)

    await bouncer.with(UserPolicy).authorize('delete', user)

    await new DeleteUser().handle({ target: user })

    return response.redirect().toRoute('users.index')
  }
}
