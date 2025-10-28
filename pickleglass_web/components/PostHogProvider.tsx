'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initPostHog, identify, trackEvent } from '@/lib/analytics'
import { useAuth } from '@/utils/auth'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    initPostHog()
  }, [])

  useEffect(() => {
    // Track page views
    if (pathname) {
      trackEvent('page_viewed', { page: pathname })
    }
  }, [pathname])

  useEffect(() => {
    // Identify user when they log in
    if (user?.uid) {
      identify(user.uid, {
        email: user.email,
        displayName: user.displayName,
      })
    }
  }, [user])

  return <>{children}</>
}

