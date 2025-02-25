import LogosSection from '#marketing/ui/components/logos'
import HeroSection from '#marketing/ui/components/hero'
import FeatureSection from '#marketing/ui/components/feature'
import FooterSection from '#marketing/ui/components/footer'
import HeaderSection from '#marketing/ui/components/header'

export default function Page() {
  return (
    <>
      <div className="flex-1 mx-auto max-w-7xl px-4">
        <HeaderSection />

        <div className="flex flex-col space-y-12 pt-16 min-h-screen">
          <HeroSection />
          <div id="features">
            <FeatureSection />
          </div>
          <LogosSection />
          <FooterSection />
        </div>
      </div>
    </>
  )
}
