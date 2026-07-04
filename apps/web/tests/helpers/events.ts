import emitter from '@adonisjs/core/services/emitter'

type Fake = ReturnType<typeof emitter.fake>
type Events = Parameters<typeof emitter.fake>[0]

export async function withEmitterFake<T>(
  events: Events,
  fn: (fake: Fake) => Promise<T> | T
): Promise<T> {
  const fake = emitter.fake(events)
  try {
    return await fn(fake)
  } finally {
    emitter.restore()
  }
}
