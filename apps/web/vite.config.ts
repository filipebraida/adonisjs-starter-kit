import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    adonisjs({
      entryPoints: ['app/core/ui/app/app.tsx'],
      serverEntryPoints: ['app/core/ui/app/ssr.tsx'],
      assets: ['resources/images/**'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '@generated': `${import.meta.dirname}/.adonisjs/client`,
      '~/': `${import.meta.dirname}/app/core/ui/`,
      'config/ssr': `${import.meta.dirname}/config/ssr.ts`,
    },
  },

  server: {
    watch: {
      ignored: ['**/storage/**', '**/tmp/**'],
    },
  },
})
