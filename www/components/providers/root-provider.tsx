"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "@/components/providers/providers"
import { FirebaseProvider } from '@/contexts/firebase-context'
import { AuthProvider } from '@/contexts/auth-context'
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import { CategorySidebarProvider } from "@/components/sidebar/category-sidebar"
import { SubCategorySidebarProvider } from "@/components/sidebar/sub-category-sidebar"
import { SiteHeader } from "@/components/site-header"
import { BottomBar } from "@/components/bottom-bar"
import LeftSidebar from "@/components/sidebar/left-sidebar"
import { Main } from "@/components/providers/main"
import {
  Toaster as DefaultToaster,
  Toaster as NewYorkToaster,
} from "@/components/ui/toaster"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

interface RootProviderProps {
  children: React.ReactNode
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        enableColorScheme
      >
        <FirebaseProvider>
          <AuthProvider>
            <SidebarProvider>
              <LeftSidebar />
              <CategorySidebarProvider>
                <SubCategorySidebarProvider>
                  <div vaul-drawer-wrapper="" className="relative h-screen w-full overflow-hidden">
                    <SiteHeader />
                    <Main>{children}</Main>
                    <BottomBar />
                    <NewYorkToaster />
                    <DefaultToaster />
                    <NewYorkSonner />
                  </div>
                </SubCategorySidebarProvider>
              </CategorySidebarProvider>
            </SidebarProvider>
          </AuthProvider>
        </FirebaseProvider>
      </ThemeProvider>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  )
}
