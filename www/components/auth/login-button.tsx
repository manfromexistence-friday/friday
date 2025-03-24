'use client'

import { Button } from '@/components/ui/button'
import { signInWithGoogle } from '@/lib/firebase/auth'

export function LoginButton() {
  return (
    <Button onClick={signInWithGoogle} variant="outline">
      Sign in with Google
    </Button>
  )
}