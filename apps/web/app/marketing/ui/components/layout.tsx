import React from 'react'

export interface MarketingLayoutProps extends React.PropsWithChildren {}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <main className="px-6 lg:px-0">{children}</main>
    </>
  )
}
