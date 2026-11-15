import { Link } from '@inertiajs/react'
import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkAlert from 'remark-github-blockquote-alert'

import { cn } from '@workspace/ui/lib/utils'

import { MermaidDiagram } from '#core/ui/components/mermaid_diagram'
import { useTranslation } from '#core/ui/hooks/use_translation'

const CODE = 'bg-muted rounded px-1 py-0.5 font-mono text-xs'

/**
 * Markdown, rendered as the app's text: paragraphs, lists,
 * emphasis, inline code and fenced blocks, links, quotes and tables (GFM).
 * Raw HTML is not rendered; a link inside the app (`/…`) is an Inertia
 * visit, any other opens in a new tab.
 */
type AlertKind = 'note' | 'tip' | 'important' | 'warning' | 'caution'

/** Each GitHub alert kind: its icon and the role colors of the app. */
const ALERTS: Record<AlertKind, { icon: LucideIcon; className: string }> = {
  note: { icon: Info, className: 'border-primary/30 bg-primary/5 [&>svg]:text-primary' },
  tip: { icon: Lightbulb, className: 'border-success/40 bg-success/10 [&>svg]:text-success' },
  important: {
    icon: MessageSquareWarning,
    className: 'border-primary/30 bg-primary/5 [&>svg]:text-primary',
  },
  warning: {
    icon: TriangleAlert,
    className: 'border-warning/40 bg-warning/10 [&>svg]:text-warning',
  },
  caution: {
    icon: OctagonAlert,
    className: 'border-destructive/40 bg-destructive/10 [&>svg]:text-destructive',
  },
}

const ALERT_CLASS = /\bmarkdown-alert-(note|tip|important|warning|caution)\b/
const ALERT_TITLE = 'markdown-alert-title'

/**
 * A GitHub alert (`> [!WARNING]`), as `remark-github-blockquote-alert` marks it: a box of its
 * kind with the app's icon and the kind's name translated (the plugin's own title is not drawn).
 */
function Alert({ className, children }: { className?: string; children?: ReactNode }) {
  const { t } = useTranslation()
  const kind = ALERT_CLASS.exec(className ?? '')?.[1] as AlertKind | undefined
  if (!kind) return <aside className={className}>{children}</aside>
  const { icon: Icon, className: colors } = ALERTS[kind]
  return (
    <aside
      data-alert={kind}
      className={cn('grid grid-cols-[auto_1fr] gap-x-2 rounded-md border px-3 py-2', colors)}
    >
      <Icon aria-hidden className="mt-0.5 size-4" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-semibold">{t(`core.markdown.alert.${kind}`)}</p>
        {children}
      </div>
    </aside>
  )
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: { className?: unknown }
  children?: HastNode[]
}

/** The code of a ```mermaid block (`pre` > `code.language-mermaid`); `null` for any other `pre`. */
function mermaidOf(pre: HastNode | undefined): string | null {
  const code = pre?.children?.find((child) => child.type === 'element')
  const classes = code?.properties?.className
  if (
    code?.tagName !== 'code' ||
    !Array.isArray(classes) ||
    !classes.includes('language-mermaid')
  ) {
    return null
  }
  return (code.children ?? []).map((child) => child.value ?? '').join('')
}

/**
 * A link of the text. One inside the app is an Inertia visit, unless it is a
 * file (a help image): Inertia would show its bytes as a failed page, so a
 * file, like a link elsewhere, opens in a tab.
 */
function TextLink({ href, children }: { href?: string; children?: ReactNode }) {
  if (href?.startsWith('/') && !href.startsWith('//') && !isFileHref(href)) {
    return (
      <Link href={href} className="text-primary underline">
        {children}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-primary underline">
      {children}
    </a>
  )
}

const COMPONENTS: Components = {
  // The alert plugin's own title: the alert box draws its translated one instead.
  p: ({ children, className }) =>
    className === ALERT_TITLE ? null : <p className="leading-relaxed">{children}</p>,
  aside: ({ children, className }) => <Alert className={className}>{children}</Alert>,
  h1: ({ children, id }) => (
    <h3 id={id} className="text-base font-semibold">
      {children}
    </h3>
  ),
  h2: ({ children, id }) => (
    <h3 id={id} className="text-base font-semibold">
      {children}
    </h3>
  ),
  h3: ({ children, id }) => (
    <h4 id={id} className="font-semibold">
      {children}
    </h4>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="font-semibold">
      {children}
    </h4>
  ),
  ul: ({ children }) => <ul className="flex list-disc flex-col gap-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="flex list-decimal flex-col gap-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed [&>ul]:mt-1 [&>ol]:mt-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => <TextLink href={href}>{children}</TextLink>,
  blockquote: ({ children }) => (
    <blockquote className="border-border text-muted-foreground border-l-2 pl-3">
      {children}
    </blockquote>
  ),
  pre: ({ children, node }) => {
    const diagram = mermaidOf(node)
    if (diagram !== null) return <MermaidDiagram code={diagram} />
    return (
      <pre className="bg-muted border-border overflow-x-auto rounded-lg border px-3 py-2.5 font-mono text-xs [&>code]:bg-transparent [&>code]:p-0">
        {children}
      </pre>
    )
  },
  code: ({ children, className }) => <code className={cn(CODE, className)}>{children}</code>,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="text-xs w-full border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-border border-b px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border-border border-b px-2 py-1">{children}</td>,
  hr: () => <hr className="border-border" />,
  img: ({ src, alt }) => <TextImage src={src} alt={alt} />,
}

/** Whether an internal `href` is a file the app serves (a help image), not a page. */
function isFileHref(href: string): boolean {
  return /\/images\//.test(href)
}

/**
 * Only the app's own images load (their routes authorize who sees them), each
 * opening whole in a tab; any other is a link, so reading a text never calls a
 * server its writer chose.
 */
function TextImage({ src, alt }: { src?: string; alt?: string }) {
  return typeof src === 'string' && src.startsWith('/') && !src.startsWith('//') ? (
    <a href={src} target="_blank" rel="noreferrer">
      <img
        src={src}
        alt={alt ?? ''}
        loading="lazy"
        className="border-border h-auto max-w-full rounded-md border"
      />
    </a>
  ) : (
    <a href={src} target="_blank" rel="noreferrer" className="text-primary underline">
      {alt || src}
    </a>
  )
}

const ARTICLE_IMAGE = /^images\/[^/]+$/

/**
 * A document's headings are the page's own (`h2`, `h3`), anchored by their ids; an image
 * `images/<file>` of a help article loads from its space (`imageBase`).
 */
function documentComponents(imageBase?: string): Components {
  const image = (src?: string) =>
    imageBase && src && ARTICLE_IMAGE.test(src)
      ? `${imageBase}/${src.slice('images/'.length)}`
      : src
  return {
    ...COMPONENTS,
    h1: ({ children, id }) => (
      <h2 id={id} className="mt-4 scroll-mt-4 text-lg font-semibold first:mt-0">
        {children}
      </h2>
    ),
    h2: ({ children, id }) => (
      <h2 id={id} className="mt-4 scroll-mt-4 text-lg font-semibold first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3 id={id} className="mt-2 scroll-mt-4 text-base font-semibold">
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4 id={id} className="scroll-mt-4 font-semibold">
        {children}
      </h4>
    ),
    img: ({ src, alt }) => <TextImage src={image(src)} alt={alt} />,
  }
}

const REHYPE_PLUGINS = [rehypeSlug]

const ALERTS_PLUGIN: [typeof remarkAlert, { tagName: string }] = [remarkAlert, { tagName: 'aside' }]

const REMARK_PLUGINS = [remarkGfm, ALERTS_PLUGIN]

/**
 * A Markdown text. `text` (the default) keeps its headings small; `document`
 * is a page of its own (a help article): real headings, and its relative
 * images from `imageBase`. Headings carry GitHub's ids in both, so a
 * `#section` link works here as on GitHub (`markdownSections` gives the same
 * ids on the server).
 */
export function Markdown({
  children,
  className,
  variant = 'text',
  imageBase,
}: {
  children: string
  className?: string
  variant?: 'text' | 'document'
  imageBase?: string
}) {
  const components = useMemo(
    () => (variant === 'document' ? documentComponents(imageBase) : COMPONENTS),
    [variant, imageBase]
  )
  return (
    <div className={cn('flex min-w-0 flex-col gap-2 text-sm break-words', className)}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
