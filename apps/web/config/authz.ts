import { defineConfig, stores } from '@adonis-agora/authz'

import capabilities from '#config/capabilities'

export default defineConfig({
  default: 'lucid',

  stores: {
    memory: stores.memory(),
    // The tables come from the users module's create_authz_tables migration;
    // `subject_id` is an integer like `users.id`, so it can carry a foreign key.
    lucid: stores.lucid({ autoCreateSchema: false, subjectIdType: 'integer' }),
  },

  /**
   * What each role grants, resolved from code at check time: nothing to seed,
   * and no screen can strip a capability the app depends on. Only the
   * user → role assignment lives in the database.
   */
  roleGrants: capabilities.roleGrants,
})
