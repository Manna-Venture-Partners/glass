// Analytics tracking with PostHog
import posthog from 'posthog-js'
import { useEffect } from 'react'

let initialized = false

export function initPostHog() {
  if (typeof window === 'undefined') return

  if (!initialized && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Analytics] PostHog initialized')
        }
      },
      // Disable auto capture in development
      autocapture: process.env.NODE_ENV === 'production',
      // Disable session recording initially
      disable_session_recording: true,
    })
    initialized = true
  }
}

export function identify(userId: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  initPostHog()
  posthog.identify(userId, properties)
}

export function reset() {
  if (typeof window === 'undefined') return
  
  posthog.reset()
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  
  initPostHog()
  posthog.capture(event, properties)
}

// Event tracking helpers
export const analytics = {
  // User events
  userSignup: (tier: string = 'free') => {
    trackEvent('user_signup', { tier, timestamp: new Date().toISOString() })
  },

  userLogin: (method: string = 'google') => {
    trackEvent('user_login', { method, timestamp: new Date().toISOString() })
  },

  userLogout: () => {
    trackEvent('user_logout', { timestamp: new Date().toISOString() })
  },

  // Playbook events
  playbookCreated: (category: string) => {
    trackEvent('playbook_created', { category, timestamp: new Date().toISOString() })
  },

  playbookSelected: (playbookId: string, playbookName: string) => {
    trackEvent('playbook_selected', { 
      playbook_id: playbookId, 
      playbook_name: playbookName,
      timestamp: new Date().toISOString() 
    })
  },

  playbookSynced: (count: number, tier: string) => {
    trackEvent('playbook_synced', { 
      count, 
      tier,
      timestamp: new Date().toISOString() 
    })
  },

  // Meeting events
  meetingStarted: (playbook?: string, playbookId?: string) => {
    trackEvent('meeting_started', { 
      playbook,
      playbook_id: playbookId,
      timestamp: new Date().toISOString() 
    })
  },

  meetingEnded: (duration: number, playbook?: string) => {
    trackEvent('meeting_ended', { 
      duration,
      playbook,
      timestamp: new Date().toISOString() 
    })
  },

  // License events
  licenseActivated: (tier: string, licenseKey: string) => {
    trackEvent('license_activated', { 
      tier,
      license_key_hash: licenseKey.substring(0, 8) + '...',
      timestamp: new Date().toISOString() 
    })
  },

  licenseUpgradeClicked: (from: string, to: string) => {
    trackEvent('license_upgrade_clicked', { 
      from_tier: from, 
      to_tier: to,
      timestamp: new Date().toISOString() 
    })
  },

  // AI usage events
  aiQueryMade: (model: string, tier: string, playbook?: string) => {
    trackEvent('ai_query_made', { 
      model,
      tier,
      playbook,
      timestamp: new Date().toISOString() 
    })
  },

  aiCreditDepleted: (tier: string) => {
    trackEvent('ai_credit_depleted', { 
      tier,
      timestamp: new Date().toISOString() 
    })
  },

  // Update events
  updateAvailable: (currentVersion: string, availableVersion: string) => {
    trackEvent('update_available', { 
      current_version: currentVersion,
      available_version: availableVersion,
      timestamp: new Date().toISOString() 
    })
  },

  updateDownloaded: (version: string) => {
    trackEvent('update_downloaded', { 
      version,
      timestamp: new Date().toISOString() 
    })
  },

  // Navigation events
  pageViewed: (page: string) => {
    trackEvent('page_viewed', { 
      page,
      timestamp: new Date().toISOString() 
    })
  },

  // Feature usage
  featureUsed: (feature: string, properties?: Record<string, any>) => {
    trackEvent('feature_used', { 
      feature,
      ...properties,
      timestamp: new Date().toISOString() 
    })
  },

  // Error tracking
  errorOccurred: (error: string, context?: Record<string, any>) => {
    trackEvent('error_occurred', { 
      error,
      ...context,
      timestamp: new Date().toISOString() 
    })
  },

  // Checkout events
  checkoutStarted: (tier: string, plan: string) => {
    trackEvent('checkout_started', { 
      tier,
      plan,
      timestamp: new Date().toISOString() 
    })
  },

  checkoutCompleted: (tier: string, plan: string, amount: number) => {
    trackEvent('checkout_completed', { 
      tier,
      plan,
      amount,
      timestamp: new Date().toISOString() 
    })
  },

  checkoutCancelled: (tier: string) => {
    trackEvent('checkout_cancelled', { 
      tier,
      timestamp: new Date().toISOString() 
    })
  },
}

// Hook for component usage
export function usePostHog() {
  useEffect(() => {
    initPostHog()
  }, [])

  return { trackEvent, identify, reset }
}

