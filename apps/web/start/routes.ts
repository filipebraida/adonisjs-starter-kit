// The routes of every module, imported one after the other: Adonis imports
// preloads in parallel, and the registration order decides which of two
// overlapping routes wins and the order of the generated `.adonisjs/` files.

await import('#core/routes')
await import('#marketing/routes')
await import('#auth/routes')
await import('#users/routes')
await import('#analytics/routes')
await import('#notifications/routes')
await import('#help/routes')

export {}
