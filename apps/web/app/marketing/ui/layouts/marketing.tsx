import React from 'react'

import FooterSection from '#marketing/ui/components/footer'
import HeaderSection from '#marketing/ui/components/header'

export interface MarketingLayoutProps extends React.PropsWithChildren {}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSection />

      <main className="flex-1 mx-auto w-full">{children}</main>

      <FooterSection />
    </div>
  )
}
