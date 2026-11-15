import { test } from '@japa/runner'

import { type Scheduler, SearchDebounce } from '#core/utils/search_debounce'

/** A timer the test advances by hand: `run()` fires what is pending. */
function fakeTimers() {
  const pending = new Map<number, () => void>()
  const counter = { next: 0 }
  const scheduler: Scheduler = {
    set: (run) => {
      pending.set(++counter.next, run)
      return counter.next
    },
    clear: (handle) => pending.delete(handle as number),
  }
  return {
    scheduler,
    pendingCount: () => pending.size,
    run: () => {
      const runs = [...pending.values()]
      pending.clear()
      runs.forEach((run) => run())
    },
  }
}

test.group('SearchDebounce', () => {
  test('keystrokes replace the pending search; only the last one runs, trimmed', ({ assert }) => {
    const timers = fakeTimers()
    const searched: string[] = []
    const box = new SearchDebounce(() => (value) => searched.push(value), '', 300, timers.scheduler)

    box.type('f')
    box.type('fo')
    box.type('foo ')

    assert.equal(timers.pendingCount(), 1)
    timers.run()
    assert.deepEqual(searched, ['foo'])
  })

  test('the search runs with the callback current when it fires, not when typed', ({ assert }) => {
    const timers = fakeTimers()
    const searched: string[] = []
    let filters = 'stage=qa'
    const box = new SearchDebounce(
      () => (value) => searched.push(`${filters}&search=${value}`),
      '',
      300,
      timers.scheduler
    )

    box.type('bug')
    filters = 'stage=qa&priority=high'
    timers.run()

    assert.deepEqual(searched, ['stage=qa&priority=high&search=bug'])
  })

  test('its own search coming back is not taken; a term from elsewhere is, and drops the pending one', ({
    assert,
  }) => {
    const timers = fakeTimers()
    const searched: string[] = []
    const box = new SearchDebounce(() => (value) => searched.push(value), '', 300, timers.scheduler)

    box.type('foo')
    timers.run()
    box.type('foo bar')
    assert.isTrue(box.isOwn('foo'))
    assert.isFalse(box.received('foo'))
    assert.equal(timers.pendingCount(), 1)

    assert.isTrue(box.received(''))
    assert.equal(timers.pendingCount(), 0)
    assert.deepEqual(searched, ['foo'])
  })

  test('cancel drops the pending search', ({ assert }) => {
    const timers = fakeTimers()
    const searched: string[] = []
    const box = new SearchDebounce(() => (value) => searched.push(value), '', 300, timers.scheduler)

    box.type('foo')
    box.cancel()
    timers.run()

    assert.deepEqual(searched, [])
  })

  test('now searches at once and drops the pending search', ({ assert }) => {
    const timers = fakeTimers()
    const searched: string[] = []
    const box = new SearchDebounce(
      () => (value) => searched.push(value),
      'foo',
      300,
      timers.scheduler
    )

    box.type('fo')
    box.now('')

    assert.equal(timers.pendingCount(), 0)
    assert.deepEqual(searched, [''])
    assert.isTrue(box.isOwn(''))
  })
})
