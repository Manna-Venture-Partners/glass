'use client'

import { useState } from 'react'
import { PlaybookSelector } from '@/components/PlaybookSelector'
import { Plus, Upload, TestTube } from 'lucide-react'

export default function PlaybooksPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'upload'>('browse')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Playbooks</h1>
          <p className="text-gray-600">Manage your AI conversation templates</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Browse Templates
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Create Custom
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'browse' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How Playbooks Work</h3>
              <p className="text-sm text-blue-700 mb-4">
                Playbooks are pre-configured AI prompts that trigger during conversations. Select a playbook to 
                enable real-time suggestions for specific scenarios like sales objections, interview questions, or customer support.
              </p>
            </div>
            <PlaybookSelector />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Custom Playbook Builder</h3>
              <p className="text-sm text-blue-700 mb-4">
                Create your own playbook with custom AI prompts, triggers, and knowledge base documents.
              </p>
              <a
                href="/dashboard/playbooks/create"
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Start Building
              </a>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start Guide</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>• <strong>Define triggers:</strong> Set keywords or contexts that activate your prompts</p>
                <p>• <strong>Write guidance:</strong> Tell the AI exactly how to help during conversations</p>
                <p>• <strong>Add knowledge:</strong> Upload documents for AI context (optional)</p>
                <p>• <strong>Test & save:</strong> Preview and activate your custom playbook</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Upload className="h-16 w-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents for RAG</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Upload documents to provide context for your playbooks. The AI will use these documents to give 
              more informed responses.
            </p>
            <div className="inline-block">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                <Upload className="h-5 w-5 inline mr-2" />
                Select Files
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  )
}

