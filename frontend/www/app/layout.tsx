import "@/styles/globals.css"
import { Metadata, Viewport } from "next"

import { META_THEME_COLORS, siteConfig } from "@/config/site"
import { fontMono, fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { Toaster as NewYorkSonner } from "@/components/ui/sonner"
import {
  Toaster as DefaultToaster,
  Toaster as NewYorkToaster,
} from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/providers"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { FirebaseProvider } from '@/contexts/firebase-context'
import { AuthProvider } from '@/contexts/auth-context'
// import { AntdRegistry } from '@ant-design/nextjs-registry';
import { SidebarProvider } from "@/components/ui/sidebar"
import LeftSidebar from "@/components/sidebar/left-sidebar"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // disable automatic refetch on window focus
      retry: 1, // retry failed requests just once
    },
  },
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  metadataBase: new URL(siteConfig.url),
  description: siteConfig.description,
  keywords: ["Friday", "Multiverse", "Hello", "Aladdin", "Dx"],
  authors: [
    {
      name: "manfromexistence",
      url: "https://manfromexistence.com",
    },
  ],
  creator: "manfromexistence",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@manfromexistence",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
            }}
          />
        </head>
        <body
          className={cn(
            "bg-background min-h-svh font-sans antialiased",
            fontSans.variable,
            fontMono.variable
          )}
        >
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
                  <div vaul-drawer-wrapper="">
                    <SidebarProvider>
                      <LeftSidebar />
                      <div className="relative flex min-h-svh flex-col h-screen w-screen">{children}</div>
                    </SidebarProvider>
                  </div>
                  {/* <TailwindIndicator /> */}
                  <ThemeSwitcher />
                  <Analytics />
                  <NewYorkToaster />
                  <DefaultToaster />
                  <NewYorkSonner />
                </AuthProvider>
              </FirebaseProvider>
            </ThemeProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </body>
      </html>
    </>
  )
}
