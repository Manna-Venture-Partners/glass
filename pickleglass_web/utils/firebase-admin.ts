import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin only once
let adminApp: any
let adminFirestore: any

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null

    if (serviceAccount) {
      adminApp = initializeApp({
        credential: cert(serviceAccount),
      })
      adminFirestore = getFirestore(adminApp)
    } else {
      console.warn('Firebase Admin not initialized - SERVICE_ACCOUNT not set')
    }
  }
}

export function getFirestoreInstance() {
  if (!adminFirestore) {
    initializeFirebaseAdmin()
  }
  return adminFirestore
}

export function getAuthInstance() {
  if (!adminApp) {
    initializeFirebaseAdmin()
  }
  return adminApp
}

export function getStorageInstance() {
  const { getStorage } = require('firebase-admin/storage')
  
  if (!adminApp) {
    initializeFirebaseAdmin()
  }
  
  return getStorage()
}

