'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { Check, CreditCard, Download } from 'lucide-react'

// Stripe price IDs - replace with your actual Stripe price IDs
const PRICE_IDS = {
  pro_monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  pro_yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'contact_sales',
}

export default function BillingPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false)

  useEffect(() => {
    // Handle successful checkout redirect
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      alert('Subscription activated! Welcome to Pro.')
      router.replace('/dashboard')
    }
  }, [router])

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    if (!user?.uid) {
      router.push('/login?redirect=/settings/billing')
      return
    }

    setIsLoadingCheckout(true)

    try {
      const priceId = tier === 'enterprise' 
        ? 'contact_sales' 
        : billingCycle === 'yearly' 
          ? PRICE_IDS.pro_yearly 
          : PRICE_IDS.pro_monthly

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          tier,
          userId: user.uid,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert(`Payment error: ${error}`)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoadingCheckout(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-gray-900">Starter - Free</p>
              <p className="text-sm text-gray-600">Limited to 5 AI responses/day</p>
            </div>
            <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
              Active
            </span>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
          
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pro Plan */}
            <div className="bg-white rounded-xl border-2 border-gray-900 p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-gray-900">
                  ${billingCycle === 'yearly' ? '16' : '20'}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mb-6">For professionals who need more</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Unlimited AI responses</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">All playbooks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Custom playbooks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Claude 4 + GPT-4o</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Upload documents (RAG)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">No watermarks</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('pro')}
                disabled={isLoadingCheckout}
                className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoadingCheckout ? 'Loading...' : 'Upgrade to Pro'}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">Custom</span>
              </div>
              <p className="text-gray-600 mb-6">For teams and organizations</p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Team analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Shared playbooks</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">SSO</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">CRM integrations</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Custom AI training</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Dedicated support</span>
                </li>
              </ul>

              <button
                onClick={() => handleUpgrade('enterprise')}
                className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          <p className="text-sm text-gray-600 mb-4">No payment method on file</p>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600">
            <CreditCard className="h-5 w-5" />
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  )
} 