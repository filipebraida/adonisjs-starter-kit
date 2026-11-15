import { test } from '@japa/runner'

test.group('DetectUserLocaleMiddleware', () => {
  test('without any signal, falls back to defaultLocale (en)', async ({ client }) => {
    const response = await client.get('/')

    response.assertCookie('user-locale', 'en')
  })

  test('X-User-Language sets the locale when supported', async ({ client }) => {
    const response = await client.get('/').header('X-User-Language', 'pt')

    response.assertCookie('user-locale', 'pt')
  })

  test('existing user-locale cookie wins over Accept-Language (not re-set)', async ({ client }) => {
    const response = await client
      .get('/')
      .cookie('user-locale', 'en')
      .header('Accept-Language', 'pt-BR,pt;q=0.9')

    response.assertCookieMissing('user-locale')
  })

  test('X-User-Language wins over an existing cookie', async ({ client }) => {
    const response = await client
      .get('/')
      .cookie('user-locale', 'en')
      .header('X-User-Language', 'pt')

    response.assertCookie('user-locale', 'pt')
  })

  test('unknown X-User-Language falls back (Accept-Language)', async ({ client }) => {
    const response = await client
      .get('/')
      .header('X-User-Language', 'xx')
      .header('Accept-Language', 'pt-BR,pt;q=0.9')

    response.assertCookie('user-locale', 'pt')
  })

  test('Accept-Language maps to a supported locale (pt-PT -> pt)', async ({ client }) => {
    const response = await client.get('/').header('Accept-Language', 'pt-PT,pt;q=0.9')

    response.assertCookie('user-locale', 'pt')
  })

  test('unsupported Accept-Language falls back to the defaultLocale (fr-CA -> en)', async ({
    client,
  }) => {
    const response = await client.get('/').header('Accept-Language', 'fr-CA,fr;q=0.9')

    response.assertCookie('user-locale', 'en')
  })
})
