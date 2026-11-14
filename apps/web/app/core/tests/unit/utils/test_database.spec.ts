import { test } from '@japa/runner'

import { isPreparableTestDatabase } from '#core/utils/test_database'

test.group('isPreparableTestDatabase', () => {
  test('accepts a _test database under NODE_ENV=test', ({ assert }) => {
    assert.isTrue(isPreparableTestDatabase(true, 'app_test'))
  })

  test('refuses the dev database even under NODE_ENV=test', ({ assert }) => {
    assert.isFalse(isPreparableTestDatabase(true, 'app'))
  })

  test('refuses a _test database outside NODE_ENV=test', ({ assert }) => {
    assert.isFalse(isPreparableTestDatabase(false, 'app_test'))
  })

  test('refuses a name that only contains _test', ({ assert }) => {
    assert.isFalse(isPreparableTestDatabase(true, 'app_test_copy'))
  })
})
