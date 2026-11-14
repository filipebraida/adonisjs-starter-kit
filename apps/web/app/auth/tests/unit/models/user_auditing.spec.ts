import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

import { AUDIT_EVENTS } from '#auth/enums/audit_event'
import { UserFactory } from '#auth/database/factories/user'

test.group('User auditing', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('records the creation of a user', async ({ assert }) => {
    const user = await UserFactory.create()

    const audits = await user.audits().where('event', AUDIT_EVENTS.CREATED)
    assert.lengthOf(audits, 1)
  })

  test('records an update as a diff with the password masked', async ({ assert }) => {
    const user = await UserFactory.merge({ fullName: 'Before' }).create()

    user.merge({ fullName: 'After', password: 'new-secret-1234' })
    await user.save()

    const audit = await user.audits().where('event', AUDIT_EVENTS.UPDATED).firstOrFail()
    assert.deepEqual(audit.changesFor('fullName'), { old: 'Before', new: 'After' })
    assert.equal(audit.newValues?.password, '******')
    assert.notProperty(audit.newValues ?? {}, 'updatedAt')
  })
})
