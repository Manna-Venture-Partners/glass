'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { Clock, Zap, MessageSquare, Download, Plus, TrendingUp, Activity } from 'lucide-react'

export default function Dashboard() {
  const { user, isLoading, mode } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && mode === 'local') {
      router.push('/settings')
    }
  }, [isLoading, mode, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.display_name}</p>
        </div>

        {/* License Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">License Status</h2>
              <p className="text-sm text-gray-600">Starter Plan - Free</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
              Active
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Zap className="h-6 w-6" />}
            label="AI Credits Used"
            value="0 / 5"
            subtitle="Today"
            color="blue"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Meeting Hours"
            value="0.0"
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="Meetings"
            value="0"
            subtitle="Total"
            color="purple"
          />
        </div>

        {/* Recent Meetings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Meetings</h2>
            <button className="text-sm text-gray-600 hover:text-gray-900">
              View All →
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No meetings yet</p>
            <p className="text-sm">Start a meeting to see activity here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <QuickActionCard
            icon={<Download className="h-6 w-6" />}
            title="Download Desktop App"
            description="Get Glass for macOS and Windows"
            action="Download"
            href="/download"
          />
          <QuickActionCard
            icon={<Plus className="h-6 w-6" />}
            title="Create Playbook"
            description="Build custom AI prompts for your use case"
            action="Create"
            href="/dashboard/playbooks"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, subtitle, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  )
}

function QuickActionCard({ icon, title, description, action, href }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <a
            href={href}
            className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-gray-600"
          >
            {action} →
          </a>
        </div>
      </div>
    </div>
  )
}

