import i18nManager from '@adonisjs/i18n/services/main'
import { test } from '@japa/runner'

test.group('Translations', () => {
  // The keys are typed from `en`, so a key missing there fails the typecheck;
  // this catches the other direction, a key `en` has that a locale forgot.
  test('every locale has the same keys as the default locale', async ({ assert }) => {
    await i18nManager.loadTranslations()
    const translations = i18nManager.getTranslations()
    const defaultLocale = i18nManager.defaultLocale
    const expected = Object.keys(translations[defaultLocale] ?? {}).sort()

    for (const locale of Object.keys(translations)) {
      if (locale === defaultLocale) continue
      const actual = Object.keys(translations[locale]).sort()
      assert.deepEqual(
        { locale, missing: expected.filter((key) => !actual.includes(key)) },
        { locale, missing: [] }
      )
      assert.deepEqual(
        { locale, extra: actual.filter((key) => !expected.includes(key)) },
        { locale, extra: [] }
      )
    }
  })
})
