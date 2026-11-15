import { test } from '@japa/runner'

import { helpLocaleOf } from '#help/enums/help_locale'

test.group('helpLocaleOf', () => {
  test('Portuguese for Portuguese, regional tags included', ({ assert }) => {
    assert.equal(helpLocaleOf('pt'), 'pt')
    assert.equal(helpLocaleOf('pt-BR'), 'pt')
  })

  test("English for anything else, the app's default locale", ({ assert }) => {
    assert.equal(helpLocaleOf('en'), 'en')
    assert.equal(helpLocaleOf('en-US'), 'en')
    assert.equal(helpLocaleOf('es'), 'en')
  })
})
