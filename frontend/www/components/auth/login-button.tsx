'use client';

import { Button } from '@/components/ui/button';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Adjust path to your firebase.ts
import { aiService } from '@/lib/services/ai-service'; // Adjust path to your aiService.ts
import { useState } from 'react';

export function LoginButton() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In handler
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      
      // Set the token in aiService for backend requests
      aiService.setAuthToken(idToken);
      
      console.log('Signed in with Google, token set in aiService');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      setError('Failed to sign in with Google');
    }
  };

  // Email/Password Sign-In handler
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      // Set the token in aiService for backend requests
      aiService.setAuthToken(idToken);
      
      console.log('Signed in with email/password, token set in aiService');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Email Sign-In Error:', error);
      setError('Failed to sign in with email/password');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Google Sign-In Button */}
      <Button onClick={signInWithGoogle} variant="outline">
        Sign in with Google
      </Button>

      {/* Email/Password Sign-In Form */}
      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 border rounded"
          required
        />
        <Button type="submit" variant="outline">
          Sign in with Email
        </Button>
      </form>

      {/* Error Display */}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

// 'use client'

// import { Button } from '@/components/ui/button'
// import { signInWithGoogle } from '@/lib/firebase/auth'

// export function LoginButton() {
//   return (
//     <Button onClick={signInWithGoogle} variant="outline">
//       Sign in with Google
//     </Button>
//   )
// }