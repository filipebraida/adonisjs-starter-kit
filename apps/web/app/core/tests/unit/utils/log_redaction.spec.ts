import { Writable } from 'node:stream'
import { Logger } from '@adonisjs/core/logger'
import { test } from '@japa/runner'

import loggerConfig from '#config/logger'
import { logRedaction } from '#core/utils/log_redaction'

/** A logger with the app's redaction, writing to memory instead of stdout. */
function inMemoryLogger() {
  const lines: string[] = []
  const output = new Writable({
    write(chunk, _encoding, done) {
      lines.push(chunk.toString())
      done()
    },
  })
  const logger = new Logger({
    enabled: true,
    name: 'test',
    level: 'info',
    ...logRedaction,
    desination: output,
  })

  return { logger, text: () => lines.join(''), line: () => JSON.parse(lines.at(-1)!) }
}

test.group('Log redaction', () => {
  test('the app logger carries the redaction', async ({ assert }) => {
    assert.strictEqual(loggerConfig.loggers.app.redact, logRedaction.redact)
  })

  test('credentials and e-mail are redacted by field name, at the root or one level below', async ({
    assert,
  }) => {
    const { logger, text, line } = inMemoryLogger()

    logger.info(
      {
        password: 'hunter2-root',
        user: { id: 3, email: 'mariana@example.com', password: 'hunter2-nested' },
        token: { value: 'oat_secret.value' },
        req: { headers: { authorization: 'Bearer oat_secret.value', cookie: 'session=abc' } },
      },
      'signed in'
    )

    for (const secret of [
      'hunter2-root',
      'hunter2-nested',
      'mariana@example.com',
      'oat_secret',
      'session=abc',
    ]) {
      assert.notInclude(text(), secret)
    }
    assert.equal(line().user.id, 3)
    assert.equal(line().user.email, '[redacted]')
  })
})
