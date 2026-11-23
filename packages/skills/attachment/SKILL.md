---
name: attachment
description: 'File uploads with derived variants in an AdonisJS app via `@jrmc/adonis-attachment` v6. The file lives in the package tables (`adonis_attachments`, `adonis_attachment_links`), not a model column: the model declares an `@attachment()` relation from `@jrmc/adonis-attachment/lucid`, the action stages a draft with `relation.set(...)` and saves the owner, and variants (webp thumbnails) are made in a queue after the commit. Use when adding an upload field, changing a converter, testing attachment code, or debugging avatar URLs. Trigger on: "file upload", "avatar", "attachment", "thumbnail", "@attachment", "adonis-attachment".'
license: MIT
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# Attachment

File uploads are managed by [`@jrmc/adonis-attachment`](https://next.adonis-attachment.jrmc.dev/) **v6**, on top of Drive. The file is not a model column: it lives in the package's own tables (`adonis_attachments` holds each file and its variants, `adonis_attachment_links` links a file to the row that owns it, both created by core's `create_adonis_attachments_table` migration). The model declares a relation with `@attachment({...})`; an action turns the validated `MultipartFile` into a draft and stages it on the relation; saving the owner writes the file. Derived **variants** (thumbnails, formats) come from named **converters** in `config/attachment.ts` and are made in the package's queue after the commit, outside the request. The package ships its own skills in `apps/web/node_modules/@jrmc/adonis-attachment/skills/`: read them before going beyond this page, the v6 API is not v5's.

## Rules

- **Relation on the model**, from `/lucid`, typed `AttachmentRelation`:
  ```ts
  import { attachment, type AttachmentRelation } from '@jrmc/adonis-attachment/lucid'

  @attachment<User>({ folder: 'avatars', variants: ['thumbnail'], meta: false })
  declare avatar: AttachmentRelation
  ```
  No column and no migration for the field: the link table carries it. `meta: false` keeps EXIF (which can hold a location) out of the database.
- **Converters** live in `config/attachment.ts` as a keyed record (`thumbnail: { resize: 300, format: 'webp' }`). The names in `variants: [...]` reference those keys; the `declare module '@jrmc/adonis-attachment'` block at the end of the config types them.
- **Validate uploads** with VineJS `vine.file({...})`, always with `extnames` and `size`:
  ```ts
  avatar: vine.file({ extnames: ['png', 'jpg', 'jpeg', 'gif'], size: 1 * 1024 * 1024 }).nullable()
  ```
- **Write inside an action** ([[actions-events]]): `createFrom*` returns a draft, nothing reaches the disk before the owner's `save()`:
  ```ts
  if (input.avatar) {
    input.target.avatar.set(await attachmentManager.createFromFile(input.avatar))
  }
  await input.target.save()
  ```
  From a buffer, pass `originalName` and `mimeType`. `detach()` + `save()` removes it; the old file is deleted after the commit.
- **Read the URL before serializing**: `getUrl` is async, and a transformer is not. The model's static helper resolves it into a plain property, and the controller calls it on the loaded rows before the transformer runs:
  ```ts
  await User.preComputeUrls(users) // sets user.avatarThumbnailUrl
  return inertia.render('users/index', {
    users: UserTransformer.paginate(users, meta).useVariant('forList'),
  })
  ```
  The helper asks `avatar.getUrl('thumbnail', { fallback: 'original' })`: the thumbnail may not exist yet (the queue makes it after the commit) or ever (the memory queue loses what was pending at a restart), and the original stands in.
- **Fallback URL**: the transformer resolves `avatarThumbnailUrl ?? avatarUrl`, so the picture a social login brought shows while nothing was uploaded.
- **Drive config** picks the disk (`fs`, `s3`, …) through `DRIVE_DISK`; `storage: storage.drive()` in `config/attachment.ts` uses its default disk.

## Repo refs

- `@attachment` relation + `preComputeUrls`: `app/auth/models/user.ts` (avatar).
- Action that writes: `app/users/actions/update_profile.ts`. Validator: `app/users/validators/users.ts`.
- Converters, storage, store and queue: `config/attachment.ts`. Tables: `app/core/database/migrations/1794700000001_create_adonis_attachments_table.ts`.

## Doc refs

- Package docs (v6) — https://next.adonis-attachment.jrmc.dev/ (and the skills in `node_modules/@jrmc/adonis-attachment/skills/`)
- AdonisJS Drive — https://docs.adonisjs.com/guides/digging-deeper/drive
- VineJS file validation — https://vinejs.dev/docs/types/file

## Workflow

### Add an attachment field to a model

1. **Add a converter** in `config/attachment.ts` if the format/size you need doesn't exist yet: `hero: { resize: 1600, format: 'webp' }`.
2. **Declare the relation**: `@attachment<Post>({ folder: 'covers', variants: ['hero'], meta: false }) declare cover: AttachmentRelation`. No migration.
3. **URL helper** on the model, mirroring `User.preComputeUrls`: a plain property set from `await row.cover.getUrl('hero', { fallback: 'original' })`.
4. **Validator**: `cover: vine.file({ extnames: [...], size: 5 * 1024 * 1024 }).nullable()`.
5. **Action**: `input.target.cover.set(await attachmentManager.createFromFile(input.cover))`, then `save()`.
6. **Transformer**: expose the URL property through a helper (`coverUrl()`).
7. **Controller**: call the URL helper on the loaded rows before running the transformer.

### Change a converter

Edit `config/attachment.ts`. Existing files keep their old variant until regenerated (`relation.regenerateVariants()`); nothing re-renders on a config change.

### Testing

- Fake Drive inside every test that uploads: `using disk = drive.fake(env.get('DRIVE_DISK') || 'fs')`, or `using _disk = ...` when the test asserts nothing on the disk — see [[testing]].
- Generate the file in the test (`fileGenerator.generatePng(50 * 1024, 'avatar.png')` from `@poppinss/file-generator`) and send it with the API client's `.file(...)`. To give a factory row a file, stage a draft from a buffer and save it.
- Assert the effect: the link exists and the file is on the fake disk — `const avatar = await user.avatar.get()` then `await disk.exists(avatar!.attachment.path)`. Canonical: `app/users/tests/functional/settings/profile.spec.ts`.
- The suite holds variant generation (`tests/helpers/attachment.ts`, wired in `tests/bootstrap.ts`): a queued job would run after the test's transaction was rolled back. A spec about a variant generates it explicitly.

## Anti-patterns

- ❌ Assigning to the relation (`user.avatar = draft`, the v5 shape) — stage it with `user.avatar.set(draft)` and save the owner.
- ❌ A `jsonb` column for the file, or importing `attachment` from the package root — v6 table relations come from `@jrmc/adonis-attachment/lucid`.
- ❌ Skipping the URL helper before serialization — the transformer cannot await `getUrl`, and the frontend gets `null`.
- ❌ Assuming the thumbnail exists right after the upload — it is made after the commit; read with `{ fallback: 'original' }`.
- ❌ Reading a file path or URL in a React component from anything but the transformer's field — the shape drifts.
- ❌ Validator without a `size` limit — DoS via huge uploads.

## Related skills

[[crud]] · [[actions-events]] · [[testing]] · [[inertia]]
