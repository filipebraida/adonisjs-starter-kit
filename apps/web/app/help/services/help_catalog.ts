import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import app from '@adonisjs/core/services/app'
import { Collection } from '@adonisjs/content'
import { loaders } from '@adonisjs/content/loaders'
import vine from '@vinejs/vine'

import type { HelpLocale } from '#help/enums/help_locale'
import type { HelpAccess, HelpArticle, HelpCategoryWithArticles, HelpSpace } from '#help/types/help'

const text = () =>
  vine.object({ pt: vine.string().trim().minLength(1), en: vine.string().trim().minLength(1) })
const slugField = () => vine.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const indexSchema = vine.object({
  space: vine.object({ slug: slugField(), title: text(), summary: text(), order: vine.number() }),
  categories: vine.array(vine.object({ slug: slugField(), title: text(), order: vine.number() })),
  articles: vine.array(
    vine.object({
      slug: slugField(),
      title: text(),
      summary: text(),
      category: slugField(),
      order: vine.number(),
      file: vine.string().regex(/^[a-z0-9-]+\.md$/),
      capability: vine.string().optional(),
      updatedAt: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    })
  ),
})

type Index = ReturnType<typeof createCollection>

function createCollection(dir: string) {
  return Collection.create({
    schema: indexSchema,
    loader: loaders.jsonLoader(join(dir, 'index.json')),
    cache: app.inProduction,
  })
}

/** A file an article may show: a plain name of a picture, in its space's `images/`. */
const IMAGE_NAME = /^[a-z0-9][a-z0-9-]*\.(?:png|jpe?g|webp)$/

/**
 * The help each module publishes, found by convention: every
 * `<root>/<module>/help/<space>/index.json` is a space, with its Markdown in `pt/` and `en/` and
 * its pictures in `images/`. No module registers itself, and the help imports none. Each index is
 * validated when loaded and cached in production. The cut by reader (`HelpAccess`) is applied by
 * the static helpers: an article whose capability the reader lacks is not in its navigation, its
 * neighbours or its first article.
 */
export default class HelpCatalog {
  static #loaded = new Map<string, Array<{ dir: string; collection: Index }>>()

  constructor(private root: string = app.makePath('app')) {}

  /** The catalog of another root: a test's fixtures. */
  static at(root: string): HelpCatalog {
    return new HelpCatalog(root)
  }

  #indexes() {
    let indexes = HelpCatalog.#loaded.get(this.root)
    if (!indexes) {
      indexes = HelpCatalog.discover(this.root).map((dir) => ({
        dir,
        collection: createCollection(dir),
      }))
      HelpCatalog.#loaded.set(this.root, indexes)
    }
    return indexes
  }

  private static discover(root: string): string[] {
    return readdirSync(root, { withFileTypes: true })
      .filter((module) => module.isDirectory())
      .map((module) => join(root, module.name, 'help'))
      .filter((dir) => existsSync(dir))
      .flatMap((dir) =>
        readdirSync(dir, { withFileTypes: true })
          .filter((space) => space.isDirectory())
          .map((space) => join(dir, space.name))
      )
      .filter((dir) => existsSync(join(dir, 'index.json')))
  }

  /** Every space, in its declared order. */
  async spaces(): Promise<HelpSpace[]> {
    const spaces = await Promise.all(
      this.#indexes().map(async ({ dir, collection }) => {
        const loaded = await collection.load()
        const { space, categories, articles } = loaded.all()
        return { ...space, dir, categories, articles }
      })
    )
    return spaces.toSorted((a, b) => a.order - b.order)
  }

  async space(name: string): Promise<HelpSpace | undefined> {
    const spaces = await this.spaces()
    return spaces.find((space) => space.slug === name)
  }

  /** The spaces with at least one article the reader may read. */
  async readableSpaces(access: HelpAccess): Promise<HelpSpace[]> {
    const spaces = await this.spaces()
    return spaces.filter((space) => HelpCatalog.opening(space, access))
  }

  /** The capabilities the indexes cite, each once: the only ones worth asking about. */
  async capabilities(): Promise<string[]> {
    const spaces = await this.spaces()
    return [
      ...new Set(spaces.flatMap((space) => space.articles.flatMap((a) => a.capability ?? []))),
    ]
  }

  static canRead(article: HelpArticle, access: HelpAccess): boolean {
    return !article.capability || access.has(article.capability)
  }

  /** The space's categories in order, each with the articles the reader may read; empty ones out. */
  static navigation(space: HelpSpace, access: HelpAccess): HelpCategoryWithArticles[] {
    return space.categories
      .toSorted((a, b) => a.order - b.order)
      .map((category) => ({
        ...category,
        articles: space.articles
          .filter((article) => article.category === category.slug)
          .filter((article) => HelpCatalog.canRead(article, access))
          .toSorted((a, b) => a.order - b.order),
      }))
      .filter((category) => category.articles.length > 0)
  }

  /** The order a reader goes through the space: its navigation's. */
  static #readingOrder(space: HelpSpace, access: HelpAccess): HelpArticle[] {
    return HelpCatalog.navigation(space, access).flatMap((category) => category.articles)
  }

  /** The article a space opens on: the first of the reader's navigation. */
  static opening(space: HelpSpace, access: HelpAccess): HelpArticle | undefined {
    return HelpCatalog.#readingOrder(space, access)[0]
  }

  /** The article `name` is the slug of, when the reader may read it. */
  static readable(space: HelpSpace, name: string, access: HelpAccess): HelpArticle | undefined {
    const article = space.articles.find((candidate) => candidate.slug === name)
    return article && HelpCatalog.canRead(article, access) ? article : undefined
  }

  static neighbours(
    space: HelpSpace,
    name: string,
    access: HelpAccess
  ): { previous: HelpArticle | null; next: HelpArticle | null } {
    const order = HelpCatalog.#readingOrder(space, access)
    const index = order.findIndex((article) => article.slug === name)
    return {
      previous: index > 0 ? order[index - 1] : null,
      next: index >= 0 ? (order[index + 1] ?? null) : null,
    }
  }

  static fileOf(space: HelpSpace, article: HelpArticle, locale: HelpLocale): string {
    return join(space.dir, locale, article.file)
  }

  /** The path of a picture of the space; `null` for any name that is not a plain picture name. */
  static imageOf(space: HelpSpace, name: string): string | null {
    return IMAGE_NAME.test(name) ? join(space.dir, 'images', name) : null
  }
}
