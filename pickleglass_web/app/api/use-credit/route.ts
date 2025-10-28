import { NextResponse } from 'next/server'
import { getFirestoreInstance } from '@/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const { licenseKey } = await request.json()

    if (!licenseKey) {
      return NextResponse.json({ error: 'Missing license key' }, { status: 400 })
    }

    const db = getFirestoreInstance()

    // Find license
    const licensesSnapshot = await db.collection('licenses')
      .where('license_key', '==', licenseKey)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (licensesSnapshot.empty) {
      return NextResponse.json({ error: 'Invalid license' }, { status: 401 })
    }

    const licenseDoc = licensesSnapshot.docs[0]
    const license = licenseDoc.data()

    // Check if credits are available
    const creditsUsed = license.ai_credits_used_today || 0
    const creditsDaily = license.ai_credits_daily || 5

    // Pro/Enterprise have unlimited credits (999999)
    if (creditsDaily === 999999) {
      return NextResponse.json({ success: true, creditsRemaining: Infinity })
    }

    if (creditsUsed >= creditsDaily) {
      return NextResponse.json(
        { error: 'Daily limit reached', creditsRemaining: 0 },
        { status: 429 }
      )
    }

    // Increment credits used
    await licenseDoc.ref.update({
      ai_credits_used_today: creditsUsed + 1,
      updated_at: Timestamp.now(),
    })

    return NextResponse.json({
      success: true,
      creditsRemaining: creditsDaily - (creditsUsed + 1),
    })
  } catch (error: any) {
    console.error('Use credit error:', error)
    return NextResponse.json({ error: 'Failed to use credit' }, { status: 500 })
  }
}

