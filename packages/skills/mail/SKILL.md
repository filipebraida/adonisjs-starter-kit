---
name: mail
description: 'Transactional email in an AdonisJS app — `@adonisjs/mail` classes extending `BaseMail`, MJML templates via a shared `@email.layout` component, and `mailContext()` for appName/appUrl. Never author raw HTML+CSS blocks. Use when adding a new email, editing an existing template, testing mail with `mail.fake()`, or wiring the SMTP env. Trigger on: "add email", "send mail", "MJML template", "reset password mail", "welcome email".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Mail

Emails are classes that extend `@adonisjs/mail`'s `BaseMail`. The `prepare()` method sets recipients, subject, and calls `this.message.htmlView('<mod>::emails/<template>', {...})`. Templates are `.edge` files at `app/<mod>/ui/emails/<name>.edge` that consume a shared `@email.layout` component. The layout owns fonts, colors, button styles, header, and footer; each template only fills the body slot. Raw `<html><head><style>` blocks are never authored — MJML with the shared layout is mandatory. Emails are never sent from actions or listeners: the action emits a domain event, its listener schedules a durable workflow, and the workflow calls `mail.send(...)` inside a checkpointed `ctx.localStep` that retries while the provider is down (see [[actions-events]]).

## Rules

- **Mail class location**: `app/<mod>/mails/<name>_notification.ts` — one file per email.
- **Class shape**: extends `BaseMail`, declares `from = env.get('EMAIL_FROM')`, sets `subject` either as a class field or dynamically in `prepare()` from a `translations` field.
- **`prepare()`** does all the work: build any URL with `urlFor(..., { prefixUrl: env.get('APP_URL') })`, call `this.message.to(recipient).subject(...)`, then render with `htmlView('<mod>::emails/<template>', props)`. Always spread `...mailContext()` into props so the layout has `appName` + `appUrl`.
- **Templates** live at `app/<mod>/ui/emails/<name>.edge`. Every template opens with `@email.layout({ title, preview: subtitle })` and closes with `@end`. Between them, only `<mj-section>` markup — body, button, text.
- **Shared MJML layout** is the single source of truth for typography, colors, header, footer. Change once, all emails update.
- **`mailContext()`** returns `{ appName, appUrl }` from env with a fallback name. Every mail class spreads it into `htmlView` props so the layout can render brand chrome.
- **Env**: `EMAIL_FROM` required; `APP_NAME` optional (has a fallback); `APP_URL` required. SMTP vars for local dev (typically Mailpit) and the prod driver's API key (e.g. `RESEND_API_KEY`).
- **i18n is resolved before the mail is built.** The action translates with the request's `i18n` into a `MailBasicTranslation` (`#core/types/mail`: `subject`, `title`, `subtitle`, `actionBtn`, `defaultMessage`) — plain strings that travel in the event and the workflow input. The mail class never looks up keys, so the run replays with the same text. Keys live per module under `<mod>.emails.<name>.{subject,title,subtitle,action_btn,default_message}` in every locale JSON — see [[i18n]].
- **Sent from a workflow step**: `await mail.send(new XNotification(...))` inside `ctx.localStep('mail', ..., { retries: 5, backoff: 'exp', backoffMs: 1000 })`, after reloading the recipient by id. Workflows whose input carries a secret (reset token, invite link) are listed in `MAIL_WORKFLOWS` in `config/durable.ts` so retention purges their runs quickly.

## Repo refs

- Mail class + `prepare()`: `app/auth/mails/reset_password_notification.ts`, `app/users/mails/welcome_notification.ts`.
- Shared MJML layout: `resources/views/components/email/layout.edge`. Template: `app/users/ui/emails/welcome.edge`.
- `mailContext()`: `app/core/utils/mail_context.ts`.
- Translations built in the action: `app/users/actions/invite_user.ts`, `app/auth/actions/request_password_reset.ts`.
- Workflow that sends the mail: `app/auth/workflows/send_password_reset_workflow.ts`; its spec: `app/auth/tests/unit/workflows/send_password_reset_workflow.spec.ts`.

## Doc refs

- AdonisJS Mail — https://docs.adonisjs.com/guides/digging-deeper/mail
- MJML documentation — https://mjml.io/documentation/
- MJML in AdonisJS — https://docs.adonisjs.com/guides/digging-deeper/mail#using-mjml-for-responsive-emails

## Workflow

### Add a new email

1. **Class** at `app/<mod>/mails/<name>_notification.ts`:
   ```ts
   import { BaseMail } from '@adonisjs/mail'
   import { urlFor } from '@adonisjs/core/services/url_builder'
   import env from '#start/env'
   import { mailContext } from '#core/utils/mail_context'
   import type { MailBasicTranslation } from '#core/types/mail'

   export default class OrderConfirmedNotification extends BaseMail {
     from = env.get('EMAIL_FROM')
     subject = 'Order confirmed'

     constructor(
       private user: User,
       private order: Order,
       private translations: MailBasicTranslation,
     ) {
       super()
       this.subject = translations.subject
     }

     async prepare() {
       const { title, subtitle, actionBtn, defaultMessage } = this.translations
       this.message.to(this.user.email).subject(this.translations.subject)
       this.message.htmlView('<mod>::emails/order_confirmed', {
         ...mailContext(),
         title,
         subtitle,
         actionBtn,
         defaultMessage,
         orderUrl: urlFor('orders.show', { id: this.order.id }, { prefixUrl: env.get('APP_URL') }),
       })
     }
   }
   ```
2. **Template** at `app/<mod>/ui/emails/<name>.edge`:
   ```edge
   @email.layout({ title, preview: subtitle })
     <mj-section background-color="#ffffff" padding="36px 40px 8px">
       <mj-column>
         <mj-text font-size="28px" font-weight="800" color="#141820">{{ title }}</mj-text>
         <mj-text padding="24px 0 0" font-size="16px" color="#3A4150">{{ subtitle }}</mj-text>
       </mj-column>
     </mj-section>

     <mj-section background-color="#ffffff" padding="0 40px 28px">
       <mj-column>
         <mj-button href="{{ orderUrl }}" align="left">{{ actionBtn }}</mj-button>
       </mj-column>
     </mj-section>
   @end
   ```
3. **Mount the edge namespace** for the module — `app/<mod>/start/view.ts` calls `edge.mount('<mod>', new URL('ui', BASE_URL))`. Preload the file via `adonisrc.ts` — see [[module-scaffolding]].
4. **i18n**: add `<mod>.emails.<name>.{subject,title,subtitle,action_btn,default_message}` to every locale JSON, and build the `MailBasicTranslation` in the action with `input.i18n.t(...)` — see [[i18n]].
5. **Trigger via event**: the action emits the domain event with the translations; the listener dispatches a workflow; the workflow's `mail` step calls `mail.send(new Mail(...))` — see [[actions-events]].
6. **Verify**: a workflow spec that asserts the send with `mail.fake()` (see Testing below) — not done until it confirms the mail dispatches.

### Change the shared look

Edit the shared MJML layout component. Every email updates. Ask whether a change belongs in the shared layout (font, brand color, corners) or per-template (headline size, hero image).

### Signed / time-limited URLs

A link that carries a secret token (reset, invitation) is a plain `urlFor(...)`: the token's expiry in the database is the limit. Use `signedUrlFor('route.name', params, { expiresIn, prefixUrl, purpose })` only when the route checks it with `request.hasValidSignature(purpose)`; a signature nobody checks is a second, decorative limit.

### Testing

There is no global mail fake: the spec that reaches `mail.send` fakes it inside the test with `using`, which restores it when the test ends, even on failure. That spec is the workflow's:

```ts
using mails = mail.fake()
// The mail signs a named route; only the functional suite's HTTP server commits them.
router.commit()
const user = await UserFactory.create()

const t = createTestEngine()
const { name, version } = SendWelcomeWorkflow.workflow
t.engine.register(name, version, (ctx, input) =>
  new SendWelcomeWorkflow().run(ctx, input as SendWelcomeInput)
)
await t.run(name, { userId: user.id, token: 'invite-token', translations }, 'run-1')

await assertRunStatus(t.store, 'run-1', 'completed')
mails.mails.assertSent(WelcomeNotification, (sent) => sent.message.hasTo(user.email))
```

Action and listener specs never reach the mailer (the emitter is faked, `dispatch` is stubbed) — see [[testing]].

## Anti-patterns

- ❌ Authoring `<html><head><style>` blocks — bypasses the layout, breaks responsive defaults, drifts from other emails.
- ❌ Duplicating header/footer HTML in every template — use the layout.
- ❌ Calling `mail.send(...)` from an action or a listener — emit an event; the listener schedules a workflow; the workflow's step sends, with retries.
- ❌ Translating inside the mail class or the workflow — resolve the strings in the action, while the request's locale is at hand.
- ❌ Hardcoding `appName` inside a template — read `{{ appName }}` (provided by `mailContext()`).
- ❌ Assembling URLs by string concat when `signedUrlFor` (or `urlFor` on the frontend) is available.
- ❌ Forgetting `preview` in `@email.layout({ title, preview })` — a good preview text noticeably improves inbox opens.
- ❌ Passing a Lucid model through the event into the workflow input — dispatch the id and reload the model inside the step that builds the mail.

## Related skills

[[actions-events]] · [[i18n]] · [[testing]] · [[notifications]]
