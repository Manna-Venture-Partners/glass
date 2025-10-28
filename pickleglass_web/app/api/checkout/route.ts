import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
})

// Track checkout events to Firebase (for analytics)
async function trackCheckoutEvent(event: string, data: any) {
  try {
    const { getFirestoreInstance } = await import('@/utils/firebase-admin')
    const db = getFirestoreInstance()
    await db.collection('analytics_events').add({
      event,
      ...data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to track checkout event:', error)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { priceId, tier, userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!priceId || !tier) {
      return NextResponse.json({ error: 'Missing priceId or tier' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

    // Track checkout started
    await trackCheckoutEvent('checkout_started', {
      userId,
      tier,
      priceId,
    })

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&tier=${tier}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        firebaseUserId: userId,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          firebaseUserId: userId,
          tier: tier,
        },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

