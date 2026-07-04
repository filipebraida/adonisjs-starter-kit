import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import ListUsers from '#users/queries/list_users'
import { ROLES } from '#users/enums/role'
import { UserFactory } from '#users/database/factories/user'
import { ensureBaseRoles, withRole } from '#tests/helpers/rbac'
import { marker } from '#tests/helpers/marker'

test.group('ListUsers', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => ensureBaseRoles())

  test('filtra pela substring do nome (ilike)', async ({ assert }) => {
    const tag = marker('nome')
    await UserFactory.merge({ fullName: `${tag}-alpha`, email: `${tag}-a@example.test` }).create()
    await UserFactory.merge({ fullName: `${tag}-beta`, email: `${tag}-b@example.test` }).create()
    await UserFactory.merge({ fullName: 'ruido-fora-do-tag' }).create()

    const result = await new ListUsers().handle({ q: `${tag}-alp` }, { page: 1, perPage: 50 })

    const nomes = result.all().map((u) => u.fullName)
    assert.include(nomes, `${tag}-alpha`)
    assert.notInclude(nomes, `${tag}-beta`)
  })

  test('filtra pela substring do email (ilike)', async ({ assert }) => {
    const tag = marker('email')
    await UserFactory.merge({ email: `${tag}-alpha@example.test` }).create()
    await UserFactory.merge({ email: `${tag}-beta@example.test` }).create()

    const result = await new ListUsers().handle({ q: `${tag}-al` }, { page: 1, perPage: 50 })

    const emails = result.all().map((u) => u.email)
    assert.include(emails, `${tag}-alpha@example.test`)
    assert.notInclude(emails, `${tag}-beta@example.test`)
  })

  test('filtra por role (whereHas)', async ({ assert }) => {
    const tag = marker('role')
    const admin1 = await UserFactory.merge({ fullName: `${tag}-admin` }).create()
    await withRole(admin1, ROLES.ADMIN)
    const user1 = await UserFactory.merge({ fullName: `${tag}-user` }).create()
    await withRole(user1, ROLES.USER)

    const result = await new ListUsers().handle(
      { q: tag, roles: [ROLES.ADMIN] },
      { page: 1, perPage: 50 }
    )

    const nomes = result.all().map((u) => u.fullName)
    assert.include(nomes, `${tag}-admin`)
    assert.notInclude(nomes, `${tag}-user`)
  })

  test('ordenacao por fullName asc + tiebreaker id asc', async ({ assert }) => {
    const tag = marker('sort')
    await UserFactory.merge({ fullName: `${tag}-charlie` }).create()
    await UserFactory.merge({ fullName: `${tag}-alpha` }).create()
    await UserFactory.merge({ fullName: `${tag}-bravo` }).create()

    const result = await new ListUsers().handle(
      { q: tag, sort: 'fullName', order: 'asc' },
      { page: 1, perPage: 50 }
    )

    const nomes = result.all().map((u) => u.fullName)
    const idx = (n: string) => nomes.indexOf(`${tag}-${n}`)
    assert.isTrue(idx('alpha') < idx('bravo'))
    assert.isTrue(idx('bravo') < idx('charlie'))
  })

  test('pagina resultados respeitando page/perPage', async ({ assert }) => {
    const tag = marker('page')
    for (let i = 0; i < 5; i++) {
      await UserFactory.merge({ fullName: `${tag}-${i}` }).create()
    }

    const pagina1 = await new ListUsers().handle(
      { q: tag, sort: 'fullName', order: 'asc' },
      { page: 1, perPage: 2 }
    )
    const pagina2 = await new ListUsers().handle(
      { q: tag, sort: 'fullName', order: 'asc' },
      { page: 2, perPage: 2 }
    )

    assert.lengthOf(pagina1.all(), 2)
    assert.lengthOf(pagina2.all(), 2)
    assert.equal(pagina1.getMeta().total, 5)

    const ids1 = pagina1.all().map((u) => u.id)
    const ids2 = pagina2.all().map((u) => u.id)
    assert.notDeepEqual(ids1, ids2)
  })

  test('preload de roles vem populado', async ({ assert }) => {
    const tag = marker('preload')
    const user = await UserFactory.merge({ fullName: `${tag}-x` }).create()
    await withRole(user, ROLES.ADMIN)

    const result = await new ListUsers().handle({ q: tag }, { page: 1, perPage: 50 })

    const encontrado = result.all().find((u) => u.id === user.id)
    assert.isNotNull(encontrado)
    assert.lengthOf(encontrado!.preloadedRoles, 1)
    assert.equal(encontrado!.preloadedRoles[0].name, ROLES.ADMIN)
  })
})
