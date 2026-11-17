import { configApp } from '@adonisjs/eslint-config'
import { adonis, ui } from '@filipebraida/eslint-config-adonis'

// Who each module may import: the source of truth for the dependency rule in
// AGENTS.md. Dependencies go one way: core knows no module, auth (identity)
// builds only on core, and a feature reaches down to core and auth.
const DEPENDENCIES = {
  core: [],
  auth: ['core'],
  notifications: ['core', 'auth'],
  help: ['core', 'auth'],
  users: ['core', 'auth', 'notifications', 'help'],
  analytics: ['core', 'auth'],
  marketing: ['core', 'auth'],
}

// The composition root knows every module: the shared props (Inertia
// middleware), the navigation, the policy registry and the frontend
// entrypoints. Nothing imports it back.
const COMPOSITION_FILES = [
  'app/core/middleware/inertia_middleware.ts',
  'app/core/policies/main.ts',
  'app/core/ui/app/**',
]

// A use case does not orchestrate another: what two share goes down to the
// model, and an effect in another module goes through an event. Named
// exception: auth's sync_user_roles, whose escalation guards and role sync the
// user-management actions (create, invite, update) must run.
const ACTION_DOES_NOT_CALL_ACTION = {
  regex: '^#[a-z_]+/actions/(?!sync_user_roles$)',
  message: 'An action does not call an action: move the rule to the model or emit an event.',
}

function restrictions(patterns) {
  return { 'no-restricted-imports': ['error', { patterns }] }
}

function boundaryOf(module) {
  return Object.keys(DEPENDENCIES)
    .filter((other) => other !== module && !DEPENDENCIES[module].includes(other))
    .map((other) => ({
      regex: `^#${other}/`,
      message: `${module} does not depend on ${other}: dependencies between modules go one way (see DEPENDENCIES in eslint.config.js).`,
    }))
}

function moduleBoundaries() {
  return Object.keys(DEPENDENCIES).flatMap((module) => {
    const boundary = boundaryOf(module)
    return [
      {
        name: `Boundary of module ${module}`,
        files: [`app/${module}/**/*.{ts,tsx}`],
        // Core's specs build their fixtures with auth's factories.
        ignores: module === 'core' ? [...COMPOSITION_FILES, 'app/core/tests/**'] : [],
        rules: restrictions(boundary),
      },
      {
        name: `Actions of module ${module}`,
        files: [`app/${module}/actions/**/*.ts`],
        rules: restrictions([...boundary, ACTION_DOES_NOT_CALL_ACTION]),
      },
    ]
  })
}

export default configApp(
  ...ui({
    files: ['app/*/ui/**/*.{ts,tsx}'],
    // The shadcn registry lives in packages/ui, outside this app's lint, so no
    // app folder is exempt: #core/ui composes the primitives and is checked
    // like any screen.
    registry: [],
    ui: '@workspace/ui/components',
  }),
  ...adonis({ layout: 'modules' }),
  ...moduleBoundaries(),
  {
    // unit-test-mirrors-layer puts the spec of app/core/utils/ in
    // app/core/tests/unit/utils/, and no-generic-names (0.6.2) only exempts
    // app/core/utils/ itself. Pending upstream: exempt the mirrored spec
    // folder, then drop this block.
    name: 'The spec of core/utils mirrors its folder',
    files: ['app/core/tests/unit/utils/**'],
    rules: { 'adonis/no-generic-names': 'off' },
  },
  {
    // The locale parity spec tests `<module>/resources/lang/`, a folder the
    // preset has no unit-test layer for. Pending decision: add `resources` to
    // unit-test-mirrors-layer upstream, then drop this block.
    name: 'Translations spec mirrors the resources folder',
    files: ['app/core/tests/unit/resources/**'],
    rules: { 'adonis/unit-test-mirrors-layer': 'off' },
  },
  {
    // The theme previews draw light and dark mode whatever the current theme
    // is, and the Google mark has its brand colors: tokens would repaint them.
    name: 'Drawings and brand marks keep their own colors',
    files: ['app/core/ui/components/icons/theme_*.tsx', 'app/auth/ui/components/login_form.tsx'],
    rules: { 'shadcn/no-raw-colors': 'off' },
  },
  {
    // After sign-in the user goes back to the URL the auth middleware saved at
    // runtime (`isSafeInternalPath` keeps it internal): there is no route name
    // to redirect by.
    name: 'Sign-in returns to the saved URL',
    files: ['app/auth/controllers/sign_in_controller.ts'],
    rules: { 'adonis/redirect-by-route': 'off' },
  }
)
