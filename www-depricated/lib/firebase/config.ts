import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAa5WX2pN2onBc0GHz093t0QGUOALwwa-U",
  authDomain: "friday-e42cb.firebaseapp.com",
  projectId: "friday-e42cb",
  storageBucket: "friday-e42cb.firebasestorage.app",
  messagingSenderId: "966464042054",
  appId: "1:966464042054:web:f68d5968c8c9eabcc8c647"
}

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)

// console.log('Firebase initialized with project:', firebaseConfig.projectId)

export { app, auth, db }