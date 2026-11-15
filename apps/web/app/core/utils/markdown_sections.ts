import GithubSlugger from 'github-slugger'

/**
 * The sections of a Markdown document: its second-level headings, each with
 * the `id` the Hub's `Markdown` gives it when rendered (`rehype-slug`, GitHub's
 * algorithm). Every heading goes through one slugger in order, as the renderer
 * does, so a repeated title gets the same suffix in both. Fenced code is not a
 * heading.
 */

export type MarkdownSection = { id: string; title: string }

const FENCE = /^\s{0,3}(`{3,}|~{3,})/
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/

/** The text a reader sees of a heading's Markdown: no code ticks, emphasis or link targets. */
function plainText(markdown: string): string {
  return markdown
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2')
    .trim()
}

export type MarkdownHeading = MarkdownSection & { level: number }

/** The deepest heading a table of contents lists. */
const OUTLINE_DEPTH = 3

/**
 * Every heading of levels 1 to 3 with its rendered `id` and level. All six levels go
 * through the slugger, as the renderer does, so the suffix of a repeated title agrees.
 */
export function markdownHeadings(markdown: string): MarkdownHeading[] {
  const slugger = new GithubSlugger()
  const headings: MarkdownHeading[] = []
  let fence: string | null = null

  for (const line of markdown.split('\n')) {
    const opening = FENCE.exec(line)?.[1]
    if (fence) {
      if (opening && opening[0] === fence[0] && opening.length >= fence.length) fence = null
      continue
    }
    if (opening) {
      fence = opening
      continue
    }
    const heading = HEADING.exec(line)
    if (!heading) continue
    const title = plainText(heading[2])
    const id = slugger.slug(title)
    const level = heading[1].length
    if (level <= OUTLINE_DEPTH) headings.push({ id, title, level })
  }
  return headings
}

export function markdownSections(markdown: string): MarkdownSection[] {
  return markdownHeadings(markdown)
    .filter((heading) => heading.level === 2)
    .map(({ id, title }) => ({ id, title }))
}
