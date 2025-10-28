const https = require('https');
const axios = require('axios');

// Update service for electron-updater
class UpdateService {
  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN;
    this.githubRepo = process.env.GITHUB_REPO || 'pickle-com/glass';
    this.githubApiBase = 'https://api.github.com';
  }

  async getLatestRelease() {
    try {
      const headers = this.githubToken 
        ? { 'Authorization': `token ${this.githubToken}` }
        : {};

      const response = await axios.get(
        `${this.githubApiBase}/repos/${this.githubRepo}/releases/latest`,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error('[UpdateService] Error fetching latest release:', error.message);
      return null;
    }
  }

  async getUpdateFeed(platform, version) {
    try {
      const release = await this.getLatestRelease();
      
      if (!release) {
        return {
          name: version,
          notes: 'Unable to check for updates',
          pub_date: new Date().toISOString(),
          url: ''
        };
      }

      // Find the appropriate asset for this platform
      const asset = this.findAssetForPlatform(release.assets, platform);
      
      if (!asset) {
        return {
          name: version,
          notes: 'No update available for this platform',
          pub_date: release.published_at,
          url: ''
        };
      }

      return {
        name: release.tag_name || release.name,
        notes: release.body || 'Bug fixes and improvements',
        pub_date: release.published_at,
        url: asset.browser_download_url
      };

    } catch (error) {
      console.error('[UpdateService] Error generating update feed:', error);
      return null;
    }
  }

  findAssetForPlatform(assets, platform) {
    // Map Electron platforms to GitHub release asset patterns
    const platformMap = {
      'darwin': { pattern: /\.dmg$|\.zip$/, mac: true },
      'win32': { pattern: /\.exe$|\.portable\.exe$/, win: true },
      'linux': { pattern: /\.AppImage$|\.deb$/, linux: true }
    };

    const config = platformMap[platform] || platformMap['darwin'];
    
    return assets.find(asset => {
      return asset.name.match(config.pattern);
    });
  }

  getUpdateUrl(platform) {
    const assetExtension = platform === 'darwin' ? 'dmg' : 
                          platform === 'win32' ? 'exe' : 'AppImage';
    
    // Generic endpoint that returns platform-specific update info
    return `/api/updates/${platform}`;
  }
}

module.exports = UpdateService;

