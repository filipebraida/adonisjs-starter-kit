import emitter from '@adonisjs/core/services/emitter'
import i18nManager from '@adonisjs/i18n/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import InviteUser from '#users/actions/invite_user'
import ManageRolesUnauthorizedException from '#users/exceptions/manage_roles_unauthorized'
import ResetPasswordToken from '#users/models/reset_password_token'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { currentRoleNames, ensureBaseRoles, withRole } from '#tests/helpers/rbac'

test.group('InviteUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  // Fake the event so the mail listener (which builds a signed URL) doesn't run.
  let fake: ReturnType<typeof emitter.fake>
  group.each.setup(() => {
    fake = emitter.fake(['user:registered'])
    return () => emitter.restore()
  })

  const i18n = () => i18nManager.locale(i18nManager.defaultLocale)

  test('admin convida user comum: cria user, atribui papel, gera token, emite evento', async ({
    db,
    assert,
  }) => {
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const convidado = await new InviteUser().handle({
      email: 'convidado@example.test',
      role: ROLES.USER,
      description: 'Seja bem-vindo',
      executor: admin,
      i18n: i18n(),
    })

    await db.assertHas('users', { email: 'convidado@example.test' })

    const roles = await currentRoleNames(convidado)
    assert.deepEqual(roles, [ROLES.USER])

    const token = await ResetPasswordToken.query().where('userId', convidado.id).firstOrFail()
    assert.isNotEmpty(token.token)

    fake.assertEmitted('user:registered')
  })

  test('user comum NAO pode convidar admin', async ({ db, assert }) => {
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    await assert.rejects(
      () =>
        new InviteUser().handle({
          email: 'escalador@example.test',
          role: ROLES.ADMIN,
          executor,
          i18n: i18n(),
        }),
      ManageRolesUnauthorizedException
    )

    await db.assertMissing('users', { email: 'escalador@example.test' })
    fake.assertNoneEmitted()
  })
})
