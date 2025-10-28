'use client'

import { useState } from 'react'
import { Key, Save, Computer, Sparkles } from 'lucide-react'

export default function DashboardSettingsPage() {
  const [licenseKey, setLicenseKey] = useState('')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                defaultValue="User"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-gray-50"
                defaultValue="user@example.com"
                disabled
              />
            </div>
          </div>
          <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            <Save className="h-5 w-5 inline mr-2" />
            Save Changes
          </button>
        </div>

        {/* License Key */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">License Key</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Your License Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap">
                  <Key className="h-5 w-5 inline mr-2" />
                  Activate
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Upgrade to Pro or Enterprise by entering your license key
            </p>
          </div>
        </div>

        {/* Device Management */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Devices</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Computer className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">MacBook Pro</p>
                  <p className="text-sm text-gray-600">Last active: Just now</p>
                </div>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            All your devices are synchronized with your account
          </p>
        </div>

        {/* Model Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Model Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default LLM Provider
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>OpenAI</option>
                <option>Anthropic</option>
                <option>Google (Gemini)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Model
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                <option>GPT-4o-mini</option>
                <option>GPT-4</option>
                <option>Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>
          <button className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            <Sparkles className="h-5 w-5 inline mr-2" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

