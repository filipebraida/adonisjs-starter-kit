import { test } from '@japa/runner'

import { escapeLike } from '#core/utils/escape_like'

test.group('escapeLike', () => {
  test('escapes the LIKE wildcards', ({ assert }) => {
    assert.equal(escapeLike('100%'), '100\\%')
    assert.equal(escapeLike('a_b'), 'a\\_b')
  })

  test('escapes the backslash before the wildcards', ({ assert }) => {
    assert.equal(escapeLike('c:\\temp'), 'c:\\\\temp')
    assert.equal(escapeLike('\\%'), '\\\\\\%')
  })

  test('leaves text without wildcards as it is', ({ assert }) => {
    assert.equal(escapeLike('lovelace'), 'lovelace')
    assert.equal(escapeLike(''), '')
  })
})
