import { Check } from 'lucide-react'
import Link from 'next/link'

interface Tier {
  name: string
  price: string
  description?: string
  features: string[]
  cta: string
  href?: string
  highlighted?: boolean
  popular?: boolean
}

interface PricingTableProps {
  tiers?: Tier[]
}

export default function PricingTable({ tiers }: PricingTableProps) {
  const defaultPlans: Tier[] = tiers || [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for trying Glass',
      features: [
        '5 AI responses/day',
        '2 generic playbooks',
        'Basic meeting notes',
        'GPT-4o-mini model',
        'Screen capture',
        'Audio transcription',
      ],
      cta: 'Get Started',
      href: '/download',
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$20',
      description: 'For professionals who need more',
      features: [
        'Unlimited AI responses',
        'All playbooks',
        'Custom playbooks',
        'Claude 4 + GPT-4o',
        'Upload documents (RAG)',
        'Priority support',
        'No watermarks',
      ],
      cta: 'Start Free Trial',
      href: '#',
      highlighted: true,
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team analytics',
        'Shared playbooks',
        'SSO',
        'CRM integrations',
        'Custom AI training',
        'Dedicated support',
      ],
      cta: 'Contact Sales',
      href: '/contact',
      highlighted: false
    }
  ]

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {defaultPlans.map((plan, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl p-8 border-2 transition-all relative ${
            plan.highlighted || plan.popular
              ? 'border-gray-900 shadow-xl scale-105'
              : 'border-gray-200 hover:shadow-lg'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="flex items-baseline mb-2">
              <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
              {plan.price !== 'Custom' && plan.price !== 'Free' && (
                <span className="text-gray-600 ml-2">/month</span>
              )}
            </div>
            {plan.description && (
              <p className="text-gray-600 text-sm">{plan.description}</p>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={plan.href || '#'}
            className={`block w-full py-3 px-6 rounded-lg text-center font-semibold transition-all ${
              plan.highlighted || plan.popular
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {plan.cta}
          </Link>
        </div>
      ))}
    </div>
  )
}

