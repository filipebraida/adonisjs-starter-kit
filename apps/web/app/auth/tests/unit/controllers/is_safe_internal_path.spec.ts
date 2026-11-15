import { test } from '@japa/runner'

import { isSafeInternalPath } from '#auth/controllers/sign_in_controller'

test.group('isSafeInternalPath', () => {
  test('accepts a simple internal path', ({ assert }) => {
    assert.isTrue(isSafeInternalPath('/dashboard'))
    assert.isTrue(isSafeInternalPath('/users/42'))
    assert.isTrue(isSafeInternalPath('/'))
  })

  test('rejects null/undefined/empty', ({ assert }) => {
    assert.isFalse(isSafeInternalPath(null))
    assert.isFalse(isSafeInternalPath(undefined))
    assert.isFalse(isSafeInternalPath(''))
  })

  test('rejects an absolute URL (open-redirect)', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('http://malicious.com/dashboard'))
    assert.isFalse(isSafeInternalPath('https://evil.example/steal'))
  })

  test('rejects protocol-relative URLs', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('//malicious.com/anywhere'))
  })

  test('rejects paths with a backslash', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('/dash\\board'))
  })
})
