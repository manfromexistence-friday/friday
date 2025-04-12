'use client'

import { useSession, signOut } from "../../lib/auth-client"
import { useState } from "react"
import Image from "next/image"

export default function Dashboard() {
  const { data: session, isPending } = useSession()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You need to be signed in to view this page.</p>
        <a 
          href="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Go to Home
        </a>
      </div>
    )
  }

  // User is authenticated
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {session.user?.image ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden">
              {/* <Image 
                src={session.user.image} 
                alt="Profile" 
                fill
                className="object-cover"
              /> */}
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold mb-2">
              {session.user?.name || "User"}
            </h1>
            <p className="text-gray-600 mb-2">{session.user?.email}</p>
            
            {/* Provider information - disabled until provider property is available */}
            {/* Alternatively, you could modify your auth types to include provider information */}
            {false && (
              <p className="text-sm mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded">
                  Signed in with Provider
                </span>
              </p>
            )}
            
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <h3 className="font-medium text-gray-500">User ID</h3>
              <p className="truncate">{session.user?.id || "N/A"}</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium text-gray-500">Email</h3>
              <p>{session.user?.email || "N/A"}</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium text-gray-500">Provider</h3>
              <p>Email/Password</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-medium text-gray-500">Account Created</h3>
              <p>{session.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}