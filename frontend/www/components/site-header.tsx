"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LogoIcon } from "@/components/sidebar/team-switcher"
import Link from "next/link"
import { data } from "@/data"
import Friday from "./friday/friday"
import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCategorySidebar } from "@/components/sidebar/category-sidebar"
import { NavActions } from "@/components/sidebar/nav-actions"
import { useSubCategorySidebar } from "@/components/sidebar/sub-category-sidebar"
import { CategoryRightSidebar, SubCategoryRightSidebar } from "@/components/sidebar/right-sidebar"
import { usePathname } from "next/navigation"
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
import {
  BadgeCheck,
  Bell,
  MessageCircle,
  Type,
  CreditCard,
  LogOut,
  Key,
  Sparkles,
} from "lucide-react"

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar()
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar()
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

  // Get route name
  const getRouteName = () => {
    if (pathname === "/") return "Home"
    const lastSegment = pathname ? pathname.split("/").pop() : undefined
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : "Home"
  }

  // Check if route is chat related
  const isChatRoute = pathname?.startsWith("/chat") ?? false

  const handleCategorySidebarToggle = () => {
    categorySidebarToggleSidebar()
    if (subCategorySidebarState === "expanded") {
      subCategorySidebarToggleSidebar()
    }
  }

  const handleSubCategorySidebarToggle = () => {
    subCategorySidebarToggleSidebar()
    if (categorySidebarState === "expanded") {
      categorySidebarToggleSidebar()
    }
  }

  // if (!user) {
  //   return (
  //     <SidebarMenu>
  //       <SidebarMenuItem>
  //         <SidebarMenuButton
  //           size="lg"
  //           onClick={handleLogin}
  //           disabled={isLoggingIn}
  //           className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
  //         >
  //           <div className="flex min-h-8 min-w-8 items-center justify-center rounded-lg">
  //             <Key className="size-4" />
  //           </div>
  //           {isLoggingIn ? "Signing in..." : "Sign in with Google"}
  //         </SidebarMenuButton>
  //       </SidebarMenuItem>
  //     </SidebarMenu>
  //   )
  // }

  return (
    <header className="bg-background absolute left-0 top-0 z-50 flex h-12 w-full items-center justify-between border-b pl-2 pr-1.5">
      <div className="flex items-center gap-1 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <ScrollArea className="h-full py-4">
              <div className="mb-4 flex items-center gap-2 px-4">
                <LogoIcon className="size-8" />
                <span className="font-semibold">V0</span>
              </div>

              <div className="flex flex-col gap-1 px-2">
                <Link
                  href="/chat"
                  className="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <span>Start New</span>
                </Link>
                {data.navMain.map((item: any) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    className="flex items-center gap-2 rounded-md px-4 py-2 hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        <Friday orbSize={25} shapeSize={21} />
      </div>
      <span className="hidden md:flex">{getRouteName()}</span>
      <div className="flex max-h-12 items-center">
        {isChatRoute && <NavActions />}
        <div className="hover:bg-primary-foreground flex h-8 items-center justify-center gap-1 rounded-md border px-1.5 mr-1.5 md:mr-0">
          <div
            onClick={handleCategorySidebarToggle}
            className="hover:bg-background flex size-6 items-center justify-center rounded-md"
          >
            <MessageCircle
              className={cn(
                categorySidebarState === "expanded"
                  ? "text-primary"
                  : "text-muted-foreground",
                "size-4"
              )}
            />
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div
            onClick={handleSubCategorySidebarToggle}
            className="hover:bg-background flex size-6 items-center justify-center rounded-md"
          >
            <Type
              className={cn(
                subCategorySidebarState === "expanded"
                  ? "text-primary"
                  : "text-muted-foreground",
                "size-4"
              )}
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-8 rounded-lg md:hidden">
              <AvatarImage src={!user ? "./user.png" : userImage ?? undefined} alt={userName || 'User'} />
              <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={userImage ?? undefined} alt={userName || 'User'} />
                  <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate text-sm font-semibold">{userName}</span>
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
              <LogOut className="mr-2 size-4" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CategoryRightSidebar className="ml-0" />
        <SubCategoryRightSidebar className="ml-0" />
      </div>
    </header>
  )
}