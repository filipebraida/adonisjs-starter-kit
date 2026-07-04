import { test } from '@japa/runner'

test.group('DetectUserLocaleMiddleware', () => {
  test('sem sinal nenhum, cai no defaultLocale (en)', async ({ client }) => {
    const response = await client.get('/')

    response.assertCookie('user-locale', 'en')
  })

  test('X-User-Language define o locale quando suportado', async ({ client }) => {
    const response = await client.get('/').header('X-User-Language', 'pt')

    response.assertCookie('user-locale', 'pt')
  })

  test('cookie existente user-locale prevalece sobre Accept-Language (nao re-seta)', async ({
    client,
  }) => {
    const response = await client
      .get('/')
      .cookie('user-locale', 'fr')
      .header('Accept-Language', 'pt-BR,pt;q=0.9')

    response.assertCookieMissing('user-locale')
  })

  test('X-User-Language prevalece sobre cookie existente', async ({ client }) => {
    const response = await client
      .get('/')
      .cookie('user-locale', 'fr')
      .header('X-User-Language', 'pt')

    response.assertCookie('user-locale', 'pt')
  })

  test('X-User-Language desconhecido cai no fallback (Accept-Language)', async ({ client }) => {
    const response = await client
      .get('/')
      .header('X-User-Language', 'xx')
      .header('Accept-Language', 'pt-BR,pt;q=0.9')

    response.assertCookie('user-locale', 'pt')
  })

  test('Accept-Language mapeia pra locale suportado (fr-CA -> fr)', async ({ client }) => {
    const response = await client.get('/').header('Accept-Language', 'fr-CA,fr;q=0.9')

    response.assertCookie('user-locale', 'fr')
  })
})
