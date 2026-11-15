import { test } from '@japa/runner'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { Markdown } from '#core/ui/components/markdown'
import { MermaidDiagram, mermaidTheme, xmlSafeSvg } from '#core/ui/components/mermaid_diagram'
import { markdownHeadings, markdownSections } from '#core/utils/markdown_sections'

const render = (text: string, props: Omit<Parameters<typeof Markdown>[0], 'children'> = {}) =>
  renderToStaticMarkup(h(Markdown, props, text))

test.group('Markdown images', () => {
  test("an image of the app's own loads, and opens whole in a new tab", ({ assert }) => {
    const html = render('![tela](/help/account/images/x.png)')
    assert.include(html, '<img')
    assert.include(html, 'src="/help/account/images/x.png"')
    assert.include(html, 'alt="tela"')
    assert.include(html, 'href="/help/account/images/x.png" target="_blank"')
  })

  test('an image from elsewhere is a link, never loaded', ({ assert }) => {
    const html = render('![x](https://evil.example/p.png)')
    assert.notInclude(html, '<img')
    assert.include(html, 'href="https://evil.example/p.png"')
  })

  test('a protocol-relative url is not the app', ({ assert }) => {
    const html = render('![x](//evil.example/p.png)')
    assert.notInclude(html, '<img')
  })
})

test.group('Markdown links and HTML', () => {
  test('a link to a page of the app navigates in place; one elsewhere opens a tab', ({
    assert,
  }) => {
    const html = render('[usuários](/users) e [fora](https://example.com/x)')
    assert.include(html, 'href="/users"')
    assert.notInclude(html, 'href="/users" target="_blank"')
    assert.include(html, 'href="https://example.com/x" target="_blank"')
  })

  test('raw HTML is text, never markup', ({ assert }) => {
    const html = render('<script>alert(1)</script>')
    assert.notInclude(html, '<script>')
  })
})

test.group('Markdown headings', () => {
  test('the ids the server lists are the ids the browser renders', ({ assert }) => {
    const text = [
      '# Título',
      '## Senha e segurança',
      '## O `code` aqui',
      '## Repetido',
      '#### Repetido',
      '### Repetido',
      '## Um [link](/x) e **forte**',
    ].join('\n\n')
    const html = render(text, { variant: 'document' })

    for (const { id } of markdownHeadings(text)) assert.include(html, `id="${id}"`)
    assert.include(
      markdownSections(text).map((section) => section.id),
      'senha-e-segurança'
    )
  })
})

test.group('Markdown document', () => {
  test("the text variant keeps headings small, with GitHub's ids", ({ assert }) => {
    const html = render('## Olá mundo')
    assert.include(html, '<h3')
    assert.include(html, 'id="olá-mundo"')
  })

  test('the document variant draws real headings', ({ assert }) => {
    const html = render('## Olá mundo\n\n### Detalhe', { variant: 'document' })
    assert.include(html, '<h2 id="olá-mundo"')
    assert.include(html, '<h3 id="detalhe"')
  })

  test('a relative image of an article loads from its space', ({ assert }) => {
    const text = '![tela](images/x.png)'
    const html = render(text, { variant: 'document', imageBase: '/help/account/images' })
    assert.include(html, 'src="/help/account/images/x.png"')
    assert.notInclude(render(text, { variant: 'document' }), '<img')
  })
})

test.group('Markdown alerts', () => {
  test('an alert becomes a box of its kind', ({ assert }) => {
    for (const kind of ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION']) {
      const html = render(`> [!${kind}]\n> Cuidado com isso.`)
      assert.include(html, `data-alert="${kind.toLowerCase()}"`, kind)
      assert.include(html, 'Cuidado com isso.', kind)
      assert.notInclude(html, '<blockquote', kind)
      assert.notInclude(html, kind, `${kind}: the plugin's own title is replaced`)
    }
  })

  test('a plain quote stays a quote', ({ assert }) => {
    assert.include(render('> citação'), '<blockquote')
  })
})

test.group('Markdown diagrams', () => {
  test('a mermaid block is a diagram, not code', ({ assert }) => {
    const html = render('```mermaid\nflowchart LR\n  A --> B\n```')
    assert.include(html, 'data-mermaid')
    assert.notInclude(html, '<pre')
  })

  test('another block stays code', ({ assert }) => {
    assert.include(render('```ts\nconst a = 1\n```'), '<pre')
  })

  test('before drawing, the diagram shows its code', ({ assert }) => {
    const html = renderToStaticMarkup(h(MermaidDiagram, { code: 'flowchart LR\n  A --> B' }))
    assert.include(html, 'data-mermaid="pending"')
    assert.include(html, 'A --&gt; B')
  })

  test("the theme comes from the app's tokens", ({ assert }) => {
    const tokens: Record<string, string> = {
      '--foreground': '#111',
      '--background': '#fff',
      '--border': '#ddd',
      '--muted': '#eee',
      '--primary': '#36f',
    }
    const theme = mermaidTheme((token) => tokens[token] ?? '')

    assert.include(theme, {
      primaryTextColor: '#111',
      background: '#fff',
      lineColor: '#ddd',
      primaryColor: '#eee',
      primaryBorderColor: '#36f',
    })
  })
})

test.group('Mermaid SVG', () => {
  test("mermaid's HTML entities become ones an SVG parser reads", ({ assert }) => {
    assert.equal(
      xmlSafeSvg('<svg><text>a&nbsp;b &amp; c</text></svg>'),
      '<svg><text>a&#160;b &amp; c</text></svg>'
    )
  })
})
