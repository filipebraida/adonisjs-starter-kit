---
name: auditing
description: 'Security audit trail with @filipebraida/adonis-auditing: who did what, when and from where, so a malicious or mistaken action can be traced. `Auditable` models record create/update/delete as diffs; actions record security events with `auditCustom`; resolvers stamp actor, IP, user agent, URL, request id and the admin behind an impersonation. Read it on the Activity page. Use when making a model auditable, recording a security event, adding a resolver, or reading the trail. Trigger on: "audit", "auditable", "auditCustom", "activity", "who changed", "trail", "impersonated_by".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Auditing

The kit keeps a forensic trail in the `audits` table to answer **"what did user X do, when, and from where?"**. It is the base; each application decides what else to audit, how to mask personal data and how long to keep rows.

Each row: actor (`user_type`/`user_id`), `event`, `auditable_type`/`auditable_id`, the diff (`old_values`/`new_values`), `metadata` (resolvers + per-call extras), `request_id`, `created_at`.

## Rules

- **Two ways to record:**
  - **Model CRUD** — `compose(..., Auditable)` on the model records `created`/`updated`/`deleted` with the changed fields. Set `static auditableName` from `AUDITABLE_TYPES`, `auditMask` for secrets (`['password']`), `auditExclude` for noise.
  - **Security events** — `model.auditCustom(AUDIT_EVENTS.X, { old, new, metadata })` inside the action, for what is not a plain model write: role changes (assignments live in authz tables), impersonation, access tokens, invites.
- **Write through the model** (`save()`, `delete()`) whenever the write must be audited. `Model.query().update()` / `.delete()` bypass the hooks and leave no row.
- **Events are a closed list**: `AUDIT_EVENTS` in `app/auth/enums/audit_event.ts`. Add the value there and its label in `users.activity.events.<value>` (every locale). Never store a label in the enum.
- **Inside a transaction**, record on the transaction: `model.useTransaction(trx).auditCustom(...)`, so a rollback drops the audit too.
- **Record in the action, not in a listener** — the actor and request metadata come from the request's `HttpContext` (`useAsyncLocalStorage: true` in `config/app.ts`).
- **Actor under impersonation**: `user_id` is whoever is signed in — the target. The `impersonated_by` resolver adds the admin behind it from the session mark (`currentImpersonation`), and drops a stale mark.
- **Never put a secret in `new`/`old`/`metadata`** — record a token's id and name, never its value.
- **Silence high-volume routes** with the `skipAudit` named middleware; escape it for one event with `auditing.withAuditing(...)`.
- **Left to each application** (document the choice in the app):
  - Masking personal data (CPF, name, e-mail) per field: `static auditMask` with a strategy (`keep-last`, `keep-first`, custom `redact`).
  - Retention: `node ace audit:prune --days=N` on a schedule.
  - What happens to audit rows when a user is deleted (LGPD/GDPR): keep, anonymize or delete.

## Repo refs

- Config + resolvers: `config/auditing.ts`, `app/core/audit_resolvers/`, `app/users/audit_resolvers/impersonated_by_resolver.ts`.
- Enums: `app/auth/enums/audit_event.ts`, `app/auth/enums/auditable_type.ts`.
- Auditable model: `app/auth/models/user.ts`.
- Security events: `app/auth/actions/sync_user_roles.ts`, `app/users/actions/{impersonate_user,create_token,delete_token,invite_user}.ts`.
- Activity page: `app/users/controllers/activity_controller.ts`, `app/users/queries/list_audits.ts`, `app/users/transformers/audit_transformer.ts`, `app/users/ui/pages/activity.tsx` (gated by `users.audit`).
- Skip middleware: `app/core/middleware/skip_audit_middleware.ts` (`middleware.skipAudit()`).
- Specs: `app/auth/tests/unit/user_auditing.spec.ts`, `app/users/tests/functional/impersonate_endpoint.spec.ts`, `app/users/tests/functional/activity_endpoint.spec.ts`.

## Doc refs

- @filipebraida/adonis-auditing — https://github.com/filipebraida/adonis-auditing

## Workflow

### Make a model auditable

```ts
export default class Invoice extends compose(BaseModel, Auditable) {
  static auditableName = AUDITABLE_TYPES.INVOICE
  static auditMask = ['bankAccount']
  static auditExclude = ['viewCount']
}
```

Add `INVOICE: 'invoice'` to `AUDITABLE_TYPES`.

### Record a security event

```ts
await invoice.auditCustom(AUDIT_EVENTS.INVOICE_VOIDED, {
  old: { status: 'issued' },
  new: { status: 'voided' },
  metadata: { reason: input.reason },
})
```

Add `INVOICE_VOIDED` to `AUDIT_EVENTS` and `users.activity.events.invoice_voided` to every locale.

### Test it

```ts
const audit = await invoice.audits().where('event', AUDIT_EVENTS.INVOICE_VOIDED).firstOrFail()
assert.deepEqual(audit.newValues, { status: 'voided' })
```

For the actor and request metadata, go through HTTP (`client.post(...).loginAs(user)`): a unit call has no request, so `user_id` is null. Under impersonation, set the mark with `.withSession({ impersonation: { originalUserId, targetUserId } })`.

## Anti-patterns

- ❌ `query().update()` on an audited model — no audit row.
- ❌ Recording the event in a listener — no actor, no IP.
- ❌ A token value, password or hash in `auditCustom` payloads.
- ❌ Event strings inline (`'voided'`) — use `AUDIT_EVENTS`.
- ❌ Auditing every read — volume buries the signal; reserve `auditCustom` for security-relevant actions.

## Related skills

[[authorization]] · [[actions-events]] · [[testing]]
