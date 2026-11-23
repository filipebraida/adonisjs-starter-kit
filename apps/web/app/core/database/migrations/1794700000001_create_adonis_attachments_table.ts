import { BaseSchema } from '@adonisjs/lucid/schema'
import { AttachmentSchemaService } from '@jrmc/adonis-attachment/lucid'

// The tables of @jrmc/adonis-attachment: `adonis_attachments` holds each file and
// its variants, and `adonis_attachment_links` links a file to the row that owns it.
export default class extends BaseSchema {
  protected tableName = 'adonis_attachments'

  async up() {
    await new AttachmentSchemaService(this.db.getWriteClient(), {
      tableName: this.tableName,
    }).createTables()
  }

  async down() {
    await new AttachmentSchemaService(this.db.getWriteClient(), {
      tableName: this.tableName,
    }).dropTables()
  }
}
