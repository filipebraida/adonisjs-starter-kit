import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { test } from '@japa/runner'

import HelpCatalog from '#help/services/help_catalog'

const FIXTURES = new URL('../../fixtures/app', import.meta.url).pathname
// A space whose index says its order is a word.
const BROKEN = new URL('../../fixtures/broken', import.meta.url).pathname

const RESERVED = new URL('../../fixtures/reserved', import.meta.url).pathname

async function guide() {
  const space = await HelpCatalog.at(FIXTURES).space('guide')
  if (!space) throw new Error('the fixture space is missing')
  return space
}

test.group('Help catalog', () => {
  test("finds the spaces under each module's help folder", async ({ assert }) => {
    const spaces = await HelpCatalog.at(FIXTURES).spaces()

    assert.deepEqual(
      spaces.map((space) => space.slug),
      ['guide', 'vault']
    )
    assert.isTrue(spaces[0].dir.endsWith(join('demo', 'help', 'guide')))
    assert.deepEqual(spaces[0].title, { pt: 'Guia', en: 'Guide' })
  })

  test('an index that breaks the schema is refused', async ({ assert }) => {
    await assert.rejects(() => HelpCatalog.at(BROKEN).spaces())
  })

  test("an article cannot be named images: that path serves the space's pictures", async ({
    assert,
  }) => {
    await assert.rejects(() => HelpCatalog.at(RESERVED).spaces())
  })

  test('navigation, the opening article and neighbours follow what the reader may read', async ({
    assert,
  }) => {
    const space = await guide()
    const none = new Set<string>()
    const runs = new Set(['users.view_list'])

    assert.deepEqual(
      HelpCatalog.navigation(space, none).flatMap((category) =>
        category.articles.map((article) => article.slug)
      ),
      ['start']
    )
    assert.equal(HelpCatalog.opening(space, none)?.slug, 'start')
    assert.isNull(HelpCatalog.neighbours(space, 'start', none).next)
    assert.equal(HelpCatalog.neighbours(space, 'start', runs).next?.slug, 'locked')
    assert.equal(HelpCatalog.neighbours(space, 'locked', runs).previous?.slug, 'start')
  })

  test('canRead hides an article whose capability the reader lacks', async ({ assert }) => {
    const space = await guide()
    const locked = space.articles.find((article) => article.slug === 'locked')!

    assert.isFalse(HelpCatalog.canRead(locked, new Set()))
    assert.isTrue(HelpCatalog.canRead(locked, new Set(['users.view_list'])))
  })

  test('an image name outside the folder is refused', async ({ assert }) => {
    const space = await guide()

    for (const name of ['../index.json', 'a/b.png', 'x.svg', '.png', 'index.json']) {
      assert.isNull(HelpCatalog.imageOf(space, name), name)
    }
    assert.equal(HelpCatalog.imageOf(space, 'shot.png'), join(space.dir, 'images', 'shot.png'))
  })

  test('each article has a file per language', async ({ assert }) => {
    const space = await guide()
    const start = space.articles.find((article) => article.slug === 'start')!

    assert.equal(HelpCatalog.fileOf(space, start, 'en'), join(space.dir, 'en', 'start.md'))
  })

  test('capabilities lists each cited capability once', async ({ assert }) => {
    assert.deepEqual(await HelpCatalog.at(FIXTURES).capabilities(), ['users.view_list'])
  })

  test('outside production, a space added after the first read shows up', async ({
    assert,
    fs,
  }) => {
    const copy = (space: string) =>
      Promise.all(
        ['index.json', 'en/start.md', 'pt/start.md', 'en/secret.md', 'pt/secret.md'].map((file) => {
          const from = join(FIXTURES, 'app/demo/help', space, file)
          return existsSync(from)
            ? fs.create(join('app/demo/help', space, file), readFileSync(from, 'utf8'))
            : null
        })
      )
    await copy('guide')
    const catalog = HelpCatalog.at(fs.basePath)
    assert.lengthOf(await catalog.spaces(), 1)

    await copy('vault')
    const spaces = await catalog.spaces()

    assert.deepEqual(
      spaces.map((space) => space.slug),
      ['guide', 'vault']
    )
  })
})
