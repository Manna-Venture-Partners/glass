import { NextResponse } from 'next/server'
import { getFirestoreInstance } from '@/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const FREE_TIER_FEATURES = {
  aiCreditsRemaining: 5,
  playbooks: ['sales', 'meetings'], // Limited playbooks for free tier
  customPlaybooks: false,
  unlimitedAI: false,
  models: ['gpt-4o-mini'],
}

export async function POST(request: Request) {
  try {
    const { licenseKey, deviceId, version } = await request.json()

    if (!licenseKey) {
      return NextResponse.json(
        { valid: false, message: 'Missing license key', tier: 'free', features: FREE_TIER_FEATURES },
        { status: 400 }
      )
    }

    const db = getFirestoreInstance()

    // Find license by key and status
    const licensesSnapshot = await db.collection('licenses')
      .where('license_key', '==', licenseKey)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (licensesSnapshot.empty) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid or expired license',
        tier: 'free',
        features: FREE_TIER_FEATURES,
      })
    }

    const licenseDoc = licensesSnapshot.docs[0]
    const license = licenseDoc.data()

    // Check device limit
    const devicesSnapshot = await db.collection('devices')
      .where('license_id', '==', licenseDoc.id)
      .get()

    const devices = devicesSnapshot.docs.map(doc => doc.data())
    const existingDevice = devices.find(d => d.device_fingerprint === deviceId)

    if (!existingDevice && devices.length >= license.device_limit) {
      return NextResponse.json({
        valid: false,
        message: `Device limit reached (${license.device_limit} devices)`,
        tier: license.tier,
        features: {},
      })
    }

    // Upsert device (add or update)
    if (existingDevice) {
      await db.collection('devices').doc(existingDevice.id || devicesSnapshot.docs.find(d => d.data().device_fingerprint === deviceId)?.id).update({
        last_active: Timestamp.now(),
        version,
      })
    } else {
      await db.collection('devices').add({
        license_id: licenseDoc.id,
        device_fingerprint: deviceId,
        last_active: Timestamp.now(),
        version,
        created_at: Timestamp.now(),
      })
    }

    // Check AI credits and reset if needed (for free tier only)
    let creditsRemaining = Infinity
    if (license.tier === 'free') {
      const now = Date.now()
      const resetTime = license.credits_reset_at?.toMillis() || now

      if (now > resetTime) {
        // Reset daily credits
        await licenseDoc.ref.update({
          ai_credits_used_today: 0,
          credits_reset_at: Timestamp.fromMillis(now + 24 * 60 * 60 * 1000),
        })
        license.ai_credits_used_today = 0
      }

      creditsRemaining = (license.ai_credits_daily || 5) - (license.ai_credits_used_today || 0)
    } else if (license.ai_credits_daily === 999999) {
      creditsRemaining = Infinity
    } else {
      creditsRemaining = license.ai_credits_daily - (license.ai_credits_used_today || 0)
    }

    // Get playbooks for tier
    const playbooks = await getPlaybooksForTier(license.tier)

    return NextResponse.json({
      valid: true,
      tier: license.tier,
      license_key: license.license_key,
      features: {
        aiCreditsRemaining: creditsRemaining,
        playbooks,
        customPlaybooks: license.tier !== 'starter' && license.tier !== 'free',
        unlimitedAI: license.tier !== 'starter' && license.tier !== 'free',
        models: license.tier === 'free' || license.tier === 'starter'
          ? ['gpt-4o-mini']
          : license.tier === 'pro'
          ? ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.5-flash']
          : ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.5-flash'],
        deviceLimit: license.device_limit,
        currentDevices: devices.length,
      },
    })
  } catch (error: any) {
    console.error('License validation error:', error)
    return NextResponse.json(
      { valid: false, message: 'Validation failed', tier: 'free', features: FREE_TIER_FEATURES },
      { status: 500 }
    )
  }
}

async function getPlaybooksForTier(tier: string): Promise<string[]> {
  const tierPlaybooks: Record<string, string[]> = {
    free: ['sales-demo', 'objection-handler'], // 2 free playbooks
    starter: ['sales-demo', 'objection-handler'], // Same as free
    pro: ['sales-demo', 'objection-handler', 'technical-interview', 'behavioral-interview', 'customer-support', 'general-meeting'], // All system playbooks
    enterprise: ['*'], // All playbooks including custom
  }

  return tierPlaybooks[tier] || tierPlaybooks.starter
}

