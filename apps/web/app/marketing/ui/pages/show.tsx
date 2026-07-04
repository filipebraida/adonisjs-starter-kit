import MarketingLayout from '#marketing/ui/components/marketing_layout'
import HeroSection from '#marketing/ui/components/hero'
import StackSection from '#marketing/ui/components/stack'
import FeatureShowcase from '#marketing/ui/components/feature_showcase'
import FeatureSection from '#marketing/ui/components/feature'
import LogosSection from '#marketing/ui/components/logos'

export default function Page() {
  return (
    <MarketingLayout>
      <HeroSection />
      <StackSection />
      <div id="features">
        <FeatureShowcase />
      </div>
      <FeatureSection />
      <LogosSection />
    </MarketingLayout>
  )
}
