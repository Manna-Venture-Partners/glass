import { NextResponse } from 'next/server'
import { getFirestoreInstance } from '@/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const { licenseKey, tier, currentVersion, availableVersion, downloadedVersion, downloaded } = await request.json()

    if (!licenseKey) {
      return NextResponse.json({ error: 'Missing licenseKey' }, { status: 400 })
    }

    const db = getFirestoreInstance()

    // Log update event
    await db.collection('update_events').add({
      license_key: licenseKey,
      tier: tier || 'free',
      current_version: currentVersion,
      available_version: availableVersion,
      downloaded_version: downloadedVersion,
      downloaded: downloaded || false,
      platform: process.platform || 'unknown',
      timestamp: Timestamp.now(),
    })

    console.log(`[UpdateTracking] Tracked update event for ${licenseKey}: ${downloaded ? 'downloaded' : 'available'}`)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Track update error:', error)
    return NextResponse.json({ error: 'Failed to track update' }, { status: 500 })
  }
}

