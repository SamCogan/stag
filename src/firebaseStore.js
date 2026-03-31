import { initializeApp } from 'firebase/app'
import { getDatabase, off, onValue, ref, update } from 'firebase/database'

let db = null

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const isConfigured = Object.values(config).every(Boolean)

const getDb = () => {
  if (!isConfigured) {
    return null
  }

  if (!db) {
    const app = initializeApp(config)
    db = getDatabase(app)
  }

  return db
}

export const createRemoteStore = (eventCode) => {
  const database = getDb()
  if (!database || !eventCode) {
    return null
  }

  const root = ref(database, `events/${eventCode}/scores`)

  return {
    subscribe(callback) {
      const listener = onValue(root, (snapshot) => {
        callback(snapshot.val() || {})
      })

      return () => off(root, 'value', listener)
    },
    update(patch) {
      return update(root, patch)
    },
  }
}
