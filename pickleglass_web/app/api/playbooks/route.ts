import { NextResponse } from 'next/server'
import { getFirestoreInstance } from '@/utils/firebase-admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const licenseKey = searchParams.get('licenseKey')

    if (!licenseKey) {
      return NextResponse.json(
        { error: 'Missing licenseKey parameter' },
        { status: 400 }
      )
    }

    const db = getFirestoreInstance()

    // Find license
    const licensesSnapshot = await db.collection('licenses')
      .where('license_key', '==', licenseKey)
      .where('status', '==', 'active')
      .limit(1)
      .get()

    if (licensesSnapshot.empty) {
      return NextResponse.json({ playbooks: [] })
    }

    const license = licensesSnapshot.docs[0].data()
    const tier = license.tier || 'free'

    // Fetch playbooks based on tier
    const playbooksQuery = db.collection('playbooks')
      .where('is_template', '==', true)

    // Get system playbooks
    const systemPlaybooksSnapshot = await playbooksQuery.get()
    
    let systemPlaybooks = systemPlaybooksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Filter based on tier
    let availablePlaybooks = systemPlaybooks

    if (tier === 'free' || tier === 'starter') {
      // Only basic playbooks
      const basicPlaybooks = ['sales-demo', 'objection-handler']
      availablePlaybooks = systemPlaybooks.filter(p => 
        basicPlaybooks.includes(p.name.toLowerCase().replace(/\s+/g, '-'))
      )
    }

    // Fetch prompts for each playbook
    const playbooksWithPrompts = await Promise.all(
      availablePlaybooks.map(async (playbook) => {
        const promptsSnapshot = await db.collection('playbooks')
          .doc(playbook.id)
          .collection('prompts')
          .get()

        const prompts = promptsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))

        return {
          ...playbook,
          prompts,
        }
      })
    )

    return NextResponse.json({ playbooks: playbooksWithPrompts })
  } catch (error: any) {
    console.error('Fetch playbooks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playbooks' },
      { status: 500 }
    )
  }
}

