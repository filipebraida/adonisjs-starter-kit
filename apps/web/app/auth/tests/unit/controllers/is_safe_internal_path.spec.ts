import { test } from '@japa/runner'

import { isSafeInternalPath } from '#auth/controllers/sign_in_controller'

test.group('isSafeInternalPath', () => {
  test('aceita caminho interno simples', ({ assert }) => {
    assert.isTrue(isSafeInternalPath('/dashboard'))
    assert.isTrue(isSafeInternalPath('/users/42'))
    assert.isTrue(isSafeInternalPath('/'))
  })

  test('rejeita null/undefined/vazio', ({ assert }) => {
    assert.isFalse(isSafeInternalPath(null))
    assert.isFalse(isSafeInternalPath(undefined))
    assert.isFalse(isSafeInternalPath(''))
  })

  test('rejeita URL absoluta (open-redirect)', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('http://malicious.com/dashboard'))
    assert.isFalse(isSafeInternalPath('https://evil.example/steal'))
  })

  test('rejeita protocol-relative URLs', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('//malicious.com/anywhere'))
  })

  test('rejeita caminhos com backslash', ({ assert }) => {
    assert.isFalse(isSafeInternalPath('/dash\\board'))
  })
})
