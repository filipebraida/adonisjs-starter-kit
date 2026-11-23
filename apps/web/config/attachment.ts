import { defineConfig, queue, storage, store, type InferConverters } from '@jrmc/adonis-attachment'

const attachmentConfig = defineConfig({
  storage: storage.drive(),
  store: store.lucid(),
  // Variants are made after the file is saved, outside the request, in the
  // process's own queue: what was pending at a restart is lost, and the screen
  // shows the original until the thumbnail exists.
  queue: queue.memory(),
  converters: {
    thumbnail: {
      resize: 300,
      format: 'webp',
    },
  },
})

export default attachmentConfig

declare module '@jrmc/adonis-attachment' {
  interface AttachmentVariants extends InferConverters<typeof attachmentConfig> {}
}
