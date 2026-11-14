# Forms

Inertia forms in this kit use the project wrapper `Form` from `#core/ui/components/form`, never the raw `<Form>` of `@inertiajs/react` or `@adonisjs/inertia/react` (the lint rule `ui-use-project-form` rejects it in a screen).

## Why the wrapper?

`app/core/ui/components/form.tsx` wraps `<Form>` from `@adonisjs/inertia/react` and puts its `errors` into `FormErrorsContext`. `<Field name>` (same module) sets `FieldNameContext`, and each `<FieldError />` reads both and shows its field's error. Without the wrapper you would prop-drill `errors` to every field.

## Happy path — declarative `<Form>`

```tsx
import { usePage } from '@inertiajs/react'

import { Field, FieldError, Form } from '#core/ui/components/form'
import { useTranslation } from '#core/ui/hooks/use_translation'

import { Button } from '@workspace/ui/components/button'
import { FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'

export function ExampleForm() {
  const { t } = useTranslation()
  const { error: errorMessage } = usePage().flash

  return (
    <Form route="<mod>.<action>">
      {({ processing }) => (
        <>
          <Field name="email">
            <FieldLabel htmlFor="email">{t('<mod>.form.email.label')}</FieldLabel>
            <Input id="email" name="email" type="email" required />
            <FieldError />
          </Field>

          <Button type="submit" disabled={processing}>
            {t('<mod>.form.submit')}
          </Button>

          {/* Root error (flash, not field-level) */}
          <FieldError errors={errorMessage ? [{ message: errorMessage }] : []} />
        </>
      )}
    </Form>
  )
}
```

Key points:

- **`route="..."`** (not `action="..."`) — the HTTP method comes from the Adonis route. For params, `routeParams={{ id }}`.
- **`<Field name="...">`** sets the name in the context; **`<FieldError />`** with no props reads it.
- **`<FieldError errors={...} />`** with explicit errors — for errors outside a field (flash, rate limit).
- **CSRF is automatic** (`enableXsrfCookie` in `config/shield.ts`).
- **Validation runs in the controller**, after the policy (`request.validateUsing(validator)`); 422 errors arrive in the `errors` shared prop.

Real forms: `app/auth/ui/components/{login_form,forgot_password_form,reset_password_form,registration_form}.tsx`.

## When `useForm` instead of `<Form>`

Only when the state is not a flat set of named inputs, and then the file opens with the reason (the lint looks for it):

```tsx
// useForm and not <Form>: <reason>
```

Reasons that hold in this kit:

- Upload progress bound to UI state, or a preview of the picked file (`app/users/ui/components/profile_form.tsx`).
- A controlled field component shared by create and edit (`app/users/ui/pages/create.tsx`, `edit.tsx`).
- A Radix `Select` driven by form state (`app/users/ui/pages/invite.tsx`).
- A confirm button that sits outside the `<form>` (`app/users/ui/components/users_delete_dialog.tsx`).
- Wizard steps, chained submissions, transforming data inside a hook.

```tsx
// useForm and not <Form>: <reason>
import { useForm } from '@inertiajs/react'

import { urlFor } from '~/app/client'

export function ExampleUseForm({ initial }: { initial: { name: string } }) {
  const form = useForm({ name: initial.name })

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    form.put(urlFor('<mod>.<action>'), {
      preserveScroll: true,
      onSuccess: () => form.reset(),
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
      {form.errors.name && <span>{form.errors.name}</span>}
      <button disabled={form.processing}>{/* t('...') */}</button>
    </form>
  )
}
```

Useful `form` properties/methods:

| Prop / method        | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `data`, `setData`    | Controlled field state                           |
| `errors`             | 422 errors (clear when the field changes)        |
| `processing`         | `true` while the submit is in flight             |
| `progress`           | `{ percentage }` during uploads                  |
| `wasSuccessful`      | Last submit succeeded                            |
| `recentlySuccessful` | Succeeded within the last 2s (useful for toasts) |
| `reset()`            | Restore initial state                            |
| `clearErrors()`      | Clear `errors`                                   |
| `cancel()`           | Abort a submit in flight                         |
| `transform(fn)`      | Transform the payload before sending             |

## File uploads

With `<Form>`: add `<input type="file" name="...">` — multipart is enabled automatically.

With `useForm`: put a `File` in the data; `forceFormData: true` when nothing else forces multipart. Progress:

```tsx
{
  form.progress && <Progress value={form.progress.percentage} />
}
```

In the controller, fields declared as `vine.file({ extnames, size })` arrive as `MultipartFile` — see the `attachment` skill.

## Errors — field vs root

- **Field errors** (VineJS 422): land in `errors[fieldName]`. The wrapper's `<FieldError />` resolves them.
- **Root errors**: `session.flash('error', i18n.t('...'))` in the controller (or the exception handler), read with `usePage().flash.error`. The logged-in shells also toast every flash through `useFlashToasts()`.

## Dynamic fields (array / nested)

Standard HTML naming works:

```tsx
<input name="tags[]" />
<input name="items[0][title]" />
<textarea name="meta[description]" />
```

They arrive as nested arrays/objects in the request body. Validate with `vine.array(...)` / `vine.object(...)`.

## `transform` prop

Modifies the data before sending:

```tsx
<Form route="<mod>.<action>" transform={(data) => ({ ...data, slug: slugify(data.title) })}>
  {/* ... */}
</Form>
```

Or with `useForm`: `form.transform((data) => ({ ...data, slug: slugify(data.title) }))`.

## Gotchas

- **`route=`** is type-safe (Tuyau) — if TS complains, the route probably lacks `.as('name')` or the registry is stale (`pnpm ace codegen`).
- `<FieldError />` with no ancestor `<Field name>` and no `errors` prop renders nothing, silently.
- `useForm` **does not** feed the wrapper's error context: use `form.errors.field` directly, not `<FieldError />`.
- Double submit: `disabled={processing}` on the button is enough.

## Official docs

- Forms (v3): https://inertiajs.com/docs/v3/the-basics/forms
- File uploads: https://inertiajs.com/docs/v3/the-basics/file-uploads
- Validation: https://inertiajs.com/docs/v3/the-basics/validation
