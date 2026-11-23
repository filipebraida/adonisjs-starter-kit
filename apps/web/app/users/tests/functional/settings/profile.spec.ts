import drive from '@adonisjs/drive/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import fileGenerator from '@poppinss/file-generator'
import { test } from '@japa/runner'

import env from '#start/env'
import User from '#auth/models/user'
import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint PUT /settings/profile', (group) => {
  const diskName = env.get('DRIVE_DISK') || 'fs'

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('updates fullName and persists the avatar (valid png)', async ({ client, assert }) => {
    using disk = drive.fake(diskName)
    const user = await UserFactory.merge({ fullName: 'Antes' }).create()
    const png = await fileGenerator.generatePng(50 * 1024, 'avatar.png')

    const response = await client
      .put('/settings/profile')
      .loginAs(user)
      .withCsrfToken()
      .redirects(0)
      .field('fullName', 'Depois')
      .file('avatar', png.contents, { filename: png.name, contentType: png.mime })

    response.assertStatus(302)
    assert.equal(response.header('location'), '/settings')

    const refreshed = await User.findOrFail(user.id)
    assert.equal(refreshed.fullName, 'Depois')
    const avatar = await refreshed.avatar.get()
    assert.exists(avatar)
    assert.isTrue(await disk.exists(avatar!.attachment.path))
  })

  test('without auth redirects to login and changes no one', async ({ client, assert }) => {
    using _disk = drive.fake(diskName)
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

  test('rejects an invalid extension (422) and keeps fullName', async ({ client, assert }) => {
    using _disk = drive.fake(diskName)
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

  test('rejects a file larger than 1MB (422)', async ({ client, assert }) => {
    using _disk = drive.fake(diskName)
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

  test('rejects a short fullName (422) and keeps the state', async ({ client, assert }) => {
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
