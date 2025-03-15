"use client"

import { useState } from "react"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Key,
  Sparkles,
  LogInIcon,
} from "lucide-react"
import { User as FirebaseUser, getAuth, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface NavUserProps {
  name: string;
  email: string;
  avatar: string;
}
export function NavUser({ name, email, avatar }: NavUserProps) {
  const { user } = useAuth()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Firebase user data
  const userImage = (user as FirebaseUser)?.photoURL
  const userName = (user as FirebaseUser)?.displayName
  const userEmail = (user as FirebaseUser)?.email
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || "U"

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut(getAuth())
      router.push("/") // Redirect to home page
      toast.success("Successfully logged out")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to log out. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      toast.success("Successfully logged in")
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error("Failed to log in. Please try again.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="min-h-8 min-w-8 flex items-center justify-center rounded-lg">
              <Key className="h-4 w-4" />
            </div>
            {isLoggingIn ? "Signing in..." : "Sign in with Google"}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={!user ? "./user.png" : userImage ?? undefined} alt={userName || 'User'} />
                <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sm">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userImage ?? undefined} alt={userName || 'User'} />
                  <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-sm">{userName}</span>
                <span className="truncate text-xs">{userEmail}</span>
              </div>

              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
