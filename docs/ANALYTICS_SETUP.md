# Analytics Setup with PostHog

## Overview

Glass uses PostHog for product analytics, tracking user behavior, feature usage, and business metrics.

## Setup

### 1. Create PostHog Account

1. Go to [app.posthog.com](https://app.posthog.com)
2. Sign up for free account
3. Get your API key from Settings → Project Settings

### 2. Environment Variables

Add to your `.env.local`:

```bash
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Install PostHog

```bash
cd pickleglass_web
npm install posthog-js
```

### 4. Verify Integration

Check browser console on page load:
```
[Analytics] PostHog initialized
```

## Tracked Events

### User Events

- `user_signup` - When user creates account
- `user_login` - When user signs in
- `user_logout` - When user signs out

### License Events

- `license_activated` - When license key is activated
- `license_upgrade_clicked` - When user clicks upgrade button
- `checkout_started` - When checkout flow begins
- `checkout_completed` - When subscription is purchased
- `checkout_cancelled` - When checkout is cancelled

### Feature Events

- `playbook_created` - When user creates playbook
- `playbook_selected` - When user selects playbook
- `playbook_synced` - When playbooks sync from cloud
- `meeting_started` - When meeting/conversation starts
- `meeting_ended` - When meeting ends
- `ai_query_made` - When AI request is made
- `ai_credit_depleted` - When free tier credits exhausted

### System Events

- `update_available` - When update is available
- `update_downloaded` - When update is downloaded
- `page_viewed` - When user navigates to page
- `error_occurred` - When error happens

## Usage in Code

### Import Analytics

```typescript
import { analytics } from '@/lib/analytics'
```

### Track Events

```typescript
// User actions
analytics.userLogin('google')
analytics.userSignup('free')

// Feature usage
analytics.playbookSelected('sales-demo', 'Sales Demo')
analytics.meetingStarted('sales-demo')

// License events
analytics.licenseUpgradeClicked('free', 'pro')
analytics.checkoutStarted('pro', 'monthly')

// Custom events
analytics.trackEvent('custom_event', { 
  custom_property: 'value' 
})
```

### Identify Users

```typescript
import { identify } from '@/lib/analytics'

identify(userId, {
  email: 'user@example.com',
  tier: 'pro',
  plan: 'monthly'
})
```

### Reset on Logout

```typescript
import { reset } from '@/lib/analytics'

reset() // Clears user data
```

## Page Tracking

Automatic page view tracking is enabled in `PostHogProvider`:

- Tracks every route change
- Includes pathname
- Timestamp included

## Firebase Analytics

We also track server-side events to Firebase:

Collection: `analytics_events`
- All events logged with timestamp
- Server-side reliability
- Backup for PostHog

## Privacy

### Data Retention

- PostHog: 1 year default
- Firebase: 90 days default
- Configurable per customer

### User Privacy

- No PII collected
- License keys are hashed
- IP addresses not stored
- Cookies for session only

### GDPR Compliance

- User can request data deletion
- Export available
- Opt-out option available

## Dashboards

### Key Metrics to Track

1. **User Acquisition**
   - Signups per day
   - Conversion rate (trial → paid)
   - Signup sources

2. **Feature Usage**
   - Playbook creation rate
   - Most used playbooks
   - Meeting duration
   - AI query frequency

3. **License Metrics**
   - Free vs Pro vs Enterprise
   - Upgrade conversion rate
   - Churn rate
   - MRR tracking

4. **Product Health**
   - Error rate
   - Session duration
   - Active users
   - Feature adoption

### Create Dashboard in PostHog

1. Go to PostHog → Insights
2. Create new dashboard
3. Add charts for key metrics
4. Share with team

## Testing

### Development Mode

Analytics runs in development but:
- Autocapture disabled
- Console logs enabled
- Test mode safe

### Production Mode

- Full tracking enabled
- Session recording off by default
- Event batching enabled

### Test Events

```bash
# Check PostHog test mode
https://app.posthog.com/insights?events=[%22test_event%22]
```

## Troubleshooting

### Events Not Showing

1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Check browser console for errors
3. Verify PostHog dashboard
4. Check network tab for requests

### Too Many Events

1. Review capture settings
2. Disable autocapture
3. Filter test environments
4. Set up sampling

### Privacy Concerns

1. Anonymize IP addresses
2. Don't capture passwords
3. Don't capture credit cards
4. Use consent banners

## Best Practices

### Event Naming

- Use snake_case
- Be descriptive
- Group by feature
- Include context

### Properties

- Don't over-log
- Use structured data
- Include user context
- Avoid PII

### Frequency

- Don't log every keystroke
- Log meaningful actions
- Batch when possible
- Set up alerts

## Advanced

### Feature Flags

```typescript
// Coming soon
posthog.isFeatureEnabled('experimental_feature')
```

### A/B Testing

```typescript
// Coming soon
posthog.getFeatureFlag('new_layout')
```

### Session Recording

Enable with caution (GDPR):
```typescript
disable_session_recording: false
```

## Support

For PostHog issues:
- Docs: https://posthog.com/docs
- Support: support@posthog.com
- GitHub: https://github.com/PostHog/posthog

## Future Enhancements

- Feature flags integration
- A/B testing framework
- Cohort analysis
- Funnel tracking
- Retention analysis
- Custom dashboards

