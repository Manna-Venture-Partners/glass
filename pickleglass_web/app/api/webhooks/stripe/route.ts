import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getFirestoreInstance } from '@/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const db = getFirestoreInstance()
  const { firebaseUserId, tier } = session.metadata || {}

  if (!firebaseUserId || !tier) {
    console.error('Missing metadata in checkout session')
    return
  }

  try {
    // Generate license key
    const licenseKey = generateLicenseKey()

    // Calculate limits based on tier
    const limits = {
      starter: { ai_credits_daily: 5, device_limit: 1 },
      pro: { ai_credits_daily: 999999, device_limit: 2 },
      enterprise: { ai_credits_daily: 999999, device_limit: 10 },
    }

    const tierLimits = limits[tier as keyof typeof limits] || limits.starter

    // Create license document in Firestore
    const licenseRef = db.collection('licenses').doc()
    await licenseRef.set({
      firebase_user_id: firebaseUserId,
      license_key: licenseKey,
      tier: tier,
      status: 'active',
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      ai_credits_daily: tierLimits.ai_credits_daily,
      device_limit: tierLimits.device_limit,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    })

    // Update user document with subscription info
    const userRef = db.collection('users').doc(firebaseUserId)
    await userRef.set({
      subscription: {
        tier,
        status: 'active',
        license_key: licenseKey,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        updated_at: Timestamp.now(),
      },
    }, { merge: true })

    console.log(`✅ Created license for user ${firebaseUserId} with key ${licenseKey}`)

    // TODO: Send email with license key
    // await sendLicenseEmail(firebaseUserId, licenseKey, tier)
  } catch (error) {
    console.error('Error handling checkout completion:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const db = getFirestoreInstance()
  const { firebaseUserId, tier } = subscription.metadata || {}

  if (!firebaseUserId) {
    console.error('Missing firebase_user_id in subscription metadata')
    return
  }

  const status = subscription.status === 'active' ? 'active' : 'canceled'

  try {
    // Update subscription status in licenses collection
    const licensesSnapshot = await db.collection('licenses')
      .where('firebase_user_id', '==', firebaseUserId)
      .get()

    for (const licenseDoc of licensesSnapshot.docs) {
      await licenseDoc.ref.update({
        status,
        updated_at: Timestamp.now(),
      })
    }

    // Update user subscription
    const userRef = db.collection('users').doc(firebaseUserId)
    await userRef.set({
      subscription: {
        status,
        updated_at: Timestamp.now(),
      },
    }, { merge: true })

    console.log(`✅ Updated subscription for user ${firebaseUserId} to ${status}`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const db = getFirestoreInstance()
  const { firebaseUserId } = subscription.metadata || {}

  if (!firebaseUserId) {
    console.error('Missing firebase_user_id in subscription metadata')
    return
  }

  try {
    // Mark licenses as canceled
    const licensesSnapshot = await db.collection('licenses')
      .where('firebase_user_id', '==', firebaseUserId)
      .get()

    for (const licenseDoc of licensesSnapshot.docs) {
      await licenseDoc.ref.update({
        status: 'canceled',
        updated_at: Timestamp.now(),
      })
    }

    // Update user subscription to canceled
    const userRef = db.collection('users').doc(firebaseUserId)
    await userRef.set({
      subscription: {
        status: 'canceled',
        updated_at: Timestamp.now(),
      },
    }, { merge: true })

    console.log(`✅ Canceled subscription for user ${firebaseUserId}`)
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    throw error
  }
}

function generateLicenseKey(): string {
  // Generate a unique license key: XXXX-XXXX-XXXX-XXXX
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(Math.random().toString(36).substring(2, 6).toUpperCase())
  }
  return segments.join('-')
}

