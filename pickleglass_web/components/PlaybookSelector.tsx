'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Sparkles, Check } from 'lucide-react'

interface Playbook {
  id: string
  name: string
  description: string
  category: string
  icon: string
  is_premium: boolean
  prompts: Array<{
    id: string
    trigger_type: string
    trigger_value: string
    prompt_text: string
  }>
}

interface UserPlaybook {
  id: string
  playbook_id: string
  is_favorite: boolean
  usage_count: number
  last_used: number
}

declare global {
  interface Window {
    ipcRenderer?: any;
  }
}

export function PlaybookSelector() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [userPlaybooks, setUserPlaybooks] = useState<UserPlaybook[]>([])
  const [activePlaybookId, setActivePlaybookId] = useState<string | null>(null)
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
    
    // Listen for playbook status updates
    if (window.ipcRenderer) {
      window.ipcRenderer.on('playbook-suggestion', handlePlaybookSuggestion)
    }

    return () => {
      if (window.ipcRenderer) {
        window.ipcRenderer.removeAllListeners('playbook-suggestion')
      }
    }
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load templates and user collection
      const [templates, userPbs] = await Promise.all([
        window.ipcRenderer?.invoke('playbook:getTemplates') || Promise.resolve([]),
        window.ipcRenderer?.invoke('playbook:getUserPlaybooks') || Promise.resolve([])
      ])

      setPlaybooks(templates)
      setUserPlaybooks(userPbs)

      // Check active playbook
      const active = await window.ipcRenderer?.invoke('playbook-engine:getActive')
      if (active && active.hasActive && active.playbookId) {
        setActivePlaybookId(active.playbookId)
        setSelectedPlaybookId(active.playbookId)
      }

    } catch (error) {
      console.error('[PlaybookSelector] Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaybookSuggestion = (suggestion: any) => {
    console.log('[PlaybookSelector] Received suggestion:', suggestion)
    // Could show a toast notification or update UI
  }

  const handleActivatePlaybook = async (playbookId: string) => {
    if (!playbookId || playbookId === '') {
      // Unload playbook
      await window.ipcRenderer?.invoke('playbook-engine:unload')
      setActivePlaybookId(null)
      setSelectedPlaybookId('')
      return
    }

    try {
      const result = await window.ipcRenderer?.invoke('playbook-engine:load', playbookId)
      if (result?.success) {
        setActivePlaybookId(playbookId)
        setSelectedPlaybookId(playbookId)
        console.log('[PlaybookSelector] Activated playbook:', playbookId)
      }
    } catch (error) {
      console.error('[PlaybookSelector] Failed to activate playbook:', error)
    }
  }

  const handleAddToCollection = async (playbookId: string) => {
    try {
      await window.ipcRenderer?.invoke('playbook:addToCollection', playbookId)
      await loadData()
    } catch (error) {
      console.error('[PlaybookSelector] Failed to add to collection:', error)
    }
  }

  const handleToggleFavorite = async (playbookId: string) => {
    try {
      await window.ipcRenderer?.invoke('playbook:toggleFavorite', playbookId)
      await loadData()
    } catch (error) {
      console.error('[PlaybookSelector] Failed to toggle favorite:', error)
    }
  }

  const activePlaybook = playbooks.find(p => p.id === activePlaybookId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Playbook Status */}
      {activePlaybook && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                Active: {activePlaybook.icon} {activePlaybook.name}
              </p>
              <p className="text-xs text-green-700">
                Real-time suggestions enabled for {activePlaybook.prompts?.length || 0} scenarios
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Playbook Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Active Playbook</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Select a playbook to enable context-aware AI assistance during conversations.
        </p>

        <select
          value={selectedPlaybookId}
          onChange={(e) => {
            setSelectedPlaybookId(e.target.value)
            handleActivatePlaybook(e.target.value)
          }}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
        >
          <option value="">No Playbook Active</option>
          {playbooks.map(pb => (
            <option key={pb.id} value={pb.id}>
              {pb.icon} {pb.name} ({pb.prompts?.length || 0} prompts)
            </option>
          ))}
        </select>
      </div>

      {/* Available Templates */}
      {playbooks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Available Templates</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {playbooks.map(playbook => {
              const userPb = userPlaybooks.find(up => up.playbook_id === playbook.id)
              const isActive = activePlaybookId === playbook.id

              return (
                <div
                  key={playbook.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    isActive
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{playbook.icon}</span>
                        <h4 className="font-semibold text-gray-900">{playbook.name}</h4>
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{playbook.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="capitalize">{playbook.category}</span>
                        <span>•</span>
                        <span>{playbook.prompts?.length || 0} prompts</span>
                        {userPb && userPb.usage_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{userPb.usage_count} uses</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!userPb && (
                        <button
                          onClick={() => handleAddToCollection(playbook.id)}
                          className="text-xs px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        >
                          Add
                        </button>
                      )}
                      {userPb?.is_favorite ? (
                        <button
                          onClick={() => handleToggleFavorite(playbook.id)}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          <Sparkles className="h-4 w-4 fill-current" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFavorite(playbook.id)}
                          className="text-gray-400 hover:text-yellow-500"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && playbooks.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Playbooks Available</h3>
          <p className="text-sm text-gray-600">
            Playbook templates will be available once the database is initialized.
          </p>
        </div>
      )}
    </div>
  )
}

