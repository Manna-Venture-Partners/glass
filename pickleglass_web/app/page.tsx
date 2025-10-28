'use client'

import Button from '@/components/Button'
import TrustBadges from '@/components/TrustBadges'
import FeatureCard from '@/components/FeatureCard'
import UseCaseCard from '@/components/UseCaseCard'
import Testimonial from '@/components/Testimonial'
import PricingTable from '@/components/PricingTable'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="container mx-auto px-8 py-20 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Your Invisible AI Co-Pilot for Every Conversation
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Get real-time insights during sales calls, interviews, and meetings
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button href="/download">Download Free</Button>
            <Button variant="secondary" href="#demo">Watch Demo</Button>
          </div>
          <TrustBadges />
        </div>
      </section>

      {/* Demo Video */}
      <section id="demo" className="demo py-20 bg-white">
        <div className="container mx-auto px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
              See Glass in Action
            </h2>
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <p className="text-white text-lg">
                  Demo video placeholder - Upload /public/demo.mp4
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features py-20 bg-gray-50">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Why Glass?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon="👁️"
              title="Completely Invisible"
              description="Never shows in screen recordings or screenshots"
            />
            <FeatureCard 
              icon="🎯"
              title="Smart Playbooks"
              description="Pre-built scenarios for sales, interviews, support"
            />
            <FeatureCard 
              icon="⚡"
              title="Real-Time Suggestions"
              description="AI-powered responses exactly when you need them"
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="use-cases py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Who Uses Glass?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <UseCaseCard 
              title="Sales Professionals"
              stat="Close 30% more deals"
              features={['Objection handling', 'Product knowledge', 'Follow-up emails']}
            />
            <UseCaseCard 
              title="Job Seekers"
              stat="Ace every interview"
              features={['STAR responses', 'Technical help', 'Confidence boost']}
            />
            <UseCaseCard 
              title="Customer Success"
              stat="Resolve tickets 2x faster"
              features={['Instant knowledge', 'Empathy scripts', 'Escalation help']}
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="testimonials py-20 bg-gray-50">
        <div className="container mx-auto px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
              Loved by Professionals
            </h2>
            <Testimonial 
              quote="This feels like having a genius whispering in your ear"
              author="Sarah K., Sales Director"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing py-20 bg-white">
        <div className="container mx-auto px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
            Simple, Transparent Pricing
          </h2>
          <PricingTable />
        </div>
      </section>

      {/* CTA */}
      <section className="cta py-20 bg-gray-900">
        <div className="container mx-auto px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your conversations?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Download Glass for free and start your first conversation today
          </p>
          <Button href="/download" variant="secondary">
            Download Free
          </Button>
        </div>
      </section>
    </>
  )
}
