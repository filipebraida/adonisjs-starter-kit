import emitter from '@adonisjs/core/services/emitter'
import i18nManager from '@adonisjs/i18n/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

import InviteUser from '#users/actions/invite_user'
import ManageRolesUnauthorizedException from '#auth/exceptions/manage_roles_unauthorized_exception'
import ResetPasswordToken from '#auth/models/reset_password_token'
import PasswordResetService from '#auth/services/password_reset_service'
import { ROLES } from '#auth/enums/role'
import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'
import { withRole } from '#tests/helpers/rbac'

test.group('InviteUser', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  const i18n = () => i18nManager.locale(i18nManager.defaultLocale)

  test('admin invites a regular user: creates user, assigns role, generates token, emits event', async ({
    db,
    assert,
  }) => {
    // Fake the event so the mail listener (which builds a signed URL) doesn't run.
    using fake = emitter.fake(['user:registered'])
    const email = taggedEmail(marker('convidado'))
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)

    const convidado = await new InviteUser().handle({
      email,
      role: ROLES.USER,
      description: 'Seja bem-vindo',
      executor: admin,
      i18n: i18n(),
    })

    await db.assertHas('users', { id: convidado.id, email })

    const roles = await convidado.getRoles()
    assert.deepEqual(roles, [ROLES.USER])

    const token = await ResetPasswordToken.query().where('userId', convidado.id).firstOrFail()
    assert.isNotEmpty(token.token)

    fake.assertEmitted('user:registered')
  })

  test('regular user CANNOT invite an admin', async ({ db, assert }) => {
    using fake = emitter.fake(['user:registered'])
    const email = taggedEmail(marker('escalador'))
    const executor = await UserFactory.create()
    await withRole(executor, ROLES.USER)

    await assert.rejects(
      () =>
        new InviteUser().handle({
          email,
          role: ROLES.ADMIN,
          executor,
          i18n: i18n(),
        }),
      ManageRolesUnauthorizedException
    )

    await db.assertMissing('users', { email })
    fake.assertNoneEmitted()
  })

  test('a failure halfway leaves no account behind, and announces nothing', async ({
    db,
    assert,
  }) => {
    using fake = emitter.fake(['user:registered'])
    const email = taggedEmail(marker('halfway'))
    const admin = await UserFactory.create()
    await withRole(admin, ROLES.ADMIN)
    sinon
      .stub(PasswordResetService.prototype, 'generateToken')
      .rejects(new Error('token store down'))

    await assert.rejects(() =>
      new InviteUser().handle({ email, role: ROLES.USER, executor: admin, i18n: i18n() })
    )

    await db.assertMissing('users', { email })
    fake.assertNoneEmitted()
  })
})
