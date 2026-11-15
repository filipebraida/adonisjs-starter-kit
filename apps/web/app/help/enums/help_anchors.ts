import type { HelpLocale } from '#help/enums/help_locale'

/** A section of an article, by language: a heading's id comes from its text. */
type HelpSection = Record<HelpLocale, string>

export type HelpAnchor = { space: string; article: string; section?: HelpSection }

/**
 * The screens' help points: `<module>.<point>` names the space, the article
 * and, when it says one, the section (`##`, its id in each language) a
 * screen's "?" opens. Renaming a section's heading changes its id; the anchors
 * spec says so.
 */
export const HELP_ANCHORS = {
  'users.settings_profile': { space: 'account', article: 'profile' },
  'users.settings_password': { space: 'account', article: 'password' },
  'users.settings_appearance': { space: 'account', article: 'appearance' },
  'users.settings_tokens': { space: 'account', article: 'api-tokens' },
  'users.list': { space: 'administration', article: 'users' },
  'users.activity': { space: 'administration', article: 'activity' },
} as const satisfies Record<string, HelpAnchor>

export type HelpAnchorKey = keyof typeof HELP_ANCHORS

/** Where a screen's "?" leads: `null` when the reader may not read its article (`space/article`). */
export function helpTargetOf(
  key: HelpAnchorKey,
  readable: readonly string[],
  locale: HelpLocale
): { space: string; article: string; section: string | null } | null {
  const anchor: HelpAnchor = HELP_ANCHORS[key]
  if (!readable.includes(`${anchor.space}/${anchor.article}`)) return null
  return { space: anchor.space, article: anchor.article, section: anchor.section?.[locale] ?? null }
}
