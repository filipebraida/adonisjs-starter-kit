import HeroSection from '#marketing/ui/components/hero'
import StackSection from '#marketing/ui/components/stack'
import FeatureShowcase from '#marketing/ui/components/feature_showcase'
import FeatureSection from '#marketing/ui/components/feature'
import FooterSection from '#marketing/ui/components/footer'
import HeaderSection from '#marketing/ui/components/header'
import LogosSection from '#marketing/ui/components/logos'

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderSection />

      <main className="flex-1 mx-auto w-full">
        <HeroSection />
        <StackSection />
        <div id="features">
          <FeatureShowcase />
        </div>
        <FeatureSection /> {/* Actually the 'Details' section now */}
        <LogosSection />
        <FooterSection />
      </main>
    </div>
  )
}
