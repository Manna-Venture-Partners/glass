'use client'

import { useState } from 'react'
import { Plus, X, TestTube, Save, Trash2, FileText, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Prompt {
  id: string
  triggerType: 'keyword' | 'context' | 'manual'
  triggerValue: string
  promptText: string
  priority: number
}

interface Document {
  id: string
  name: string
  type: string
  size: number
}

export default function PlaybookBuilder() {
  const router = useRouter()
  const [playbook, setPlaybook] = useState({
    name: '',
    description: '',
    category: 'sales',
  })
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [documents, setDocuments] = useState<Document[]>([])

  const addPrompt = () => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      triggerType: 'keyword',
      triggerValue: '',
      promptText: '',
      priority: 0,
    }
    setPrompts([...prompts, newPrompt])
  }

  const updatePrompt = (id: string, updates: Partial<Prompt>) => {
    setPrompts(prompts.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePrompt = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id))
  }

  const handleDocumentUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const newDoc: Document = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type || 'unknown',
        size: file.size,
      }
      setDocuments([...documents, newDoc])
      // TODO: Upload to storage and process for RAG
    })
  }

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id))
  }

  const savePlaybook = () => {
    // TODO: Save via IPC to main process
    console.log('Saving playbook:', { playbook, prompts, documents })
    alert('Playbook saved!')
    router.push('/dashboard/playbooks')
  }

  const testPlaybook = () => {
    // TODO: Open test dialog
    alert('Test playbook feature coming soon')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-8 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Custom Playbook</h1>
          <p className="text-gray-600">Build personalized AI prompts for your use case</p>
        </div>

        {/* Playbook Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Playbook Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Playbook Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Sales Objection Handler"
                value={playbook.name}
                onChange={(e) => setPlaybook({ ...playbook, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                placeholder="What is this playbook for?"
                value={playbook.description}
                onChange={(e) => setPlaybook({ ...playbook, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={playbook.category}
                onChange={(e) => setPlaybook({ ...playbook, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="sales">Sales</option>
                <option value="interview">Interview</option>
                <option value="support">Support</option>
                <option value="meeting">Meeting</option>
                <option value="generic">Generic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Prompts Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Prompts & Triggers</h2>
            <button
              onClick={addPrompt}
              className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600"
            >
              <Plus className="h-5 w-5" />
              Add Prompt
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Define when and how AI should provide suggestions during conversations
          </p>

          <div className="space-y-4">
            {prompts.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">No prompts yet</p>
                <p className="text-sm text-gray-500">Add your first prompt to get started</p>
              </div>
            ) : (
              prompts.map((prompt) => (
                <PromptEditor
                  key={prompt.id}
                  prompt={prompt}
                  onChange={(updates) => updatePrompt(prompt.id, updates)}
                  onDelete={() => deletePrompt(prompt.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge Base (Optional)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload documents to provide context. AI will use these for more informed responses.
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              id="document-upload"
              multiple
              accept=".pdf,.txt,.md,.docx"
              onChange={(e) => handleDocumentUpload(e.target.files)}
              className="hidden"
            />
            <label
              htmlFor="document-upload"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <Upload className="h-5 w-5 inline mr-2" />
              Upload Documents
            </label>
            <p className="text-sm text-gray-500 mt-2">PDF, TXT, MD, DOCX up to 50MB each</p>
          </div>

          {documents.length > 0 && (
            <div className="mt-6 space-y-2">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={() => deleteDocument(doc.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={testPlaybook}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <TestTube className="h-5 w-5" />
            Test Playbook
          </button>
          <button
            onClick={savePlaybook}
            disabled={!playbook.name || prompts.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            Save Playbook
          </button>
        </div>
      </div>
    </div>
  )
}

function PromptEditor({ prompt, onChange, onDelete }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Prompt #{prompt.id}</h4>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trigger Type
          </label>
          <select
            value={prompt.triggerType}
            onChange={(e) => onChange({ triggerType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="keyword">Keyword</option>
            <option value="context">Context (AI Detection)</option>
            <option value="manual">Manual (Always Available)</option>
          </select>
        </div>

        {(prompt.triggerType === 'keyword' || prompt.triggerType === 'context') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Value (keyword or context type)
            </label>
            <input
              type="text"
              value={prompt.triggerValue}
              onChange={(e) => onChange({ triggerValue: e.target.value })}
              placeholder="e.g., objection, pricing, technical question"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prompt Text *
          </label>
          <textarea
            value={prompt.promptText}
            onChange={(e) => onChange({ promptText: e.target.value })}
            placeholder="Provide detailed guidance for the AI..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority (0-10)
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={prompt.priority}
            onChange={(e) => onChange({ priority: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ document, onDelete }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-gray-600" />
        <div>
          <p className="font-medium text-gray-900">{document.name}</p>
          <p className="text-sm text-gray-500">
            {document.type} • {(document.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  )
}

