"use client"

import * as React from "react"
import { useAuth } from '@/contexts/auth-context'
import { LoginButton } from '@/components/auth/login-button'
import LoadingAnimation from '@/components/chat/loading-animation'
import { useState, useEffect } from "react"
import Image from "next/image"
import { Paperclip, Maximize } from "lucide-react"

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorHovering, setCursorHovering] = useState(false)
  const [activeButton, setActiveButton] = useState<string | null>(null)

  // Track mouse position for glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Magnetic button effect
  const magneticEffect = (e: React.MouseEvent<HTMLButtonElement>, buttonId: string) => {
    const button = e.currentTarget
    const rect = button.getBoundingClientRect()

    // Calculate center of button
    const buttonX = rect.left + rect.width / 2
    const buttonY = rect.top + rect.height / 2

    // Calculate distance from mouse to center
    const distanceX = e.clientX - buttonX
    const distanceY = e.clientY - buttonY

    // Move button slightly toward cursor (magnetic effect)
    button.style.transform = `translate(${distanceX / 10}px, ${distanceY / 10}px) translateY(-2px)`

    setActiveButton(buttonId)
  }

  // Reset button position
  const resetMagneticEffect = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = "translateY(0)"
    setActiveButton(null)
  }

  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingAnimation />
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoginButton />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Cursor glow effect */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
        style={{
          opacity: cursorHovering ? 0.15 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.15), transparent 40%)`,
        }}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <main className="flex-1">
          <h1 className="text-5xl font-bold text-center mt-20 mb-12 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            What can I help you ship?
          </h1>

          {/* Input Box */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div
                className="rounded-lg bg-gray-900 border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-700 focus-within:border-gray-600 shadow-lg group"
                onMouseEnter={() => setCursorHovering(true)}
                onMouseLeave={() => setCursorHovering(false)}
              >
                <div className="px-4 py-3 text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  Ask v0 to build...
                </div>
                <div className="flex items-center px-3 py-2 border-t border-gray-800 group-hover:border-gray-700 transition-colors duration-300">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 px-2 py-1 rounded flex items-center gap-1 border border-gray-700 hover:bg-gray-800 hover:border-gray-600 transition-all duration-200 cursor-pointer">
                        No project selected
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors duration-200">
                      <Maximize className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors duration-200">
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-300 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-lg p-[1px] -z-10 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                {
                  id: "clone",
                  label: "Clone a Screenshot",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M4 16L8 12M8 12L12 16M8 12L12 8M16 8L20 12M16 12L20 16M16 12L12 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  id: "figma",
                  label: "Import from Figma",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 2L2 7L12 12L22 7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 17L12 22L22 17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 12L12 17L22 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  id: "upload",
                  label: "Upload a Project",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7 10L12 15L17 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15V3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ),
                },
                {
                  id: "landing",
                  label: "Landing Page",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 9H21" stroke="currentColor" strokeWidth="2" />
                      <path d="M9 21V9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ),
                },
                {
                  id: "signup",
                  label: "Sign Up Form",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  ),
                },
              ].map((button) => (
                <button
                  key={button.id}
                  className={`magnetic-button flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-md text-sm transition-all duration-300 relative overflow-hidden group`}
                  onMouseMove={(e) => magneticEffect(e, button.id)}
                  onMouseLeave={resetMagneticEffect}
                  onMouseEnter={() => setCursorHovering(true)}
                  onMouseOut={() => setCursorHovering(false)}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {button.icon}
                    {button.label}
                  </span>

                  {/* Button background effects */}
                  <span
                    className={`absolute inset-0 transition-opacity duration-300 ${activeButton === button.id ? "opacity-100" : "opacity-0"}`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-purple-600/20 opacity-70"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-500/10 opacity-70 blur-sm"></span>
                  </span>

                  {/* Border gradient */}
                  <span
                    className={`absolute inset-0 rounded-md p-[1px] -z-10 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  ></span>
                </button>
              ))}
            </div>
          </div>

          {/* Community Section */}
          <div className="max-w-7xl mx-auto mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                From the Community
              </h2>
              <a
                href="#"
                className="text-sm text-gray-400 flex items-center hover:text-gray-300 transition-colors duration-200 group"
                onMouseEnter={() => setCursorHovering(true)}
                onMouseLeave={() => setCursorHovering(false)}
              >
                View All
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path
                    d="M5 12H19M19 12L12 5M19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Halftone Waves", forks: "2.9K", gradient: "from-purple-500 to-blue-500" },
                { title: "Next.js + Charts", forks: "2.4K", gradient: "from-pink-500 to-purple-500" },
                { title: "Floating Bubbles", forks: "2K", gradient: "from-blue-500 to-cyan-500" },
                { title: "Portfolio", forks: "5.2K", gradient: "from-orange-500 to-red-500" },
                { title: "Privacy Project", forks: "1.8K", gradient: "from-green-500 to-emerald-500" },
                { title: "Chat Interface", forks: "3.1K", gradient: "from-indigo-500 to-violet-500" },
                { title: "Music Player", forks: "1.5K", gradient: "from-yellow-500 to-amber-500" },
                { title: "Analytics Dashboard", forks: "4.7K", gradient: "from-teal-500 to-green-500" },
              ].map((project, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden border border-gray-800 bg-gray-900 transition-all duration-300 hover:border-gray-700 hover:shadow-lg hover:shadow-purple-500/5 group relative"
                  onMouseEnter={() => setCursorHovering(true)}
                  onMouseLeave={() => setCursorHovering(false)}
                >
                  <div className="aspect-video bg-gray-800 relative overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=200&width=400"
                      alt={project.title}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-700 overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${project.gradient}`}></div>
                      </div>
                      <span className="text-sm font-medium">{project.title}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-1"
                      >
                        <path
                          d="M7 8L12 3M12 3L17 8M12 3V21"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {project.forks} Forks
                    </div>
                  </div>

                  {/* Gradient border effect */}
                  <div className="absolute inset-0 rounded-lg p-[1px] -z-10 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}


// export default function ChatPage() {
//   const { user, loading } = useAuth()

//   if (loading) {
//     return <LoadingAnimation />
//   }

//   if (!user) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <LoginButton />
//       </div>
//     )
//   }

//   return (
//     <div className="flex size-full items-center justify-center">
//       <h1>Friday</h1>
//     </div>
//   )
// }
