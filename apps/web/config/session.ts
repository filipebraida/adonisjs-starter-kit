import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, stores } from '@adonisjs/session'

const sessionConfig = defineConfig({
  enabled: true,
  cookieName: 'adonis-session',

  clearWithBrowser: false,

  age: '2h',

  cookie: {
    path: '/',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },

  store: env.get('SESSION_DRIVER'),

  stores: {
    cookie: stores.cookie(),
  },
})

export default sessionConfig
