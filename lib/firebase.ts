import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// ==========================================
// Firebase Client Auto-Detection & Config
// ==========================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if credentials are set and aren't default placeholders
const isConfigured = 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "your-project-id" && 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "your-api-key-here"

let app: any = null
let auth: any = null
let db: any = null
let isFirebaseEnabled = false

if (isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
    isFirebaseEnabled = true
    console.log("🔥 ServiceBuddy: Firebase Auth & Cloud Firestore initialized successfully!")
  } catch (error) {
    console.error("❌ ServiceBuddy: Firebase initialization error:", error)
  }
} else {
  console.warn(
    "⚠️ ServiceBuddy running in OFFLINE Sandbox mode. To hook up live Cloud databases, populate standard credentials inside your .env.local configuration file!"
  )
}

export { isFirebaseEnabled, app, auth, db }
