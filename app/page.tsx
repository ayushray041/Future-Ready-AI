import { ResponsiveLayout } from '@/components/responsive-layout'
import { WelcomeHero } from '@/components/welcome-hero'
import { DashboardCards } from '@/components/dashboard-cards'
import { CareerRoadmap } from '@/components/career-roadmap'
import { OpportunityEngine } from '@/components/opportunity-engine'
import { AnalyticsSection } from '@/components/analytics-section'

export default function Home() {
  return (
    <ResponsiveLayout>
      {/* Welcome Hero */}
      <WelcomeHero />

      {/* Dashboard Cards Grid */}
      <DashboardCards />

      {/* Career Roadmap */}
      <CareerRoadmap />

      {/* Opportunity Engine */}
      <OpportunityEngine />

      {/* Analytics & Growth */}
      <AnalyticsSection />
    </ResponsiveLayout>
  )
}
