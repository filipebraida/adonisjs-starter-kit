import React from 'react'

import { cn } from '@workspace/ui/lib/utils'

/**
 * How wide a page's content is. The shell already gives the side gutter and
 * the maximum width; a page only picks one of these, never its own padding.
 * - `full`: the shell's width (lists, the dashboard).
 * - `column`: a centred column (settings, a long form, the help index).
 * - `reading`: a help article's three columns.
 */
const SIZES = {
  full: 'w-full',
  column: 'mx-auto w-full max-w-4xl',
  reading: 'w-full',
} as const

interface MainProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof SIZES
}

/** A page's content. A `div`: the shell is already the page's `<main>`. */
export function Main({ size = 'full', className, ...props }: MainProps) {
  return <div className={cn('py-6', SIZES[size], className)} {...props} />
}
