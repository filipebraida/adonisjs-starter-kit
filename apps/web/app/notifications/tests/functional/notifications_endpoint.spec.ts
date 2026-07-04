import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

import Notification from '#notifications/models/notification'
import { UserFactory } from '#users/database/factories/user'

test.group('Endpoint /notifications', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('GET sem auth redireciona para login', async ({ client, assert }) => {
    const response = await client.get('/notifications').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET lista as ultimas notificacoes + count de nao-vistas', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const now = DateTime.now()

    await Notification.createMany([
      { notifiableId: String(user.id), type: 'test', content: { title: 'A' }, status: 'unseen' },
      {
        notifiableId: String(user.id),
        type: 'test',
        content: { title: 'B' },
        status: 'seen',
        seenAt: now,
      },
      {
        notifiableId: String(user.id),
        type: 'test',
        content: { title: 'C' },
        status: 'read',
        readAt: now,
        seenAt: now,
      },
    ])

    const response = await client.get('/notifications').loginAs(user).accept('json')

    response.assertStatus(200)
    assert.equal(response.body().unseen, 1)
    assert.equal(response.body().items.length, 3)
  })

  test('GET so retorna notificacoes do proprio usuario', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const other = await UserFactory.create()

    await Notification.create({
      notifiableId: String(other.id),
      type: 'test',
      content: { title: 'Not mine' },
      status: 'unseen',
    })

    const response = await client.get('/notifications').loginAs(user).accept('json')

    response.assertStatus(200)
    assert.equal(response.body().items.length, 0)
    assert.equal(response.body().unseen, 0)
  })

  test('POST /:id/read marca uma como lida (e seen se ainda nao vista)', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const notif = await Notification.create({
      notifiableId: String(user.id),
      type: 'test',
      content: { title: 'A' },
      status: 'unseen',
    })

    const response = await client
      .post(`/notifications/${notif.id}/read`)
      .loginAs(user)
      .withCsrfToken()
      .accept('json')

    response.assertStatus(200)

    await notif.refresh()
    assert.equal(notif.status, 'read')
    assert.isNotNull(notif.readAt)
    assert.isNotNull(notif.seenAt)
  })

  test('POST /:id/read com id de outro usuario retorna 404', async ({ client }) => {
    const user = await UserFactory.create()
    const other = await UserFactory.create()

    const notif = await Notification.create({
      notifiableId: String(other.id),
      type: 'test',
      content: { title: 'A' },
      status: 'unseen',
    })

    const response = await client
      .post(`/notifications/${notif.id}/read`)
      .loginAs(user)
      .withCsrfToken()
      .accept('json')

    response.assertStatus(404)
  })

  test('POST /seen marca todas como vistas mas nao lidas', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await Notification.createMany([
      { notifiableId: String(user.id), type: 'test', content: { title: 'A' }, status: 'unseen' },
      { notifiableId: String(user.id), type: 'test', content: { title: 'B' }, status: 'unseen' },
    ])

    const response = await client
      .post('/notifications/seen')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')

    response.assertStatus(200)

    const rows = await Notification.query().where('notifiableId', String(user.id))
    assert.isTrue(rows.every((n) => n.status === 'seen'))
    assert.isTrue(rows.every((n) => n.seenAt !== null))
    assert.isTrue(rows.every((n) => n.readAt === null))
  })

  test('POST /read marca todas como lidas', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const now = DateTime.now()
    await Notification.createMany([
      { notifiableId: String(user.id), type: 'test', content: { title: 'A' }, status: 'unseen' },
      {
        notifiableId: String(user.id),
        type: 'test',
        content: { title: 'B' },
        status: 'seen',
        seenAt: now,
      },
    ])

    const response = await client
      .post('/notifications/read')
      .loginAs(user)
      .withCsrfToken()
      .accept('json')

    response.assertStatus(200)

    const rows = await Notification.query().where('notifiableId', String(user.id))
    assert.isTrue(rows.every((n) => n.status === 'read'))
    assert.isTrue(rows.every((n) => n.readAt !== null))
    assert.isTrue(rows.every((n) => n.seenAt !== null))
  })
})
