# License Activation System

## Overview

Electron app with license key validation and tier-based feature access.

## Files Created

1. **`src/ui/license-entry.html`** - License entry dialog UI
2. **IPC handlers in `src/bridge/featureBridge.js`**:
   - `validate-license` - Validates key with backend API
   - `save-license` - Stores license locally
   - `skip-license` - Continue with free tier
   - `has-license` - Check if license exists
   - `get-license-info` - Get current license details

3. **License check in `src/index.js`**:
   - Shows dialog on first launch if no license
   - Stores license in `electron-store` (license store)

## User Flow

### First Launch
1. App checks for existing license key
2. If no license → Shows modal dialog
3. User can:
   - Enter license key → Validate via `/api/validate-license`
   - Click "Continue Free" → Limited free tier
   - Click "Start 7-day free trial" → Opens pricing page

### License Validation
1. User enters key (auto-formatted as XXXX-XXXX-XXXX-XXXX)
2. Electron calls `/api/validate-license` with:
   - License key
   - Device fingerprint
   - App version
3. API checks:
   - License exists and is active
   - Device limit not exceeded
   - Registers/updates device
4. Returns tier and features
5. App saves license to local storage

### Subsequent Launches
1. App reads license from local storage
2. Uses saved tier and features
3. No dialog shown

## Local Storage (electron-store)

**Storage: `~/.config/Glass/license.json`**

```json
{
  "license_key": "ABCD-EFGH-IJKL-MNOP",
  "tier": "pro",
  "features": {
    "aiCreditsRemaining": 999999,
    "playbooks": ["sales-demo", "technical-interview", ...],
    "customPlaybooks": true,
    "unlimitedAI": true,
    "models": ["gpt-4o", "claude-3-5-sonnet", "gemini-2.5-flash"],
    "deviceLimit": 2,
    "currentDevices": 1
  },
  "validated_at": 1234567890
}
```

## Feature Enforcement

### On AI Requests (askService.js)
```javascript
// Check credits before AI request
const licenseInfo = await ipcRenderer.invoke('get-license-info');
if (licenseInfo.tier === 'free' && licenseInfo.features.aiCreditsRemaining <= 0) {
  // Show error: "Daily limit reached. Upgrade to Pro."
  return;
}
```

### On Playbook Activation
```javascript
const licenseInfo = await ipcRenderer.invoke('get-license-info');
if (!licenseInfo.features.customPlaybooks && !isSystemPlaybook(playbook)) {
  // Block custom playbooks for free tier
  return;
}
```

## UI Dialog Features

- Auto-formatting: `XXXX-XXXX-XXXX-XXXX`
- Validation feedback with error messages
- Loading spinner during validation
- Success animation
- Skip option for free tier
- Direct link to pricing page

## Security

- Device fingerprinting tracks which devices use a license
- Daily credit reset for free tier
- Device limit enforcement (Pro: 2, Enterprise: 10)
- License key stored locally (encrypted by electron-store)
- Validation called on each app launch (optional)

## Testing

1. Fresh install → Dialog appears
2. Enter invalid key → Error shown
3. Enter valid key → Success, app unlocked
4. Click "Continue Free" → App runs with limits
5. Restart app → No dialog, uses saved license

## Next Steps

- Add license renewal logic
- Show tier upgrade prompts in app
- Add "View License" in settings
- Display remaining credits in UI
- Add device management UI

