import { defineConfig } from '@filipebraida/adonis-auditing'

export default defineConfig({
  userResolver: () => import('#core/audit_resolvers/user_resolver'),
  resolvers: {
    ip_address: () => import('#core/audit_resolvers/ip_address_resolver'),
    user_agent: () => import('#core/audit_resolvers/user_agent_resolver'),
    url: () => import('#core/audit_resolvers/url_resolver'),
    impersonated_by: () => import('#users/audit_resolvers/impersonated_by_resolver'),
  },

  /**
   * Field names whose values are replaced with '******' in every audit row.
   * Per model, prefer the static `auditMask` slot on the model that owns the
   * column. Masking personal data (PII) and how long rows are kept are each
   * application's call: see the auditing skill.
   */
  hiddenFields: [],

  /** Noise dropped from every audit row; per model, use `static auditExclude`. */
  auditExclude: ['createdAt', 'updatedAt'],
})
