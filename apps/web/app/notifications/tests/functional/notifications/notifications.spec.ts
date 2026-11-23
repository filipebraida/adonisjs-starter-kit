import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import Notification from '#notifications/models/notification'
import { NotificationFactory } from '#notifications/database/factories/notification'
import { UserFactory } from '#auth/database/factories/user'

test.group('Endpoint /notifications', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('GET without auth redirects to login', async ({ client, assert }) => {
    const response = await client.get('/notifications').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('GET lists the latest notifications + unseen count', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const notifiableId = String(user.id)

    await NotificationFactory.merge({ notifiableId }).create()
    await NotificationFactory.merge({ notifiableId }).apply('seen').create()
    await NotificationFactory.merge({ notifiableId }).apply('read').create()

    const response = await client.get('/notifications').loginAs(user).accept('json')

    response.assertStatus(200)
    assert.equal(response.body().unseen, 1)
    assert.equal(response.body().items.length, 3)
  })

  test('GET only returns notifications of the current user', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const other = await UserFactory.create()

    await NotificationFactory.merge({ notifiableId: String(other.id) }).create()

    const response = await client.get('/notifications').loginAs(user).accept('json')

    response.assertStatus(200)
    assert.equal(response.body().items.length, 0)
    assert.equal(response.body().unseen, 0)
  })

  test('POST /:id/read marks one as read (and seen if not seen yet)', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const notif = await NotificationFactory.merge({ notifiableId: String(user.id) }).create()

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

  test('POST /:id/read with an id of another user returns 404', async ({ client }) => {
    const user = await UserFactory.create()
    const other = await UserFactory.create()

    const notif = await NotificationFactory.merge({ notifiableId: String(other.id) }).create()

    const response = await client
      .post(`/notifications/${notif.id}/read`)
      .loginAs(user)
      .withCsrfToken()
      .accept('json')

    response.assertStatus(404)
  })

  test('POST /seen marks all as seen but not read', async ({ client, assert }) => {
    const user = await UserFactory.create()
    await NotificationFactory.merge({ notifiableId: String(user.id) }).createMany(2)

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

  test('POST /read marks all as read', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const notifiableId = String(user.id)
    await NotificationFactory.merge({ notifiableId }).create()
    await NotificationFactory.merge({ notifiableId }).apply('seen').create()

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

  test('a browser visit opens the full page, newest first, with the unread count', async ({
    client,
    assert,
  }) => {
    const user = await UserFactory.create()
    const notifiableId = String(user.id)
    await NotificationFactory.merge({ notifiableId }).apply('read').create()
    const latest = await NotificationFactory.merge({ notifiableId }).create()

    const response = await client.get('/notifications').loginAs(user).withInertia()

    response.assertInertiaComponent('notifications/index')
    const props = response.inertiaProps as {
      notifications: { id: number }[]
      unread: number
      filter: string | null
    }
    assert.equal(props.notifications[0].id, latest.id)
    assert.equal(props.unread, 1)
    assert.isNull(props.filter)
  })

  test('the unread slice leaves out what was opened', async ({ client, assert }) => {
    const user = await UserFactory.create()
    const notifiableId = String(user.id)
    const read = await NotificationFactory.merge({ notifiableId }).apply('read').create()
    const unread = await NotificationFactory.merge({ notifiableId }).create()

    const response = await client
      .get('/notifications')
      .qs({ filter: 'unread' })
      .loginAs(user)
      .withInertia()

    const ids = (response.inertiaProps as { notifications: { id: number }[] }).notifications.map(
      ({ id }) => id
    )
    assert.include(ids, unread.id)
    assert.notInclude(ids, read.id)
  })
})
