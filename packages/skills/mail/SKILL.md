---
name: mail
description: 'Transactional email in this repo — `@adonisjs/mail` classes extending `BaseMail`, MJML templates via the shared `@email.layout` component, and `mailContext()` for appName/appUrl. Never author raw HTML+CSS blocks. Use when adding a new email, editing an existing template, testing mail with `mail.fake()`, or wiring the SMTP env. Trigger on: "add email", "send mail", "MJML template", "reset password mail", "welcome email".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Mail

Emails are classes that extend `@adonisjs/mail`'s `BaseMail`. The `prepare()` method sets recipients, subject, and calls `this.message.htmlView('<mod>::emails/<template>', {...})`. Templates are `.edge` files at `app/<mod>/ui/emails/<name>.edge` that consume the shared `@email.layout` component from `resources/views/components/email/layout.edge`. The layout owns fonts, colors, button styles, header, and footer; each template only fills the main slot. Do not author raw `<html><head><style>` blocks — MJML with the shared layout is mandatory.

## Conventions

- **Mail class location**: `app/<mod>/mails/<name>_notification.ts` — one file per email.
- **Class shape**: extends `BaseMail`, declares `from = env.get('EMAIL_FROM')`, sets subject either as a class field or dynamically in `prepare()` from `this.translations`.
- **`prepare()`** does all the work — build any URL (via `signedUrlFor` for time-limited links), call `this.message.to(user.email).subject(...)`, then render with `htmlView('<mod>::emails/<template>', props)`. Spread `...mailContext()` into props so the layout has `appName` + `appUrl`.
- **Templates live at** `app/<mod>/ui/emails/<name>.edge`. Every template opens with `@email.layout({ title, preview: subtitle })` and closes with `@end`. Between them, only `<mj-section>` markup with body/button/text.
- **Shared layout** (`resources/views/components/email/layout.edge`) is the single source of truth for typography, colors, header, footer. Change once, all emails update.
- **`mailContext()`** from `#common/services/mail_context` returns `{ appName, appUrl }` from env with a fallback name. Every mail class spreads it into `htmlView` props.
- **Env**: `EMAIL_FROM` required, `APP_NAME` optional (defaults to `AdonisJS Starter Kit`), `APP_URL` required. SMTP vars for local dev (Mailpit via `pnpm infra:up`) and Resend via `RESEND_API_KEY` for prod.
- **Trigger via events, not directly from actions** — the listener in `<mod>/start/events.ts` calls `mail.send(new Mail(...))`. See [[actions-events]].
- **i18n**: translation shape is `MailBasicTranslation` (`subject`, `title`, `subtitle`, `actionBtn`, `defaultMessage`). Passed from the caller. Keys live per module in `<mod>/resources/lang/<locale>/<mod>.json` under `emails.<name>.*`. See [[i18n]].

## Repo refs

- Base translation shape: `apps/web/app/common/models/mail_basic_translation.ts`.
- Mail context helper: `apps/web/app/common/services/mail_context.ts`.
- Welcome mail class: `apps/web/app/users/mails/welcome_notification.ts` (uses `signedUrlFor` for the password-set link).
- Reset-password mail class: `apps/web/app/auth/mails/reset_password_notification.ts`.
- Shared MJML layout: `apps/web/resources/views/components/email/layout.edge`.
- Welcome template: `apps/web/app/users/ui/emails/welcome.edge`.
- Reset-password template: `apps/web/app/auth/ui/emails/forgot_password.edge`.
- Listener that sends welcome mail (canonical trigger): `apps/web/app/users/start/events.ts` — `emitter.on('user:registered', ...)`.
- Mail config: `apps/web/config/mail.ts`.
- Bootstrap global `mail.fake()` (test safety net): `apps/web/tests/bootstrap.ts`.

## Doc refs

- AdonisJS Mail — https://docs.adonisjs.com/guides/digging-deeper/mail
- MJML documentation — https://mjml.io/documentation/
- MJML in AdonisJS — https://docs.adonisjs.com/guides/digging-deeper/mail#using-mjml-for-responsive-emails

## Workflow

### Add a new email

1. **Class** at `app/<mod>/mails/<name>_notification.ts`:
   ```ts
   import { BaseMail } from '@adonisjs/mail'
   import env from '#start/env'
   import { mailContext } from '#common/services/mail_context'
   import type User from '#users/models/user'
   import type { MailBasicTranslation } from '#common/models/mail_basic_translation'

   export default class OrderConfirmedNotification extends BaseMail {
     from = env.get('EMAIL_FROM')
     subject = 'Order confirmed'

     constructor(private user: User, private order: Order, private translations: MailBasicTranslation) {
       super()
       this.subject = this.translations.subject
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
         orderUrl: `${env.get('APP_URL')}/orders/${this.order.id}`,
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
3. **Ensure the edge namespace is mounted** for the module — `app/<mod>/start/view.ts` does `edge.mount('<mod>', new URL('ui', BASE_URL))`. See existing modules (users/auth).
4. **i18n**: add `emails.<name>.{subject,title,subtitle,actionBtn,defaultMessage}` to `<mod>/resources/lang/{en,fr,pt}/<mod>.json`. See [[i18n]].
5. **Trigger via event**: emit from the action, receive in `<mod>/start/events.ts`, call `mail.send(new Mail(...))`. See [[actions-events]].

### Change the shared look

Edit `resources/views/components/email/layout.edge`. Every email updates. Consider whether a change should be part of the shared layout (font, brand color, corners) vs. per-template (headline size, hero image).

### Signed / time-limited URLs

Use `signedUrlFor('route.name', params, { expiresIn, prefixUrl, purpose })` for password-reset-style links. See `welcome_notification.ts` and `reset_password_notification.ts`.

### Testing

`tests/bootstrap.ts` already calls `mail.fake()` as a safety net so no spec accidentally emails a real inbox. In specific specs, opt into stricter assertions:

```ts
const mails = mail.fake()
await someActionThatSends()
mails.assertSent(WelcomeNotification, (msg) => msg.to === user.email)
mails.restore()
```

For listener specs, call `mail.fake()` before `emitter.emit(...)`. See [[testing]].

## Anti-patterns

- ❌ Authoring `<html><head><style>` blocks — bypass the layout, break responsive defaults, and drift from other emails.
- ❌ Duplicating header/footer HTML in every template — use the layout.
- ❌ Calling `mail.send(...)` directly from an action — emit an event; the listener sends. Otherwise unit tests must stub the mail service.
- ❌ Hardcoding `appName` inside a template — read `{{ appName }}` (provided by `mailContext()`).
- ❌ Assembling URLs by string concat when `signedUrlFor` (or `urlFor` on the frontend) is available.
- ❌ Forgetting `preview` in `@email.layout({ title, preview })` — a good preview text improves inbox opens.

## Related skills

[[actions-events]] · [[i18n]] · [[testing]] · [[notifications]]
