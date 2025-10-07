import { HeroSection } from "@/components/HeroSection"
import { FeaturesSection } from "@/components/FeaturesSection"
import { HowItWorksSection } from "@/components/HowItWorksSection"
import { TestimonialsSection } from "@/components/TestimonialsSection"
import { PricingSection } from "@/components/PricingSection"
import { FAQSection } from "@/components/FAQSection"
import { CTASection } from "@/components/CTASection"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import "./homepage.css"

export default function Home() {
  return (
    <div className="homepage min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
