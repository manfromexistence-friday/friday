import { Button } from "@/components/ui/button"
import { Beaker, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"

export default function VariantsBetaPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
            {/* Background elements */}
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-muted/80 blur-3xl" />
            <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-muted/50 blur-3xl" />

            {/* Beta indicator */}
            <div className="mb-8 flex items-center gap-2 rounded-full bg-card/90 px-4 py-2 shadow-sm border border-border">
                <Beaker className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">More Page</span>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-2xl text-center">
                <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Friday</span> is in beta
                </h1>

                <p className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                    This page will be added soon. Till then stay tuned for updates as we perfect the experience.
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <a href="mailto:ajju40959@gmail.com">
                        <Button className="gap-2 px-6 shadow-lg transition-all hover:shadow-primary/20 hover:scale-105">
                            <Bell className="h-4 w-4" />
                            Get notified
                        </Button>
                    </a>
                    <Link href="/">
                        <Button variant="secondary" className="gap-2 border border-border transition-all hover:bg-secondary/80">
                            Explore other features
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-8 flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
                <div className="flex gap-6">
                    <a href="https://www.youtube.com/channel/UCK0IEdLWxA2EFgucri7z4SA" className="transition-colors hover:text-primary hover:underline">
                        Help Center
                    </a>
                    <a href="https://x.com/manfrexistence" className="transition-colors hover:text-primary hover:underline">
                        Contact Support
                    </a>
                    <a href="https://github.com/manfromexistence" className="transition-colors hover:text-primary hover:underline">
                        Roadmap
                    </a>
                </div>
                <p className="text-muted-foreground/70">© 2025 Friday. All rights reserved.</p>
            </div>
        </div>
    )
}
