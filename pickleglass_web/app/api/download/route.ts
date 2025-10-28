import { NextResponse } from 'next/server'
import { getFirestoreInstance, getStorageInstance } from '@/utils/firebase-admin'

const VERSION = '0.2.4'

function detectPlatform(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  
  if (ua.includes('mac')) return 'mac'
  if (ua.includes('win')) return 'win'
  if (ua.includes('linux')) return 'linux'
  
  return 'mac' // Default
}

function getDownloadFile(platform: string): string {
  const files: Record<string, string> = {
    mac: 'glass-mac.dmg',
    win: 'glass-win-setup.exe',
    linux: 'glass-linux.AppImage',
  }
  
  return files[platform] || files.mac
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const licenseKey = searchParams.get('licenseKey')
    
    // Get user agent to detect platform
    const userAgent = request.headers.get('user-agent') || ''
    const platform = detectPlatform(userAgent)
    
    // Get IP address for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    const db = getFirestoreInstance()
    
    // Verify license if provided
    let license = null
    if (licenseKey) {
      const licensesSnapshot = await db.collection('licenses')
        .where('license_key', '==', licenseKey)
        .where('status', '==', 'active')
        .limit(1)
        .get()
      
      license = !licensesSnapshot.empty ? licensesSnapshot.docs[0].data() : null
    }

    // Get download file
    const fileName = getDownloadFile(platform)
    const downloadPath = `releases/${VERSION}/${fileName}`

    // For now, return a direct link (in production, use Firebase Storage signed URLs)
    // const storage = getStorageInstance()
    // const downloadUrl = await storage.file(downloadPath).getSignedUrl({ expiresIn: 3600 })

    // Use GitHub releases or S3 as download source
    let downloadUrl: string
    
    switch (platform) {
      case 'mac':
        downloadUrl = 'https://github.com/pickle-com/glass/releases/latest/download/Glass-latest.dmg'
        break
      case 'win':
        downloadUrl = 'https://github.com/pickle-com/glass/releases/latest/download/Glass-Setup.exe'
        break
      case 'linux':
        downloadUrl = 'https://github.com/pickle-com/glass/releases/latest/download/Glass-latest.AppImage'
        break
      default:
        downloadUrl = 'https://github.com/pickle-com/glass/releases/latest/download/Glass-latest.dmg'
    }

    // Log download (if license provided)
    if (license) {
      try {
        await db.collection('downloads').add({
          license_key: licenseKey,
          license_id: license.id,
          platform,
          version: VERSION,
          ip_address: ipAddress,
          user_agent: userAgent,
          downloaded_at: new Date(),
        })
      } catch (logError) {
        console.error('Failed to log download:', logError)
      }
    }

    // Redirect to download URL
    return NextResponse.redirect(downloadUrl, { status: 302 })
  } catch (error: any) {
    console.error('Download error:', error)
    
    // Fallback to GitHub releases
    return NextResponse.redirect(
      'https://github.com/pickle-com/glass/releases/latest',
      { status: 302 }
    )
  }
}

