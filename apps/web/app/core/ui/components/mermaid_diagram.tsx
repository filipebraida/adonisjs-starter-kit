import type { MermaidConfig } from 'mermaid'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

import { useTranslation } from '#core/ui/hooks/use_translation'

/**
 * Mermaid's colors from the app's tokens, as `read` gives their values (the
 * page's computed style): nodes on the muted surface, lines in the border
 * color, text in the foreground. Mermaid cannot read CSS variables itself.
 */
export function mermaidTheme(read: (token: string) => string): MermaidConfig['themeVariables'] {
  const foreground = read('--foreground')
  const background = read('--background')
  const muted = read('--muted')
  return {
    background,
    primaryColor: muted,
    primaryTextColor: foreground,
    primaryBorderColor: read('--primary'),
    secondaryColor: muted,
    tertiaryColor: background,
    lineColor: read('--border'),
    textColor: foreground,
  }
}

type Drawing = { state: 'pending' } | { state: 'drawn'; svg: string } | { state: 'failed' }

/**
 * A token's color as `rgb()`: mermaid's color parser rejects modern CSS colors
 * such as the starter's `oklch()` tokens, and fails the whole drawing. The
 * browser converts it by painting one pixel.
 */
function rgbOf(color: string): string {
  const context = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!context || !color) return color
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

/** Whether the page is in its dark theme (the `dark` class of `<html>`); `null` on the server. */
function readDark(): boolean {
  return document.documentElement.classList.contains('dark')
}

function subscribeToTheme(change: () => void) {
  const observer = new MutationObserver(change)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

/**
 * Mermaid serializes its SVG as HTML: a non-breaking space comes out as `&nbsp;`, which XML does
 * not define. The numeric form reads the same in both.
 */
export function xmlSafeSvg(svg: string): string {
  return svg.replaceAll('&nbsp;', '&#160;')
}

/** An SVG document's root, parsed (never set as HTML) and adopted by the page; `null` when it does not parse. */
function svgElement(svg: string): Element | null {
  const parsed = new DOMParser().parseFromString(xmlSafeSvg(svg), 'image/svg+xml')
  if (parsed.querySelector('parsererror')) return null
  return document.importNode(parsed.documentElement, true)
}

/**
 * A ```mermaid block of a Markdown text, drawn as a diagram. The library loads
 * only when a page has one; it runs in its strict mode (no scripts, no HTML in
 * labels), and its SVG, the sanitized output of that mode, is parsed as SVG and never set as
 * HTML. Until drawn, and
 * when the code does not parse, the code shows instead. The diagram is drawn
 * again when the theme changes.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const { t } = useTranslation()
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const [drawing, setDrawing] = useState<Drawing>({ state: 'pending' })
  const dark = useSyncExternalStore<boolean | null>(subscribeToTheme, readDark, () => null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dark === null) return
    let current = true
    const style = getComputedStyle(document.documentElement)
    const draw = async () => {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: style.getPropertyValue('--font-sans'),
        themeVariables: mermaidTheme((token) => rgbOf(style.getPropertyValue(token).trim())),
      })
      const { svg } = await mermaid.render(id, code)
      // A drawing the page cannot read shows its code, as one mermaid could not draw.
      if (!svgElement(svg)) throw new Error('The diagram does not parse as SVG.')
      return svg
    }
    draw().then(
      (svg) => current && setDrawing({ state: 'drawn', svg }),
      () => current && setDrawing({ state: 'failed' })
    )
    return () => {
      current = false
    }
  }, [code, dark, id])

  useEffect(() => {
    if (drawing.state !== 'drawn') return
    const svg = svgElement(drawing.svg)
    if (svg) boxRef.current?.replaceChildren(svg)
  }, [drawing])

  if (drawing.state === 'drawn') {
    return (
      <div
        ref={boxRef}
        data-mermaid="drawn"
        className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      />
    )
  }
  return (
    <div data-mermaid={drawing.state} className="flex flex-col gap-1">
      {drawing.state === 'failed' && (
        <p className="text-muted-foreground text-xs">{t('core.markdown.mermaidFailed')}</p>
      )}
      <div className="bg-muted border-border overflow-x-auto rounded-lg border px-3 py-2.5 font-mono text-xs whitespace-pre">
        {code}
      </div>
    </div>
  )
}
