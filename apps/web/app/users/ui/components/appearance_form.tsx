import { type SVGProps } from 'react'
import { Item, Root as Radio } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { useTheme } from '@workspace/ui/components/theme-provider'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { IconThemeDark, IconThemeLight, IconThemeSystem } from '#common/ui/icons/index'

export function AppearanceForm() {
  return (
    <div className="space-y-8">
      <ThemeConfig />
    </div>
  )
}

function SectionTitle({
  title,
  description,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  description?: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-2', className)}>
      <div className="space-y-1">
        <h3 className="font-semibold leading-none">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {showReset && onReset && (
        <Button size="icon" variant="ghost" className="size-8 rounded-full" onClick={onReset}>
          <RotateCcw className="size-4" />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
}) {
  return (
    <Item
      value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px] ring-border',
          'group-data-[state=checked]:shadow-2xl group-data-[state=checked]:ring-primary',
          'group-focus-visible:ring-2'
        )}
        role="img"
        aria-hidden="false"
        aria-label={`${item.label} option preview`}
      >
        <CircleCheck
          className={cn(
            'size-6 fill-primary stroke-background',
            'group-data-[state=unchecked]:hidden',
            'absolute top-0 right-0 translate-x-1/2 -translate-y-1/2'
          )}
          aria-hidden="true"
        />
        <item.icon
          className={cn(
            !isTheme &&
              'fill-primary stroke-primary group-data-[state=unchecked]:fill-muted-foreground group-data-[state=unchecked]:stroke-muted-foreground'
          )}
          aria-hidden="true"
        />
      </div>
      <div className="mt-2 text-xs font-medium" id={`${item.value}-description`} aria-live="polite">
        {item.label}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title="Theme"
        description="Select the theme for the dashboard."
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select theme preference"
        aria-describedby="theme-description"
      >
        {[
          {
            value: 'system',
            label: 'System',
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: 'Light',
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: 'Dark',
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id="theme-description" className="sr-only">
        Choose between system preference, light mode, or dark mode
      </div>
    </div>
  )
}
