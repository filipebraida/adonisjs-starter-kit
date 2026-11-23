import { fileURLToPath } from 'node:url'

import { indexAppUiPages } from '#core/hooks/index_pages_hook'
import { indexTranslations } from '#core/hooks/index_translations_hook'
import { moduleDirs } from '#core/utils/module_dirs'
import { indexEntities } from '@adonisjs/core'
import { defineConfig } from '@adonisjs/core/app'
import { generateRegistry } from '@tuyau/core/hooks'
import { workflowsHook } from '@adonis-agora/durable/hooks/workflows'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Experimental flags
  |--------------------------------------------------------------------------
  |
  | The following features will be enabled by default in the next major release
  | of AdonisJS. You can opt into them today to avoid any breaking changes
  | during upgrade.
  |
  */
  experimental: {},

  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
    () => import('@adonisjs/mail/commands'),
    () => import('@adonisjs/bouncer/commands'),
    () => import('@jrmc/adonis-attachment/commands'),
    () => import('@tuyau/core/commands'),
    () => import('@adonis-agora/authz/commands'),
    () => import('@adonis-agora/durable/commands'),
    () => import('@filipebraida/adonis-auditing/commands'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/core/providers/edge_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/vite/vite_provider'),
    () => import('@adonisjs/shield/shield_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/cors/cors_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/auth/auth_provider'),
    () => import('@adonisjs/inertia/inertia_provider'),
    () => import('@adonisjs/mail/mail_provider'),
    () => import('@adonisjs/bouncer/bouncer_provider'),
    () => import('@adonisjs/ally/ally_provider'),
    () => import('@jrmc/adonis-attachment/attachment_provider'),
    () => import('@adonisjs/drive/drive_provider'),
    () => import('@adonisjs/i18n/i18n_provider'),
    () => import('@adonisjs/limiter/limiter_provider'),
    () => import('adonis-inertia-modal/modal_provider'),
    () => import('@adonisjs/transmit/transmit_provider'),
    () => import('@facteurjs/adonisjs/facteur_provider'),
    () => import('@adonis-agora/authz/authz_provider'),
    () => import('@adonis-agora/durable/durable_provider'),
    () => import('@adonis-agora/durable/dashboard_provider'),
    () => import('@filipebraida/adonis-auditing/auditing_provider'),
    () => import('@adonisjs/content/content_provider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [
    () => import('#start/kernel'),
    () => import('#start/routes'),

    //auth
    () => import('#auth/start/view'),
    () => import('#auth/start/events'),

    //users
    () => import('#users/start/view'),
    () => import('#users/start/events'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['app/**/tests/unit/**/*.spec.{ts,js}'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['app/**/tests/functional/**/*.spec.{ts,js}'],
        name: 'functional',
        timeout: 30000,
      },
    ],
    forceExit: false,
  },

  /*
  |--------------------------------------------------------------------------
  | Metafiles
  |--------------------------------------------------------------------------
  |
  | A collection of files you want to copy to the build folder when creating
  | the production build.
  |
  */
  metaFiles: [
    {
      pattern: 'resources/views/**/*.edge',
      reloadServer: false,
    },
    {
      pattern: 'public/**',
      reloadServer: false,
    },
    {
      pattern: 'app/**/resources/lang/**/*.{json,yaml,yml}',
      reloadServer: false,
    },
    // Each module's help: indexes, articles and their images go into the build.
    {
      pattern: 'app/*/help/**/*.{json,md,png,jpg,jpeg,webp}',
      reloadServer: false,
    },
  ],

  hooks: {
    init: [
      indexEntities({
        transformers: {
          enabled: true,
          source: './app',
          glob: ['**/*_transformer.ts'],
          importAlias: '#app',
          withSharedProps: true,
          inertiaMiddlewareImportPath: '#core/middleware/inertia_middleware',
        },
        controllers: {
          enabled: true,
          source: './app',
          glob: ['**/*_controller.ts'],
          importAlias: '#app',
        },
      }),
      indexAppUiPages(),
      indexTranslations(),
      generateRegistry(),
      async () => ({
        default: workflowsHook({
          source: moduleDirs(fileURLToPath(new URL('./', import.meta.url)), 'workflows'),
        }),
      }),
    ],
    buildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
  directories: {
    audit_resolvers: 'app/core/audit_resolvers',
  },
})
