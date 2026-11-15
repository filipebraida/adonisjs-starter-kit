import type { HttpContext } from '@adonisjs/core/http'

import CreateUser from '#users/actions/create_user'
import DeleteUser from '#users/actions/delete_user'
import UpdateUser from '#users/actions/update_user'
import User from '#auth/models/user'
import { institutionalRoles } from '#auth/queries/roles_query'
import ImpersonatePolicy from '#users/policies/impersonate_policy'
import UserPolicy from '#users/policies/user_policy'
import ListUsers from '#users/queries/list_users'
import UserTransformer from '#users/transformers/user_transformer'
import { createUserValidator, editUserValidator, listUserValidator } from '#users/validators/users'

/** User management for admins: list, create, edit and delete, with forms in modals over the list. */
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

    // What this screen lets the signed-in user do, decided by the policies: per page and per row.
    const policy = bouncer.with(UserPolicy)
    const rowCan = Object.fromEntries(
      await Promise.all(
        usersData.map(async (user) => [
          user.id,
          {
            update: await policy.allows('update', user),
            delete: await policy.allows('delete', user),
            impersonate: await bouncer.with(ImpersonatePolicy).allows('create', user),
          },
        ])
      )
    )

    return inertia.render('users/index', {
      users: UserTransformer.paginate(usersData, users.getMeta()).useVariant('forList'),
      can: {
        create: await policy.allows('create'),
        invite: await policy.allows('invite'),
        viewActivity: await policy.allows('viewActivity'),
      },
      rowCan,
      // null, not undefined: a partial reload keeps a missing prop's old value.
      q: payload.q ?? null,
      selectedRoles: payload.roles ?? [],
      institutionalRoles: await institutionalRoles(),
      sort: payload.sort ?? null,
      order: payload.order ?? null,
    })
  }

  public async create({ bouncer, inertia }: HttpContext) {
    await bouncer.with(UserPolicy).authorize('create')

    return inertia.modal(
      'users/create',
      {
        institutionalRoles: await institutionalRoles(),
        canManageRoles: await bouncer.with(UserPolicy).allows('manageRoles'),
      },
      { route: 'users.index' }
    )
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

    return inertia.modal(
      'users/edit',
      {
        user: UserTransformer.transform(user).useVariant('forEdit'),
        institutionalRoles: await institutionalRoles(),
        canManageRoles: await bouncer.with(UserPolicy).allows('manageRoles'),
      },
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
