'use client'

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import Friday from './friday/friday'
import * as React from 'react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useCategorySidebar } from '@/components/sidebar/category-sidebar'
import { NavActions } from '@/components/sidebar/nav-actions'
import { useSubCategorySidebar } from '@/components/sidebar/sub-category-sidebar'
import { CategoryRightSidebar, SubCategoryRightSidebar } from '@/components/sidebar/right-sidebar'
import { usePathname } from 'next/navigation'
import {
  User as FirebaseUser,
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/components/ui/sidebar'
import {
  BadgeCheck,
  Bell,
  MessageCircle,
  Type,
  CreditCard,
  LogOut,
  Sparkles,
  Key,
} from 'lucide-react'
import { History } from '@/components/sidebar/history'
import ThemeToggleButton from '@/components/ui/theme-toggle-button'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { GlobeIcon, LockIcon, EyeOff, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { SidebarProvider } from '@/components/sidebar/actions-sidebar'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { AnimationStart, AnimationVariant, createAnimation } from '@/components/ui/theme-animations'

type ChatVisibility = 'public' | 'private' | 'unlisted'

interface ChatData {
  id: string
  title: string
  visibility: ChatVisibility
  createdAt: string
  updatedAt: string
  creatorUid: string
}

const visibilityConfig = {
  public: {
    icon: <GlobeIcon className="size-1.5" />,
    text: 'Public',
    description: 'Visible to everyone',
  },
  private: {
    icon: <LockIcon className="size-1.5" />,
    text: 'Private',
    description: 'Only visible to you',
  },
  unlisted: {
    icon: <EyeOff className="size-1.5" />,
    text: 'Unlisted',
    description: 'Only accessible via link',
  },
} as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { categorySidebarState, categorySidebarToggleSidebar } = useCategorySidebar()
  const { subCategorySidebarState, subCategorySidebarToggleSidebar } = useSubCategorySidebar()
  const { user } = useAuth()
  const { isMobile, state: leftSidebarState } = useSidebar() // Add leftSidebarState from useSidebar
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const params = useParams()
  const queryClient = useQueryClient()
  const [isChangingVisibility, setIsChangingVisibility] = useState(false)
  const { theme, setTheme } = useTheme()

  const styleId = 'theme-transition-styles'

  const updateStyles = React.useCallback((css: string, name: string) => {
    if (typeof window === 'undefined') return

    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    console.log('style ELement', styleElement)
    console.log('name', name)

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    styleElement.textContent = css

    console.log('content updated')
  }, [])

  const toggleTheme = React.useCallback(() => {
    const animation = createAnimation(
      'gif',
      'center',
      'https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s'
    )

    updateStyles(animation.css, animation.name)

    if (typeof window === 'undefined') return

    const switchTheme = () => {
      setTheme(theme === 'light' ? 'dark' : 'light')
    }

    if (!document.startViewTransition) {
      switchTheme()
      return
    }

    document.startViewTransition(switchTheme)
  }, [theme, setTheme, updateStyles])

  const { data: chatData, isLoading } = useQuery<ChatData | null>({
    queryKey: ['chat', params?.slug],
    queryFn: async () => {
      if (!params?.slug) return null

      // Try to get from cache first
      const cachedData = queryClient.getQueryData(['chat', params.slug])
      if (cachedData) return cachedData as ChatData

      const chatRef = doc(db, 'chats', params.slug as string)
      const chatDoc = await getDoc(chatRef)

      if (!chatDoc.exists()) {
        return null
      }

      const data = {
        id: chatDoc.id,
        ...(chatDoc.data() as Omit<ChatData, 'id'>),
      }

      return data
    },
    enabled: !!params?.slug,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep unused data in garbage collection for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch when component mounts
  })

  // Add real-time updates with optimistic UI
  useEffect(() => {
    if (!params?.slug) return

    const chatRef = doc(db, 'chats', params.slug as string)
    const unsubscribe = onSnapshot(chatRef, (doc) => {
      if (doc.exists()) {
        const data = {
          id: doc.id,
          ...doc.data(),
        }
        queryClient.setQueryData(['chat', params.slug], data)
      }
    })

    return () => unsubscribe()
  }, [params?.slug, queryClient])

  useEffect(() => {
    // Update URL with chat session ID if needed
    if (chatData && params?.slug && pathname !== `/chat/${chatData.id}`) {
      router.replace(`/chat/${chatData.id}`)
    }
  }, [chatData, params?.slug, pathname, router])

  const title = chatData?.title || ''
  const visibility = chatData?.visibility || 'public'

  const handleVisibilityChange = async (newVisibility: ChatVisibility) => {
    if (!params?.slug || newVisibility === visibility) return

    setIsChangingVisibility(true)
    try {
      const chatRef = doc(db, 'chats', params.slug as string)
      await updateDoc(chatRef, {
        visibility: newVisibility,
        updatedAt: new Date().toISOString(),
      })

      // Update React Query cache with proper typing
      queryClient.setQueryData<ChatData | null>(['chat', params.slug], (oldData) => {
        if (!oldData) return null
        return {
          ...oldData,
          visibility: newVisibility,
          updatedAt: new Date().toISOString(),
        }
      })

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    } catch (error) {
      console.error('Error updating visibility:', error)
    } finally {
      setIsChangingVisibility(false)
    }
  }

  // Firebase user data
  const userImage = (user as FirebaseUser)?.photoURL
  const userName = (user as FirebaseUser)?.displayName
  const userEmail = (user as FirebaseUser)?.email
  const fallbackInitial = userName?.[0] || userEmail?.[0]?.toUpperCase() || 'U'

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await signOut(getAuth())
      router.push('/') // Redirect to home page
      toast.success('Successfully logged out')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to log out. Please try again.')
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
      toast.success('Successfully logged in')
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to log in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Get route name
  const getRouteName = () => {
    if (pathname === '/') return 'Home'
    const lastSegment = pathname ? pathname.split('/').pop() : undefined
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : 'Home'
  }

  // Check if route is chat related
  const isChatRoute = pathname?.startsWith('/chat') ?? false

  const handleCategorySidebarToggle = () => {
    categorySidebarToggleSidebar()
    if (subCategorySidebarState === 'expanded') {
      subCategorySidebarToggleSidebar()
    }
  }

  const handleSubCategorySidebarToggle = () => {
    subCategorySidebarToggleSidebar()
    if (categorySidebarState === 'expanded') {
      categorySidebarToggleSidebar()
    }
  }

  const renderChatHeader = () => {
    if (!params?.slug) return null

    if (isLoading) {
      return (
        <div className="flex items-center gap-1">
          <div className="bg-muted h-7 w-24 animate-pulse rounded"></div>
          <div className="bg-muted h-7 w-16 animate-pulse rounded"></div>
        </div>
      )
    }

    if (!chatData) return null

    return (
      <>
        <div className="xs:block xs:max-w-[85px] relative hidden max-w-[50px] overflow-hidden sm:max-w-[200px] md:max-w-[250px]">
          <span className="block truncate text-[13px] font-medium">
            {chatData.title || 'Untitled Chat'}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="2xs:flex hover:bg-primary-foreground hover:text-primary h-7 items-center justify-center gap-1.5 rounded-full border px-2 md:flex"
              disabled={isChangingVisibility}
            >
              {isChangingVisibility ? (
                <>
                  <Loader2 className="size-[13px] animate-spin" />
                  <span className="flex h-full items-center text-[10px]">Changing...</span>
                </>
              ) : (
                <>
                  {visibilityConfig[chatData.visibility || 'public'].icon}
                  <span className="flex h-full items-center text-[10px]">
                    {visibilityConfig[chatData.visibility || 'public'].text}
                  </span>
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {Object.entries(visibilityConfig)
              .filter(([key]) => key !== visibility)
              .map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleVisibilityChange(key as ChatVisibility)}
                  className="flex items-center gap-2"
                  disabled={isChangingVisibility}
                >
                  {config.icon}
                  <div className="flex flex-col">
                    <span className="text-sm">{config.text}</span>
                    <span className="text-muted-foreground text-xs">{config.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  return (
    <header
      className={cn(
        'bg-background fixed top-0 z-40 flex h-12 items-center justify-between border-b px-2',
        // Add transition for smooth changes
        'transition-all duration-200 ease-linear',
        // Base width and position - full width on mobile, default md width with 48px offset
        'left-0 w-full md:w-[calc(100%-48px)]',

        // Left sidebar positioning (after md breakpoint)
        leftSidebarState === 'expanded'
          ? 'w-[calc(100%-256px)] md:left-64' // When left sidebar is expanded
          : 'md:left-12', // When collapsed

        // Width calculations based on sidebar states and viewport
        // When left sidebar is expanded
        leftSidebarState === 'expanded' &&
          categorySidebarState !== 'expanded' &&
          subCategorySidebarState !== 'expanded'
          ? 'md:w-[calc(100%-256px)]'
          : '',

        // When left sidebar is expanded + category sidebar
        leftSidebarState === 'expanded' &&
          categorySidebarState === 'expanded' &&
          subCategorySidebarState !== 'expanded'
          ? 'md:w-[calc(100%-256px)]'
          : '',

        // When left sidebar is expanded + subCategory sidebar
        leftSidebarState === 'expanded' &&
          categorySidebarState !== 'expanded' &&
          subCategorySidebarState === 'expanded'
          ? 'md:w-[calc(100%-256px)] '
          : '',

        categorySidebarState === 'expanded' ? 'w-[calc(100%-256px)]' : '',
        subCategorySidebarState === 'expanded' ? 'w-[calc(100%-256px)]' : ''
      )}
    >
      {/* Header content */}
      <div className="flex items-center">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <div className="md:text-muted-foreground hover:text-primary mr-1 flex size-8 items-center justify-center rounded-md border md:hidden">
              <Menu className="size-4" />
            </div>
            {/* <Button variant="outline" size="icon" className="size-7 md:hidden">
              <Menu className="size-4" />
            </Button> */}
          </SheetTrigger>
          <SheetContent side="left" className="z-[10000] w-[280px] p-0">
            <ScrollArea className="h-full">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-1 px-6">
                  <Friday className="mt-[5px] size-8" />
                  <span className="font-semibold">Friday</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-2">
                <History />
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        {!pathname?.startsWith('/chat') ? (
          <>
            <Friday className="md:hidden" orbSize={25} shapeSize={21} />
            <span className="hidden md:flex">{pathname === '/' ? 'Home' : pathname}</span>
          </>
        ) : (
          <div className="flex h-12 items-center gap-1">{renderChatHeader()}</div>
        )}
      </div>
      <div className="flex max-h-12 items-center space-x-0">
        {isChatRoute && (
          <SidebarProvider>
            <NavActions />
          </SidebarProvider>
        )}

        <div className="xs:flex hover:bg-primary-foreground mr-1 hidden h-8 items-center justify-center gap-1 rounded-md border px-1.5 md:mr-0">
          <div
            onClick={handleCategorySidebarToggle}
            className="hover:bg-secondary flex size-6 items-center justify-center rounded-md"
          >
            <MessageCircle
              className={cn(
                categorySidebarState === 'expanded'
                  ? 'md:text-primary'
                  : 'md:text-muted-foreground',
                'text-primary md:hover:text-primary size-4'
              )}
            />
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div
            onClick={handleSubCategorySidebarToggle}
            className="hover:bg-secondary flex size-6 items-center justify-center rounded-md"
          >
            <Type
              className={cn(
                'text-primary md:hover:text-primary size-4',
                subCategorySidebarState === 'expanded'
                  ? 'md:text-primary'
                  : 'md:text-muted-foreground'
              )}
            />
          </div>
        </div>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="size-8 cursor-pointer rounded-lg md:hidden">
                <AvatarImage src={userImage ?? undefined} alt={userName || 'User'} />
                <AvatarFallback className="rounded-lg">{fallbackInitial}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? 'bottom' : 'right'}
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
                  <Sparkles className="mr-2 size-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <BadgeCheck className="mr-2 size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 size-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 size-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === 'light' ? (
                  <MoonIcon className="mr-2 size-4" />
                ) : (
                  <SunIcon className="mr-2 size-4" />
                )}
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 size-4" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="md:text-muted-foreground md:hover:text-primary md:hidden"
            onClick={handleLogin}
          >
            Sign in
          </Button>
        )}
        {/* Remove any margin from the right sidebars */}
        <div className="m-0 flex items-center gap-0 space-x-0 p-0">
          <CategoryRightSidebar className="m-0 p-0" />
          <SubCategoryRightSidebar className="m-0 p-0" />
        </div>
      </div>
    </header>
  )
}
