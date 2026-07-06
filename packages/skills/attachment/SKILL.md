---
name: attachment
description: 'File uploads with derived variants in an AdonisJS app via `@jrmc/adonis-attachment`. `@attachment()` decorator on a Lucid model + converters config drives image resize/reformat (e.g. webp thumbnails). URLs are pre-computed on read via a model helper. Use when adding an upload field, changing a converter, testing attachment code, or debugging avatar URLs. Trigger on: "file upload", "avatar", "attachment", "thumbnail", "@attachment", "adonis-attachment".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Attachment

File uploads are managed by [`@jrmc/adonis-attachment`](https://github.com/batosai/adonis-attachment). A Lucid model declares an attachment field with `@attachment({...})`; uploads produce a stored file plus derived **variants** (thumbnails, previews, formats) driven by named **converters** in `config/attachment.ts`. Actions accept a `MultipartFile` from a validated form and call `attachmentManager.createFromFile(file)` to assign it. Storage is Drive (`fs` locally, S3-family in prod). URLs are pre-computed on read via a static model helper — always call it before serializing to Inertia so the frontend gets a real URL, not `undefined`.

## Rules

- **Field on model**: decorate with `@attachment({ preComputeUrl: false, variants: [...] })` and type as `Attachment`:
  ```ts
  @attachment({ preComputeUrl: false, variants: ['thumbnail'] })
  declare avatar: Attachment
  ```
  `preComputeUrl: false` keeps model reads cheap — URLs are computed on demand by the static helper.
- **Converters** live in `config/attachment.ts` as a keyed record. Each converter declares options (resize, format, etc.). The variant names in `@attachment({ variants: [...] })` reference those keys.
- **Type augmentation** happens in the config file's `declare module '@jrmc/adonis-attachment'` block — that's how TypeScript knows `variants: ['thumbnail']` is a valid key.
- **Validate uploads** with VineJS `vine.file({...})`:
  ```ts
  avatar: vine.file({ extnames: ['png', 'jpg', 'jpeg', 'gif'], size: 1 * 1024 * 1024 }).nullable()
  ```
- **Persist inside an action** — the action takes a `MultipartFile` (not `HttpContext`) and delegates to the manager:
  ```ts
  if (input.avatar) {
    input.target.avatar = await attachmentManager.createFromFile(input.avatar)
  }
  ```
  See [[actions-events]] for the "no HttpContext in actions" rule.
- **Pre-compute URLs before serialization**. Call the model's static helper on the loaded row (or list) before running the Transformer:
  ```ts
  await User.preComputeUrls(users)
  return inertia.render('users/index', {
    users: UserTransformer.paginate(users, meta).useVariant('forList'),
  })
  ```
  The Transformer variant reads the pre-computed URL from the loaded variant.
- **Fallback URL**: Transformers usually resolve `variant.url ?? this.resource.<remoteUrl>` so an externally-hosted URL (social-auth avatar, S3 direct link) works when no local upload exists.
- **Drive config** picks the disk (`fs`, `s3`, `gcs`, …). The `DRIVE_DISK` env var selects it.

## Doc refs

- Package README — https://github.com/batosai/adonis-attachment
- AdonisJS Drive — https://docs.adonisjs.com/guides/digging-deeper/drive
- VineJS file validation — https://vinejs.dev/docs/types/file

## Workflow

### Add an attachment field to a model

1. **Add a converter** in `config/attachment.ts` if the format/size you need doesn't exist yet:
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
4. **Static `preComputeUrls`** on the model — mirror the pattern used elsewhere:
   ```ts
   static async preComputeUrls(rows: Post | Post[]) {
     if (Array.isArray(rows)) {
       await Promise.all(rows.map((r) => this.preComputeUrls(r)))
       return
     }
     const hero = rows.cover?.getVariant('hero')
     if (hero) await attachmentManager.computeUrl(hero)
   }
   ```
5. **Validator**: `cover: vine.file({ extnames: [...], size: 5 * 1024 * 1024 }).nullable()`.
6. **Action**: `input.target.cover = await attachmentManager.createFromFile(input.cover)`.
7. **Transformer**: expose the URL via a helper (`coverUrl()`) so consumers don't dig into the variant graph.
8. **Controller**: call `Model.preComputeUrls(...)` on the loaded rows before running the Transformer.

### Change a converter

Edit `config/attachment.ts`. Existing uploads keep their old variant unless you re-process — there's no automatic re-render on config change.

### Testing

- Use a real file fixture (small PNG) with the API client's `.file(...)` method.
- Fake Drive: `drive.fake()` in group setup — see [[testing]].
- Assert the DB row has the attachment JSON populated; assert file existence via `disk.assertExists(...)`.

## Anti-patterns

- ❌ Skipping `preComputeUrls` before serialization — the Transformer returns `undefined` for the variant URL and the frontend breaks.
- ❌ Setting `preComputeUrl: true` on the decorator to "save code" — every model read now does filesystem I/O, even when the row isn't serialized.
- ❌ Reading `user.avatar.url` directly in a React component — always through a Transformer helper. Otherwise the shape drifts.
- ❌ Storing the raw uploaded filename or path outside `@attachment` — the package owns storage and filenames.
- ❌ Validator without a `size` limit — DoS via huge uploads.
- ❌ Bypassing `attachmentManager.createFromFile(...)` and stuffing the `MultipartFile` into the model field directly.

## Related skills

[[crud]] · [[actions-events]] · [[testing]] · [[inertia]]
