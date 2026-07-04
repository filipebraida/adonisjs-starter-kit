---
name: attachment
description: 'File uploads with derived variants via `@jrmc/adonis-attachment`. `@attachment()` decorator on a Lucid model + converters config drives image resize/reformat (e.g. webp thumbnails). URLs are pre-computed by the model on read. Use when adding an upload field, changing a converter, testing attachment code, or debugging avatar URLs. Trigger on: "file upload", "avatar", "attachment", "thumbnail", "@attachment", "adonis-attachment".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Attachment

File uploads are managed by [`@jrmc/adonis-attachment`](https://github.com/batosai/adonis-attachment). A Lucid model declares an attachment field with `@attachment({...})`, uploads produce a stored file plus derived **variants** (thumbnails, previews, formats) driven by named **converters** in `config/attachment.ts`. Actions accept a `MultipartFile` from a validated form and call `attachmentManager.createFromFile(file)` to assign it. Storage backend is [Drive](https://docs.adonisjs.com/guides/digging-deeper/drive) (fs by default in this repo). URLs are pre-computed on read via a static helper (`Model.preComputeUrls(...)`) — always call it before serializing to Inertia.

## Conventions

- **Field on model**: decorate with `@attachment({ preComputeUrl: false, variants: ['thumbnail'] })` and declare the type as `Attachment`:
  ```ts
  @attachment({ preComputeUrl: false, variants: ['thumbnail'] })
  declare avatar: Attachment
  ```
  `preComputeUrl: false` keeps model reads cheap — URLs are computed on demand.
- **Converters** live in `apps/web/config/attachment.ts` as a keyed record. Each converter defines options (resize, format, etc). The variant names in `@attachment({ variants: [...] })` reference those keys.
- **Type augmentation** happens in the config file's `declare module '@jrmc/adonis-attachment'` block — that's how TS knows `variants: ['thumbnail']` is valid.
- **Validate uploads** with VineJS `vine.file({...})`:
  ```ts
  avatar: vine.file({ extnames: ['png', 'jpg', 'jpeg', 'gif'], size: 1 * 1024 * 1024 }).nullable()
  ```
- **Persist inside an action**:
  ```ts
  if (input.avatar) {
    input.target.avatar = await attachmentManager.createFromFile(input.avatar)
  }
  ```
  Never touch `HttpContext` in the action ([[actions-events]]) — take `MultipartFile` as input.
- **Pre-compute URLs before serialization**. Call the model's static helper on the loaded row (or list) before running the Transformer:
  ```ts
  await User.preComputeUrls(users)
  return inertia.render('users/index', { users: UserTransformer.paginate(users, meta).useVariant('forList') })
  ```
  The Transformer variant reads the pre-computed URL from the loaded variant.
- **Fallback URL**: Transformers usually return `variant.url ?? this.resource.avatarUrl` so a social-auth `avatarUrl` (external URL) works when no upload exists — see the user's `avatarUrl()` helper in the transformer.
- **Drive config** picks the disk (fs / s3 / gcs / …). This repo defaults to `fs`; env var `DRIVE_DISK` selects it.

## Repo refs

- Attachment config with a `thumbnail` (webp @ 300px) converter: `apps/web/config/attachment.ts`.
- Model field decoration: `apps/web/app/users/models/user.ts` (`@attachment({ preComputeUrl: false, variants: ['thumbnail'] })`).
- Static `preComputeUrls(models)`: `apps/web/app/users/models/user.ts`.
- Action that uploads: `apps/web/app/users/actions/update_profile.ts` (`attachmentManager.createFromFile(input.avatar)`).
- Validator for upload: `apps/web/app/users/validators/users.ts` → `updateProfileValidator` (`vine.file(...)`).
- Transformer variant that returns the URL: `apps/web/app/users/transformers/user_transformer.ts` (`avatarUrl()` — thumbnail URL or `avatarUrl` fallback).
- Controller side that calls preCompute + Transformer: `apps/web/app/users/controllers/users_controller.ts` (`await User.preComputeUrls(usersData)`).
- Drive config: `apps/web/config/drive.ts`.

## Doc refs

- Package README — https://github.com/batosai/adonis-attachment
- AdonisJS Drive — https://docs.adonisjs.com/guides/digging-deeper/drive
- VineJS file validation — https://vinejs.dev/docs/types/file

## Workflow

### Add an attachment field to a model

1. **Add a converter** in `apps/web/config/attachment.ts` if the format/size you need doesn't exist yet:
   ```ts
   converters: {
     thumbnail: { options: { resize: 300, format: 'webp' } },
     hero: { options: { resize: 1600, format: 'webp' } },
   },
   ```
2. **Decorate the model column**:
   ```ts
   @attachment({ preComputeUrl: false, variants: ['hero'] })
   declare cover: Attachment
   ```
3. **Migration**: add a JSON column for the attachment metadata:
   ```ts
   table.json('cover').nullable()
   ```
4. **Static `preComputeUrls`** on the model — mirror the pattern in `User`:
   ```ts
   static async preComputeUrls(rows: Post | Post[]) {
     if (Array.isArray(rows)) { await Promise.all(rows.map((r) => this.preComputeUrls(r))); return }
     const hero = rows.cover?.getVariant('hero')
     if (hero) await attachmentManager.computeUrl(hero)
   }
   ```
5. **Validator**: `cover: vine.file({ extnames: [...], size: 5 * 1024 * 1024 }).nullable()`.
6. **Action**: `input.target.cover = await attachmentManager.createFromFile(input.cover)`.
7. **Transformer**: expose the URL via a helper (`coverUrl()`) so consumers don't dig into the variant graph.
8. **Controller**: call `Model.preComputeUrls(...)` before Transformer.

### Change a converter

Edit `apps/web/config/attachment.ts`. Existing uploads keep their old variant unless you re-process — no automatic re-render on config change.

### Testing

- Use a real file fixture (small PNG) with the API client's `.file(...)` method.
- Fake Drive: `drive.fake()` in setup. See [[testing]].
- Assert the DB row has the attachment JSON populated; assert file existence via `drive.assertExists(...)`.

## Anti-patterns

- ❌ Skipping `preComputeUrls` — Transformer returns `undefined` for the variant URL, frontend breaks.
- ❌ Setting `preComputeUrl: true` on the decorator to "save code" — makes every model read do file-system I/O even when no serialization happens.
- ❌ Reading `user.avatar.url` directly from a React component — always through the Transformer helper.
- ❌ Storing the raw uploaded filename or path outside `@attachment` — the package owns storage and filenames.
- ❌ Validator without `size` limit — DoS via huge uploads.
- ❌ Bypassing `attachmentManager.createFromFile(...)` and stuffing the `MultipartFile` into `input.target.avatar` directly.

## Related skills

[[crud]] · [[actions-events]] · [[testing]] · [[inertia]]
