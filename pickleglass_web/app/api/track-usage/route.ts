import { NextResponse } from 'next/server'
import { getFirestoreInstance } from '@/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const { licenseKey, type } = await request.json()

    if (!licenseKey || !type) {
      return NextResponse.json({ error: 'Missing licenseKey or type' }, { status: 400 })
    }

    const db = getFirestoreInstance()

    // Find license
    const licensesSnapshot = await db.collection('licenses')
      .where('license_key', '==', licenseKey)
      .limit(1)
      .get()

    if (licensesSnapshot.empty) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 })
    }

    const licenseDoc = licensesSnapshot.docs[0]
    const license = licenseDoc.data()

    // Track usage based on type
    if (type === 'ai_query') {
      const creditsUsed = license.ai_credits_used_today || 0
      const creditsDaily = license.ai_credits_daily || 5

      // Only track for limited tiers (free/starter)
      if (creditsDaily !== 999999) {
        await licenseDoc.ref.update({
          ai_credits_used_today: creditsUsed + 1,
          updated_at: Timestamp.now(),
        })

        // Return remaining credits
        return NextResponse.json({
          success: true,
          creditsUsed: creditsUsed + 1,
          creditsRemaining: Math.max(0, creditsDaily - (creditsUsed + 1)),
        })
      } else {
        // Unlimited tier
        return NextResponse.json({
          success: true,
          creditsUsed: 0,
          creditsRemaining: Infinity,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Track usage error:', error)
    return NextResponse.json({ error: 'Failed to track usage' }, { status: 500 })
  }
}

