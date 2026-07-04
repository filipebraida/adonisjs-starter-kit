import { test } from '@japa/runner'

import { ROLES, mainRole } from '#users/enums/role'

test.group('mainRole', () => {
  test('retorna null quando array vazio', ({ assert }) => {
    assert.isNull(mainRole([]))
  })

  test('retorna null quando nenhum role e conhecido', ({ assert }) => {
    assert.isNull(mainRole(['superadmin', 'guest', 'foo']))
  })

  test('retorna o unico role conhecido', ({ assert }) => {
    assert.equal(mainRole([ROLES.USER]), ROLES.USER)
    assert.equal(mainRole([ROLES.ADMIN]), ROLES.ADMIN)
  })

  test('admin ganha de user por peso', ({ assert }) => {
    assert.equal(mainRole([ROLES.USER, ROLES.ADMIN]), ROLES.ADMIN)
    assert.equal(mainRole([ROLES.ADMIN, ROLES.USER]), ROLES.ADMIN)
  })

  test('ignora roles desconhecidos e escolhe entre os conhecidos', ({ assert }) => {
    assert.equal(mainRole(['guest', ROLES.USER, 'superadmin']), ROLES.USER)
    assert.equal(mainRole(['guest', ROLES.USER, ROLES.ADMIN, 'x']), ROLES.ADMIN)
  })
})
