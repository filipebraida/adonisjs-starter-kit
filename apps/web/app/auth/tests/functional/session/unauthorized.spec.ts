import { test } from '@japa/runner'

test.group('Unauthorized access', () => {
  test('a guest sent to the login hears why, in their language', async ({ client, assert }) => {
    const response = await client.get('/settings').header('X-User-Language', 'pt').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
    assert.equal(response.flashMessages().error, 'Entre para continuar.')
  })
})
