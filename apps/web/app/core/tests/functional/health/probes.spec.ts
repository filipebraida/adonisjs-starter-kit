import { test } from '@japa/runner'

test.group('Health probes', () => {
  test('liveness answers without a session', async ({ client }) => {
    const response = await client.get('/health/live')

    response.assertStatus(200)
    response.assertBody({ status: 'live' })
  })

  test('readiness answers only the status when the database is up', async ({ client }) => {
    const response = await client.get('/health/ready')

    response.assertStatus(200)
    response.assertBody({ status: 'ready' })
  })
})
