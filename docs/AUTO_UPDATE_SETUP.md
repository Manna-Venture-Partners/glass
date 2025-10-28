# Auto-Update Setup for Glass

## Overview

Glass uses `electron-updater` for automatic updates with GitHub releases as the distribution channel.

## Architecture

```
Electron App (autoUpdater)
    ↓
Backend API (/updates endpoint)
    ↓
GitHub Releases API
    ↓
Firebase (tracking)
```

## Components

### 1. Auto-Updater in Main Process (`src/index.js`)

- Checks for updates on startup and every 4 hours
- Tracks update events to Firebase
- Downloads updates automatically
- Shows dialog when update is ready
- Supports restart now/later

### 2. Update Service (`pickleglass_web/backend_node/updateService.js`)

- Fetches latest GitHub release
- Finds platform-specific assets (DMG, EXE, AppImage)
- Returns update metadata (version, URL, notes)
- Handles GitHub API authentication

### 3. Update Feed Endpoint (`pickleglass_web/backend_node/index.js`)

- Serves `/updates` endpoint for electron-updater
- Platform detection (darwin, win32, linux)
- Returns 204 if no update available
- Returns update metadata if available

### 4. Tracking API (`pickleglass_web/app/api/track-update/route.ts`)

- Logs update events to Firestore
- Tracks: version checks, downloads, installations
- Used for analytics and debugging

## Setup Instructions

### 1. Environment Variables

Add to your `.env`:

```bash
# Update server
UPDATE_SERVER_URL=https://your-api.com

# GitHub token (optional, for private repos)
GITHUB_TOKEN=ghp_xxxxx
GITHUB_REPO=pickle-com/glass

# Pickleglass API for tracking
pickleglass_API_URL=https://your-api.com
```

### 2. GitHub Releases

Create releases on GitHub:

```bash
# Build and publish
npm run publish

# This creates a draft release on GitHub
# Review and publish it
```

### 3. GitHub Token (Optional)

For private repos, create a GitHub token:
1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Create token with `repo` scope
3. Add to `.env` as `GITHUB_TOKEN`

### 4. Firebase Setup

The tracking API writes to Firestore:

Collection: `update_events`
- `license_key`: User's license
- `tier`: User tier (free/pro/enterprise)
- `current_version`: Installed version
- `available_version`: Available version
- `downloaded`: Whether update was downloaded
- `platform`: Operating system
- `timestamp`: Event time

### 5. Update Flow

1. **Check for Updates**
   - App calls `/updates?platform=darwin&version=0.2.4`
   - Backend queries GitHub releases
   - Returns latest version if available

2. **Download**
   - electron-updater downloads the asset
   - Progress tracked via events
   - Download stored locally

3. **Install**
   - Dialog shown when ready
   - User chooses "Restart Now" or "Later"
   - App quits and installs on restart

4. **Tracking**
   - Events logged to Firebase
   - Used for analytics
   - Helps debug update issues

## Testing

### Local Testing

```bash
# Skip auto-updater in development
NODE_ENV=development npm start
```

### Production Testing

```bash
# 1. Publish a new release
npm run publish

# 2. Manually trigger check
# The app checks every 4 hours automatically
# Or restart the app to check on startup

# 3. Check logs
tail -f ~/.glass/logs/main.log
```

### Test Staging

```bash
# Point to staging URL
UPDATE_SERVER_URL=https://staging-api.com npm start
```

## Update Manifest Format

The `/updates` endpoint returns:

```json
{
  "name": "v0.2.5",
  "notes": "Bug fixes and improvements",
  "pub_date": "2024-01-15T10:00:00Z",
  "url": "https://github.com/pickle-com/glass/releases/download/v0.2.5/glass-0.2.5-mac.dmg"
}
```

## Platform-Specific Assets

Ensure GitHub release has assets for:
- **macOS**: `.dmg` or `.zip` files
- **Windows**: `.exe` files
- **Linux**: `.AppImage`, `.deb`, or `.rpm` files

## Troubleshooting

### Updates Not Checking

Check logs:
```bash
tail -f ~/.glass/logs/main.log | grep AutoUpdater
```

Common issues:
- Wrong `UPDATE_SERVER_URL`
- GitHub API rate limits (add token)
- Network issues
- Development mode (skips checks)

### Update Downloaded But Not Installing

- Check permissions on update files
- Try manual restart
- Check electron-updater logs

### Tracking Not Working

- Verify Firebase credentials
- Check `pickleglass_API_URL` is set
- Inspect Network tab in DevTools
- Check Firestore `update_events` collection

## Security

- Updates are signed with code signing certificates
- HTTPS required for update URLs
- Checksums verified automatically
- GitHub releases are verified

## Future Enhancements

- Delta updates (smaller downloads)
- Rollback support
- Update channels (stable, beta, alpha)
- Differential updates (partial downloads)
- Staged rollout (percentage-based)

## Configuration

Update frequency: 4 hours (configurable in `src/index.js`)

```javascript
setInterval(() => {
    autoUpdater.checkForUpdates();
}, 4 * 60 * 60 * 1000); // 4 hours
```

## Support

For issues:
1. Check logs: `~/.glass/logs/main.log`
2. Verify GitHub release exists
3. Test update endpoint manually: `curl https://your-api.com/updates?platform=darwin&version=0.2.4`
4. Check Firebase tracking data
5. File issue on GitHub with logs

