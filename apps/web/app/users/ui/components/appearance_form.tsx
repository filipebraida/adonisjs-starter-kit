import { type SVGProps } from 'react'
import { Item, Root as Radio } from '@radix-ui/react-radio-group'
import { CircleCheck } from 'lucide-react'

import { Field, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Segmented } from '@workspace/ui/components/segmented'
import { useTheme } from '@workspace/ui/components/theme-provider'
import { cn } from '@workspace/ui/lib/utils'

import { IconThemeDark, IconThemeLight, IconThemeSystem } from '#core/ui/components/icons/index'
import { LOCALES } from '#core/ui/components/language_switcher'
import usePageProps from '#core/ui/hooks/use_page_props'
import { useSwitchLocale } from '#core/ui/hooks/use_switch_locale'
import { useTranslation } from '#core/ui/hooks/use_translation'

/** The theme and the language apply as they are picked, so the section has no Save. */
export function AppearanceForm() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { locale } = usePageProps<{ locale: string }>()
  const switchLocale = useSwitchLocale()

  const items = [
    { value: 'system', label: t('users.appearance.theme.system'), icon: IconThemeSystem },
    { value: 'light', label: t('users.appearance.theme.light'), icon: IconThemeLight },
    { value: 'dark', label: t('users.appearance.theme.dark'), icon: IconThemeDark },
  ]

  return (
    <FieldGroup>
      <Field>
        <FieldLabel id="theme-label">{t('users.appearance.theme.label')}</FieldLabel>
        <Radio
          value={theme}
          onValueChange={setTheme}
          className="grid w-full max-w-md grid-cols-3 gap-4"
          aria-labelledby="theme-label"
        >
          {items.map((item) => (
            <ThemeOption key={item.value} item={item} />
          ))}
        </Radio>
      </Field>
      <Field>
        <FieldLabel>{t('users.appearance.language.label')}</FieldLabel>
        <Segmented
          label={t('users.appearance.language.label')}
          options={LOCALES.map(({ code, label }) => ({
            value: code,
            label: <span lang={code}>{label}</span>,
          }))}
          value={LOCALES.find(({ code }) => code === locale)?.code ?? null}
          onValueChange={switchLocale}
        />
      </Field>
    </FieldGroup>
  )
}

function ThemeOption({
  item,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
}) {
  return (
    <Item
      value={item.value}
      className="group outline-none transition duration-200 ease-in"
      aria-label={item.label}
    >
      <div
        className={cn(
          'relative rounded-sm ring-1 ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        aria-hidden="true"
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-background',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
        />
        <item.icon />
      </div>
      <div className="mt-2 text-xs font-medium">{item.label}</div>
    </Item>
  )
}
