import { readFileSync } from 'node:fs'

import app from '@adonisjs/core/services/app'
import { test } from '@japa/runner'

import { markdownSections } from '#core/utils/markdown_sections'
import { HELP_ANCHORS, helpTargetOf, type HelpAnchorKey } from '#help/enums/help_anchors'
import { HELP_LOCALES } from '#help/enums/help_locale'
import HelpCatalog from '#help/services/help_catalog'

test.group('Help anchors', () => {
  test('every anchor points at an article and section that exist, in both languages', async ({
    assert,
  }) => {
    const catalog = await app.container.make(HelpCatalog)
    for (const [key, anchor] of Object.entries(HELP_ANCHORS)) {
      const space = await catalog.space(anchor.space)
      const article = space?.articles.find((candidate) => candidate.slug === anchor.article)
      assert.exists(article, `${key} points at no article`)
      if (!space || !article || !('section' in anchor)) continue
      for (const locale of HELP_LOCALES) {
        const markdown = readFileSync(HelpCatalog.fileOf(space, article, locale), 'utf8')
        assert.include(
          markdownSections(markdown).map((section) => section.id),
          anchor.section[locale],
          `${key} (${locale}) points at no section`
        )
      }
    }
  })

  test('a screen links its article only when the reader may read it', ({ assert }) => {
    const key: HelpAnchorKey = 'users.settings_password'

    assert.isNull(helpTargetOf(key, ['account/profile'], 'pt'))
    assert.deepEqual(helpTargetOf(key, ['account/password'], 'en'), {
      space: 'account',
      article: 'password',
      section: null,
    })
  })
})
