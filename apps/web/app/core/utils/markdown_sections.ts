import GithubSlugger from 'github-slugger'
import type { Heading, Root } from 'mdast'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * The sections of a Markdown document: its second-level headings, each with
 * the `id` the app's `Markdown` gives it when rendered (`rehype-slug`,
 * GitHub's algorithm). The document is parsed by the same parser the browser
 * uses, so a heading is what the renderer sees as one (inside a quote or a
 * list, underlined) and its text is the text it renders (code and
 * underscores kept). Every heading goes through one slugger in document
 * order, as the renderer does, so a repeated title gets the same suffix.
 */

export type MarkdownSection = { id: string; title: string }

export type MarkdownHeading = MarkdownSection & { level: number }

/** The deepest heading a table of contents lists. */
const OUTLINE_DEPTH = 3

const parser = unified().use(remarkParse).use(remarkGfm)

/**
 * Every heading of levels 1 to 3 with its rendered `id` and level. All six
 * levels go through the slugger, as the renderer does, so the suffix of a
 * repeated title agrees.
 */
export function markdownHeadings(markdown: string): MarkdownHeading[] {
  const tree = parser.runSync(parser.parse(markdown)) as Root
  const slugger = new GithubSlugger()
  const headings: MarkdownHeading[] = []

  visit(tree, 'heading', (node: Heading) => {
    const title = toString(node).trim()
    const id = slugger.slug(title)
    if (node.depth <= OUTLINE_DEPTH) headings.push({ id, title, level: node.depth })
  })
  return headings
}

export function markdownSections(markdown: string): MarkdownSection[] {
  return markdownHeadings(markdown)
    .filter((heading) => heading.level === 2)
    .map(({ id, title }) => ({ id, title }))
}
