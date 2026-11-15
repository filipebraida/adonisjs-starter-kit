import { test } from '@japa/runner'

import { markdownHeadings, markdownSections } from '#core/utils/markdown_sections'

// That these ids are the ones the rendered Markdown carries is checked in the
// Markdown component's spec, which renders both.
test.group('markdownSections', () => {
  test('only second-level headings, outside code', ({ assert }) => {
    const text = ['# T', '## Um', '```md', '## não', '```', '### Sub', '## Dois'].join('\n')

    assert.deepEqual(markdownSections(text), [
      { id: 'um', title: 'Um' },
      { id: 'dois', title: 'Dois' },
    ])
  })

  test('accents stay in the id, as on GitHub, and a repeated title gets a suffix', ({ assert }) => {
    const text = ['## Senha e segurança', '## Senha e segurança'].join('\n\n')

    assert.deepEqual(markdownSections(text), [
      { id: 'senha-e-segurança', title: 'Senha e segurança' },
      { id: 'senha-e-segurança-1', title: 'Senha e segurança' },
    ])
  })

  test('titles drop code, links and emphasis', ({ assert }) => {
    const text = ['## O `code` aqui', '## Um [link](/x) e **forte**'].join('\n\n')

    assert.deepEqual(markdownSections(text), [
      { id: 'o-code-aqui', title: 'O code aqui' },
      { id: 'um-link-e-forte', title: 'Um link e forte' },
    ])
  })

  test('headings of levels 1 to 3 with their level, outside code', ({ assert }) => {
    const text = [
      '# T',
      '## Um',
      '```md',
      '## não',
      '```',
      '### Sub',
      '#### Fundo',
      '## Dois',
    ].join('\n')

    assert.deepEqual(markdownHeadings(text), [
      { id: 't', title: 'T', level: 1 },
      { id: 'um', title: 'Um', level: 2 },
      { id: 'sub', title: 'Sub', level: 3 },
      { id: 'dois', title: 'Dois', level: 2 },
    ])
  })
})
