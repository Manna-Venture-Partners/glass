'use client'

import { useState } from 'react'
import { Search, Download, Calendar, Clock, User } from 'lucide-react'

export default function MeetingsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with real data from IPC
  const meetings = []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meeting History</h1>
          <p className="text-gray-600">View and manage your past conversations</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <button className="bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-lg font-medium text-gray-700 transition-colors">
              <Download className="h-5 w-5 inline mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm">
            <option>All Types</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-sm">
            <option>All Time</option>
          </select>
        </div>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No meetings yet</h2>
            <p className="text-gray-600 mb-8">
              Start using Glass to record meetings and they'll appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} />
            ))}
          </div>
        )}

        {/* Analytics Section */}
        {meetings.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <AnalyticsCard
              icon={<Clock />}
              label="Total Hours"
              value="0.0"
            />
            <AnalyticsCard
              icon={<MessageSquare />}
              label="Messages"
              value="0"
            />
            <AnalyticsCard
              icon={<TrendingUp />}
              label="Questions Asked"
              value="0"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function MeetingCard({ meeting }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {meeting.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {meeting.duration}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-gray-600 hover:text-gray-900">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function AnalyticsCard({ icon, label, value }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

