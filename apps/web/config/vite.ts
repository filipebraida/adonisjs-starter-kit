import { defineConfig } from '@adonisjs/vite'

const viteBackendConfig = defineConfig({
  buildDirectory: 'public/assets',

  manifestFile: 'public/assets/.vite/manifest.json',

  assetsUrl: '/assets',

  scriptAttributes: {
    defer: true,
  },
})

export default viteBackendConfig
