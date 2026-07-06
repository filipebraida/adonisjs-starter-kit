---
name: mail
description: 'Transactional email in an AdonisJS app — `@adonisjs/mail` classes extending `BaseMail`, MJML templates via a shared `@email.layout` component, and `mailContext()` for appName/appUrl. Never author raw HTML+CSS blocks. Use when adding a new email, editing an existing template, testing mail with `mail.fake()`, or wiring the SMTP env. Trigger on: "add email", "send mail", "MJML template", "reset password mail", "welcome email".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Mail

Emails are classes that extend `@adonisjs/mail`'s `BaseMail`. The `prepare()` method sets recipients, subject, and calls `this.message.htmlView('<mod>::emails/<template>', {...})`. Templates are `.edge` files at `app/<mod>/ui/emails/<name>.edge` that consume a shared `@email.layout` component. The layout owns fonts, colors, button styles, header, and footer; each template only fills the body slot. Raw `<html><head><style>` blocks are never authored — MJML with the shared layout is mandatory. Emails are always dispatched from event listeners, not from actions directly (see [[actions-events]]), so unit tests can fake the emitter and end-to-end tests can fake the mail transport.

## Rules

- **Mail class location**: `app/<mod>/mails/<name>_notification.ts` — one file per email.
- **Class shape**: extends `BaseMail`, declares `from = env.get('EMAIL_FROM')`, sets `subject` either as a class field or dynamically in `prepare()` from a `translations` field.
- **`prepare()`** does all the work: build any URL (via `signedUrlFor` for time-limited links), call `this.message.to(recipient).subject(...)`, then render with `htmlView('<mod>::emails/<template>', props)`. Always spread `...mailContext()` into props so the layout has `appName` + `appUrl`.
- **Templates** live at `app/<mod>/ui/emails/<name>.edge`. Every template opens with `@email.layout({ title, preview: subtitle })` and closes with `@end`. Between them, only `<mj-section>` markup — body, button, text.
- **Shared MJML layout** is the single source of truth for typography, colors, header, footer. Change once, all emails update.
- **`mailContext()`** returns `{ appName, appUrl }` from env with a fallback name. Every mail class spreads it into `htmlView` props so the layout can render brand chrome.
- **Env**: `EMAIL_FROM` required; `APP_NAME` optional (has a fallback); `APP_URL` required. SMTP vars for local dev (typically Mailpit) and the prod driver's API key (e.g. `RESEND_API_KEY`).
- **Trigger via events, not directly from actions** — the listener in `<mod>/start/events.ts` calls `mail.send(new Mail(...))`. See [[actions-events]].
- **i18n**: the translation shape is a plain interface (`subject`, `title`, `subtitle`, `actionBtn`, `defaultMessage`). Passed from the caller. Keys live per module under `emails.<name>.*` in the locale JSON — see [[i18n]].

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
3. **Mount the edge namespace** for the module — `app/<mod>/start/view.ts` calls `edge.mount('<mod>', new URL('ui', BASE_URL))`. Preload the file via `adonisrc.ts` — see [[module-scaffolding]].
4. **i18n**: add `emails.<name>.{subject,title,subtitle,actionBtn,defaultMessage}` to the locale JSON — see [[i18n]].
5. **Trigger via event**: emit the domain event from the action; the listener in `<mod>/start/events.ts` calls `mail.send(new Mail(...))` — see [[actions-events]].

### Change the shared look

Edit the shared MJML layout component. Every email updates. Ask whether a change belongs in the shared layout (font, brand color, corners) or per-template (headline size, hero image).

### Signed / time-limited URLs

Use `signedUrlFor('route.name', params, { expiresIn, prefixUrl, purpose })` for password-reset-style links so the URL expires and can only be consumed once.

### Testing

`tests/bootstrap.ts` typically calls `mail.fake()` as a safety net so no spec accidentally emails a real inbox. Per-spec, opt into stricter assertions:

```ts
const mails = mail.fake()
await someActionThatSends()
mails.assertSent(WelcomeNotification, (msg) => msg.to === user.email)
mails.restore()
```

For listener specs, call `mail.fake()` before `emitter.emit(...)` — see [[testing]].

## Anti-patterns

- ❌ Authoring `<html><head><style>` blocks — bypasses the layout, breaks responsive defaults, drifts from other emails.
- ❌ Duplicating header/footer HTML in every template — use the layout.
- ❌ Calling `mail.send(...)` directly from an action — emit an event; the listener sends. Otherwise unit tests must stub the mail service.
- ❌ Hardcoding `appName` inside a template — read `{{ appName }}` (provided by `mailContext()`).
- ❌ Assembling URLs by string concat when `signedUrlFor` (or `urlFor` on the frontend) is available.
- ❌ Forgetting `preview` in `@email.layout({ title, preview })` — a good preview text noticeably improves inbox opens.
- ❌ Passing a Lucid model into the mail class and dereferencing it inside `prepare()` — pull the fields you need into a plain object first, so the class stays serializable and easy to test.

## Related skills

[[actions-events]] · [[i18n]] · [[testing]] · [[notifications]]
