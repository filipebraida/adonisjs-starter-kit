import { existsSync, readFileSync } from 'node:fs'

import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

import { markdownImages } from '#core/utils/markdown_sections'
import { HELP_LOCALES } from '#help/enums/help_locale'
import HelpCatalog from '#help/services/help_catalog'

async function spaces() {
  const catalog = await app.container.make(HelpCatalog)
  return catalog.spaces()
}

/** Every article's Markdown file, in each language, as `<space>/<article> (<locale>)`. */
async function articleFiles() {
  const all = await spaces()
  return all.flatMap((space) =>
    space.articles.flatMap((article) =>
      HELP_LOCALES.map((locale) => ({
        space,
        name: `${space.slug}/${article.slug} (${locale})`,
        file: HelpCatalog.fileOf(space, article, locale),
      }))
    )
  )
}

test.group('Help content', () => {
  test('the spaces of this release are there', async ({ assert }) => {
    const all = await spaces()
    assert.includeMembers(
      all.map((space) => space.slug),
      ['account', 'administration']
    )
  })

  test('every article has its Markdown in pt and en', async ({ assert }) => {
    for (const { name, file } of await articleFiles()) {
      assert.isTrue(existsSync(file), `${name} has no file`)
    }
  })

  test("every image an article cites is in its space's images folder", async ({ assert }) => {
    for (const { space, name, file } of await articleFiles()) {
      for (const image of markdownImages(readFileSync(file, 'utf8'))) {
        const path = HelpCatalog.imageOf(space, image)
        assert.isTrue(path !== null && existsSync(path), `${name} cites images/${image}`)
      }
    }
  })

  test("no slug repeats in a space, and every article's category exists", async ({ assert }) => {
    const all = await spaces()
    for (const space of all) {
      const slugs = space.articles.map((article) => article.slug)
      assert.lengthOf(new Set(slugs), slugs.length, `${space.slug} repeats a slug`)
      const categories = new Set(space.categories.map((category) => category.slug))
      const orphans = space.articles.filter((article) => !categories.has(article.category))
      assert.deepEqual(orphans, [], `${space.slug}: articles of no category`)
    }
    const spaceSlugs = all.map((space) => space.slug)
    assert.lengthOf(new Set(spaceSlugs), spaceSlugs.length, 'a space slug repeats')
  })
})
