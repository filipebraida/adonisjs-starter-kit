import { createContext, use, useCallback, useMemo, useState } from 'react'
import { getCookie, setCookie } from '#common/ui/utils/cookie_helper'

export type Collapsible = 'offcanvas' | 'icon' | 'none'
export type Variant = 'inset' | 'sidebar' | 'floating'
export type Layout = 'header' | 'sidebar'

// Cookie constants following the pattern from sidebar.tsx
const LAYOUT_COLLAPSIBLE_COOKIE_NAME = 'layout_collapsible'
const LAYOUT_VARIANT_COOKIE_NAME = 'layout_variant'
const LAYOUT_STYLE_COOKIE_NAME = 'layout_style'
const LAYOUT_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Default values
const DEFAULT_VARIANT = 'inset'
const DEFAULT_COLLAPSIBLE = 'icon'
const DEFAULT_LAYOUT = 'sidebar'

type LayoutContextType = {
  resetLayout: () => void

  defaultCollapsible: Collapsible
  collapsible: Collapsible
  setCollapsible: (collapsible: Collapsible) => void

  defaultVariant: Variant
  variant: Variant
  setVariant: (variant: Variant) => void

  defaultLayout: Layout
  layout: Layout
  setLayout: (layout: Layout) => void
}

const LayoutContext = createContext<LayoutContextType | null>(null)

type LayoutProviderProps = {
  children: React.ReactNode
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [collapsible, _setCollapsible] = useState<Collapsible>(() => {
    const saved = getCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME)
    return (saved as Collapsible) || DEFAULT_COLLAPSIBLE
  })

  const [variant, _setVariant] = useState<Variant>(() => {
    const saved = getCookie(LAYOUT_VARIANT_COOKIE_NAME)
    return (saved as Variant) || DEFAULT_VARIANT
  })

  const [layout, _setLayout] = useState<Layout>(() => {
    const saved = getCookie(LAYOUT_STYLE_COOKIE_NAME)
    return (saved as Layout) || DEFAULT_LAYOUT
  })

  const setCollapsible = useCallback((next: Collapsible) => {
    _setCollapsible(next)
    setCookie(LAYOUT_COLLAPSIBLE_COOKIE_NAME, next, LAYOUT_COOKIE_MAX_AGE)
  }, [])

  const setVariant = useCallback((next: Variant) => {
    _setVariant(next)
    setCookie(LAYOUT_VARIANT_COOKIE_NAME, next, LAYOUT_COOKIE_MAX_AGE)
  }, [])

  const setLayout = useCallback((next: Layout) => {
    _setLayout(next)
    setCookie(LAYOUT_STYLE_COOKIE_NAME, next, LAYOUT_COOKIE_MAX_AGE)
  }, [])

  const resetLayout = useCallback(() => {
    setCollapsible(DEFAULT_COLLAPSIBLE)
    setVariant(DEFAULT_VARIANT)
    setLayout(DEFAULT_LAYOUT)
  }, [setCollapsible, setVariant, setLayout])

  const contextValue = useMemo<LayoutContextType>(
    () => ({
      resetLayout,
      defaultCollapsible: DEFAULT_COLLAPSIBLE,
      collapsible,
      setCollapsible,
      defaultVariant: DEFAULT_VARIANT,
      variant,
      setVariant,
      defaultLayout: DEFAULT_LAYOUT,
      layout,
      setLayout,
    }),
    [collapsible, variant, layout, setCollapsible, setVariant, setLayout, resetLayout]
  )

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const context = use(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
