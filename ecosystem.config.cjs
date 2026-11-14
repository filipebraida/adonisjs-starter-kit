/**
 * PM2 processes of the app, run from the AdonisJS build. Used locally and by
 * the Catapult deploy (deploy.ts copies this file into the build).
 *
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 reload ecosystem.config.cjs --env production
 */

const fs = require('node:fs')
const path = require('node:path')

// Locally it runs from the repo's build; on the server the cwd must be the
// `current` symlink, so a reload picks up the new release.
const local = fs.existsSync(path.join(__dirname, 'apps/web/build'))
const cwd = local ? './apps/web/build' : path.join(__dirname, '../../current')

module.exports = {
  apps: [
    {
      name: 'web',
      cwd,
      script: 'bin/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: { NODE_ENV: 'production' },
    },
  ],
}
