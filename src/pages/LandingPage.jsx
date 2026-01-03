/**
 * [INPUT]: 依赖 @/components/landing 的所有 Section 组件, 依赖 @/components/Header 的 Header, 依赖 @/components/Footer 的 Footer
 * [OUTPUT]: 导出 LandingPage 完整页面
 * [POS]: pages 层落地页,组合所有 sections 形成完整转化漏斗
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Hero } from "@/components/landing/Hero"
import { LogoBar } from "@/components/landing/LogoBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Testimonials } from "@/components/landing/Testimonials"
import { Pricing } from "@/components/landing/Pricing"
import { FAQ } from "@/components/landing/FAQ"
import { FinalCTA } from "@/components/landing/FinalCTA"

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        {/* Hero - Above the Fold */}
        <Hero />

        {/* Logo Bar - Social Proof */}
        <LogoBar />

        {/* Problem Section - Pain Points */}
        <ProblemSection />

        {/* Features Section - Solution */}
        <FeaturesSection />

        {/* How It Works - Process */}
        <HowItWorks />

        {/* Testimonials - Social Proof */}
        <Testimonials />

        {/* Pricing - Offer */}
        <Pricing />

        {/* FAQ - Objections */}
        <FAQ />

        {/* Final CTA - Action */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  )
}

// Default export for convenience
export default LandingPage
