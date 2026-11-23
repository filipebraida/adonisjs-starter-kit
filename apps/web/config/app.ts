import env from '#start/env'
import { defineConfig } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'

// Without this key, or with another one, what was encrypted (cookies, signed
// URLs) can no longer be read: keep it secret.
export const appKey = env.get('APP_KEY')

export const appUrl = env.get('APP_URL')

export const http = defineConfig({
  generateRequestId: true,
  allowMethodSpoofing: false,

  useAsyncLocalStorage: true,

  // The session cookie is configured apart, in `config/session.ts`.
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: app.inProduction,
    sameSite: 'lax',
  },
})
