import { test } from '@japa/runner'

import { ROLES, mainRole } from '#auth/enums/role'

test.group('mainRole', () => {
  test('returns null when the array is empty', ({ assert }) => {
    assert.isNull(mainRole([]))
  })

  test('returns null when no role is known', ({ assert }) => {
    assert.isNull(mainRole(['superadmin', 'guest', 'foo']))
  })

  test('returns the only known role', ({ assert }) => {
    assert.equal(mainRole([ROLES.USER]), ROLES.USER)
    assert.equal(mainRole([ROLES.ADMIN]), ROLES.ADMIN)
  })

  test('admin beats user by weight', ({ assert }) => {
    assert.equal(mainRole([ROLES.USER, ROLES.ADMIN]), ROLES.ADMIN)
    assert.equal(mainRole([ROLES.ADMIN, ROLES.USER]), ROLES.ADMIN)
  })

  test('ignores unknown roles and picks among the known ones', ({ assert }) => {
    assert.equal(mainRole(['guest', ROLES.USER, 'superadmin']), ROLES.USER)
    assert.equal(mainRole(['guest', ROLES.USER, ROLES.ADMIN, 'x']), ROLES.ADMIN)
  })
})
