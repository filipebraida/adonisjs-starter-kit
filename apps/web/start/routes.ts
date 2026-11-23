// The routes of every module, registered in this order. Adonis imports the
// preloads in parallel, so one preload per module let the order (and with it
// the precedence of overlapping routes and the order of the generated
// `.adonisjs/` files) depend on which file finished loading first.

await import('#core/routes')
await import('#marketing/routes')
await import('#auth/routes')
await import('#users/routes')
await import('#analytics/routes')
await import('#notifications/routes')
await import('#help/routes')

export {}
