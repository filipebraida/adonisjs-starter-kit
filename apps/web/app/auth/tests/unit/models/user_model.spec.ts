import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { UserFactory } from '#auth/database/factories/user'
import { marker, taggedEmail } from '#tests/helpers/marker'

test.group('User model — email normalization', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('User.create normaliza email pra lowercase e trim', async ({ db }) => {
    const mark = marker('Fulano')
    const rawEmail = `  ${mark}@Example.TEST  `
    const user = await UserFactory.merge({ email: rawEmail }).create()

    await db.assertHas('users', { id: user.id, email: taggedEmail(mark) })
    await db.assertMissing('users', { id: user.id, email: rawEmail })
  })

  test('UserFactory produz email lowercase mesmo sem override explicito', async ({ assert }) => {
    const user = await UserFactory.create()

    assert.equal(user.email, user.email.toLowerCase())
  })

  test('update do email tambem normaliza', async ({ db }) => {
    const user = await UserFactory.create()

    user.email = 'NOVO@EXAMPLE.TEST'
    await user.save()

    await db.assertHas('users', { id: user.id, email: 'novo@example.test' })
  })
})
