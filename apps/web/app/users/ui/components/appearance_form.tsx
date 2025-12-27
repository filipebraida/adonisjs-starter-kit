import { type SVGProps } from 'react'
import { Item, Root as Radio } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { useDirection } from '#common/ui/context/direction_provider'
import { useLayout } from '#common/ui/context/layout_provider'
import { useTheme } from '@workspace/ui/components/theme-provider'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { useSidebar } from '@workspace/ui/components/sidebar'
import {
  IconDir,
  IconLayoutCompact,
  IconLayoutDefault,
  IconLayoutFull,
  IconSidebarFloating,
  IconSidebarInset,
  IconSidebarSidebar,
  IconThemeDark,
  IconThemeLight,
  IconThemeSystem,
} from '#common/ui/icons/index'

export function AppearanceForm() {
  return (
    <div className="space-y-8">
      <ThemeConfig />
      <LayoutModeConfig />
      <SidebarConfig />
      <SidebarLayoutConfig />
      <DirConfig />
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

function LayoutModeConfig() {
  const { defaultLayout, layout, setLayout } = useLayout()

  return (
    <div>
      <SectionTitle
        title="Layout"
        description="Choose between Header or Sidebar layout."
        showReset={defaultLayout !== layout}
        onReset={() => setLayout(defaultLayout)}
      />
      <Radio
        value={layout}
        onValueChange={(v) => setLayout(v as 'header' | 'sidebar')}
        className="grid w-full grid-cols-3 gap-4"
        aria-label="Select layout mode"
      >
        {[
          {
            value: 'sidebar',
            label: 'Sidebar',
            icon: IconLayoutDefault,
          },
          {
            value: 'header',
            label: 'Header',
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant, layout } = useLayout()

  if (layout !== 'sidebar') return null

  return (
    <div>
      <SectionTitle
        title="Sidebar"
        description="Choose how the sidebar should appear."
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className="grid w-full grid-cols-3 gap-4"
        aria-label="Select sidebar style"
        aria-describedby="sidebar-description"
      >
        {[
          {
            value: 'inset',
            label: 'Inset',
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: 'Floating',
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: 'Sidebar',
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="sidebar-description" className="sr-only">
        Choose between inset, floating, or standard sidebar layout
      </div>
    </div>
  )
}

// Custom hook to safely use sidebar
function useSafeSidebar() {
  try {
    return useSidebar()
  } catch {
    return { open: true, setOpen: () => {} }
  }
}

function SidebarLayoutConfig() {
  const { setOpen, open } = useSafeSidebar()
  const { defaultCollapsible, collapsible, setCollapsible, layout } = useLayout()

  if (layout !== 'sidebar') return null

  const radioState = open ? 'default' : collapsible

  return (
    <div>
      <SectionTitle
        title="Sidebar Layout"
        description="Choose the sidebar collapsed state."
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as 'offcanvas' | 'icon' | 'none')
        }}
        className="grid w-full grid-cols-3 gap-4"
        aria-label="Select sidebar layout state"
      >
        {[
          {
            value: 'default',
            label: 'Default',
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: 'Compact',
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: 'Offcanvas',
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
    </div>
  )
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  return (
    <div>
      <SectionTitle
        title="Direction"
        description="Set the text direction for the dashboard."
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
      />
      <Radio
        value={dir}
        onValueChange={setDir}
        className="grid w-full max-w-md grid-cols-3 gap-4"
        aria-label="Select site direction"
        aria-describedby="direction-description"
      >
        {[
          {
            value: 'ltr',
            label: 'Left to Right',
            icon: (props: SVGProps<SVGSVGElement>) => <IconDir dir="ltr" {...props} />,
          },
          {
            value: 'rtl',
            label: 'Right to Left',
            icon: (props: SVGProps<SVGSVGElement>) => <IconDir dir="rtl" {...props} />,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} />
        ))}
      </Radio>
      <div id="direction-description" className="sr-only">
        Choose between left-to-right or right-to-left site direction
      </div>
    </div>
  )
}
