import app from '@adonisjs/core/services/app'

/**
 * The attachment makes variants in a queue, after the file is saved and
 * outside the request: let loose, the job would run after the test ended and
 * its transaction was rolled back. The suite skips the scheduling; a spec that
 * needs a variant calls `regenerateVariants()` on the relation itself.
 */
export async function holdVariants() {
  const attachments = await app.container.make('jrmc.attachment')
  attachments.scheduleVariantGeneration = async () => {}
}
