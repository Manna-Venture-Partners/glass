# Stripe + Firebase Integration

## Overview

Complete payment and license validation system integrated with Firebase authentication.

## API Endpoints

### 1. `/api/checkout` (POST)
Creates Stripe Checkout session for subscription purchases.

**Request:**
```json
{
  "priceId": "price_xxx",
  "tier": "pro",
  "userId": "firebase_user_id"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### 2. `/api/webhooks/stripe` (POST)
Handles Stripe webhook events for subscription lifecycle.

**Events Handled:**
- `checkout.session.completed` - Creates license, updates user
- `customer.subscription.updated` - Syncs subscription status
- `customer.subscription.deleted` - Cancels licenses

### 3. `/api/validate-license` (POST)
Validates license keys from Electron app.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX",
  "deviceId": "device_fingerprint",
  "version": "1.0.0"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "tier": "pro",
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "features": {
    "aiCreditsRemaining": 999999,
    "playbooks": ["sales-demo", "technical-interview", ...],
    "customPlaybooks": true,
    "unlimitedAI": true,
    "models": ["gpt-4o", "claude-3-5-sonnet", "gemini-2.5-flash"],
    "deviceLimit": 2,
    "currentDevices": 1
  }
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Invalid or expired license",
  "tier": "free",
  "features": {
    "aiCreditsRemaining": 5,
    "playbooks": ["sales-demo", "objection-handler"],
    "customPlaybooks": false,
    "unlimitedAI": false,
    "models": ["gpt-4o-mini"]
  }
}
```

### 4. `/api/use-credit` (POST)
Consumes AI credit after API call.

**Request:**
```json
{
  "licenseKey": "XXXX-XXXX-XXXX-XXXX"
}
```

**Response:**
```json
{
  "success": true,
  "creditsRemaining": 999998
}
```

## Firestore Collections

### `licenses` Collection
Stores all license keys with subscription info.

```javascript
{
  id: "license_doc_id",
  firebase_user_id: "user_uid",
  license_key: "ABCD-EFGH-IJKL-MNOP",
  tier: "pro",
  status: "active",
  stripe_customer_id: "cus_xxx",
  stripe_subscription_id: "sub_xxx",
  ai_credits_daily: 999999,
  ai_credits_used_today: 0,
  device_limit: 2,
  credits_reset_at: Timestamp,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### `devices` Collection
Tracks devices using each license.

```javascript
{
  id: "device_doc_id",
  license_id: "license_doc_id",
  device_fingerprint: "unique_device_id",
  last_active: Timestamp,
  version: "1.0.0",
  created_at: Timestamp
}
```

### `users` Collection (subscription field)
User subscription status.

```javascript
{
  uid: "user_uid",
  subscription: {
    tier: "pro",
    status: "active",
    license_key: "ABCD-EFGH-IJKL-MNOP",
    stripe_customer_id: "cus_xxx",
    stripe_subscription_id: "sub_xxx",
    updated_at: Timestamp
  }
}
```

## Tier Limits

| Tier | AI Credits/Day | Devices | Playbooks | Custom Playbooks | Models |
|------|----------------|---------|-----------|------------------|--------|
| Free | 5 | 1 | 2 basic | No | gpt-4o-mini |
| Starter | 5 | 1 | 2 basic | No | gpt-4o-mini |
| Pro | Unlimited | 2 | All | Yes | gpt-4o, claude, gemini |
| Enterprise | Unlimited | 10 | All + Custom | Yes | All + Custom |

## Integration Flow

### Purchase Flow
1. User clicks "Upgrade to Pro" in `/settings/billing`
2. Frontend calls `/api/checkout` with Firebase userId
3. Stripe Checkout session created
4. User completes payment on Stripe
5. Webhook fires → creates license in Firestore
6. User redirected to dashboard

### Validation Flow (Electron App)
1. User enters license key in app
2. App calls `/api/validate-license` with device fingerprint
3. API checks device limits
4. API registers/updates device
5. Returns tier and available features
6. App enables features based on tier

### Credit Usage Flow
1. User makes AI request
2. App checks if it has credits (calls `/api/use-credit`)
3. If successful, consumes 1 credit
4. Returns remaining credits
5. App enforces limits

## Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID=price_xxx

# Firebase Admin
FIREBASE_SERVICE_ACCOUNT={...json...}
```

## Security Features

- License key validation
- Device fingerprinting for limit enforcement
- Daily credit reset for free tier
- Subscription status syncing
- Device registration tracking
- Rate limiting via credit system

## Files Created

- `pickleglass_web/app/api/checkout/route.ts` ✅
- `pickleglass_web/app/api/webhooks/stripe/route.ts` ✅
- `pickleglass_web/app/api/validate-license/route.ts` ✅
- `pickleglass_web/app/api/use-credit/route.ts` ✅
- `pickleglass_web/utils/firebase-admin.ts` ✅
- `pickleglass_web/app/settings/billing/page.tsx` ✅ (Updated)

## Next Steps

1. Add Firestore security rules
2. Implement email sending for license keys
3. Add subscription management UI (cancel, upgrade)
4. Create license key display in settings
5. Add device management UI

