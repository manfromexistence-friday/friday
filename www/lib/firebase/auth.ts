import { 
  signInAnonymously, 
  onAuthStateChanged,
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth'
import { auth } from './config'

const googleProvider = new GoogleAuthProvider()

export const initializeAuth = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user)
      } else {
        signInAnonymously(auth)
          .then(resolve)
          .catch(reject)
      }
    })
  })
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result.user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}