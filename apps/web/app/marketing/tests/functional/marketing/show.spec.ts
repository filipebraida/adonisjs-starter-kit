import { test } from '@japa/runner'

test.group('Endpoint GET /', () => {
  test('renderiza a landing sem exigir auth', async ({ client }) => {
    const response = await client.get('/').withInertia()

    response.assertStatus(200)
    response.assertInertiaComponent('marketing/show')
  })
})
