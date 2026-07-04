import drive from '@adonisjs/drive/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import fileGenerator from '@poppinss/file-generator'
import { test } from '@japa/runner'

import env from '#start/env'
import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint PUT /settings/profile', (group) => {
  const diskName = env.get('DRIVE_DISK') || 'fs'

  group.each.setup(() => {
    drive.fake(diskName)
    return () => drive.restore(diskName)
  })
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('sem auth redireciona para login e nao muda ninguem', async ({ client, assert }) => {
    const user = await UserFactory.merge({ fullName: 'Original' }).create()
    const png = await fileGenerator.generatePng(50 * 1024, 'avatar.png')

    const response = await client
      .put('/settings/profile')
      .withCsrfToken()
      .redirects(0)
      .field('fullName', 'Alterado')
      .file('avatar', png.contents, { filename: png.name, contentType: png.mime })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')

    await user.refresh()
    assert.equal(user.fullName, 'Original')
  })

  test('rejeita extensao invalida (422) e mantem fullName', async ({ client, assert }) => {
    const user = await UserFactory.merge({ fullName: 'Nome Original' }).create()

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .field('fullName', 'Tentativa')
      .file('avatar', Buffer.from('binario'), {
        filename: 'malware.exe',
        contentType: 'application/octet-stream',
      })

    response.assertStatus(422)

    await user.refresh()
    assert.equal(user.fullName, 'Nome Original')
  })

  test('rejeita arquivo maior que 1MB (422)', async ({ client, assert }) => {
    const user = await UserFactory.merge({ fullName: 'Nome Original' }).create()
    const png = await fileGenerator.generatePng(2 * 1024 * 1024, 'big.png')

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .field('fullName', 'Tentativa')
      .file('avatar', png.contents, { filename: png.name, contentType: png.mime })

    response.assertStatus(422)

    await user.refresh()
    assert.equal(user.fullName, 'Nome Original')
  })

  test('rejeita fullName curto (422) e mantem estado', async ({ client, assert }) => {
    const user = await UserFactory.merge({ fullName: 'Nome Original' }).create()
    const png = await fileGenerator.generatePng(50 * 1024, 'avatar.png')

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')
      .redirects(0)
      .field('fullName', 'ab')
      .file('avatar', png.contents, { filename: png.name, contentType: png.mime })

    response.assertStatus(422)

    await user.refresh()
    assert.equal(user.fullName, 'Nome Original')
  })
})
