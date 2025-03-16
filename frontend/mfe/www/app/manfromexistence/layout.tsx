import "@/styles/globals.css"
import { SiteHeader } from "@/components/site-header"

interface RootLayoutProps {
    children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            <div vaul-drawer-wrapper="">
                <div className="relative flex min-h-screen flex-col bg-background">
                    <SiteHeader />
                    <main className="flex-1">{children}</main>
                </div>
            </div>
        </>
    )
}
