import { Check } from 'lucide-react'

interface UseCaseCardProps {
  title: string
  stat: string
  features: string[]
}

export default function UseCaseCard({ title, stat, features }: UseCaseCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-6">{stat}</div>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

