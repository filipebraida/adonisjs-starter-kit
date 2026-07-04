import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import User from '#users/models/user'
import { UserFactory } from '#users/database/factories/user'

test.group('User model — email normalization', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('User.create normaliza email pra lowercase e trim', async ({ db }) => {
    await User.create({
      fullName: 'Mixed Case',
      email: '  Fulano@Example.TEST  ',
      password: 'senha-1234',
    })

    await db.assertHas('users', { email: 'fulano@example.test' })
    await db.assertMissing('users', { email: '  Fulano@Example.TEST  ' })
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
