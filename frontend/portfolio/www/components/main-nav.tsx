"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

export function MainNav() {
  const pathname = usePathname()
  return (
    <div className="mr-4 hidden md:flex">
      {/* <Link href="/manfromexistence/" className="mr-4 flex items-center space-x-2 lg:mr-6">
        <Icons.logo className="h-6 w-6" />
        <span className="hidden font-bold lg:inline-block">
          {siteConfig.name}
        </span>
      </Link> */}
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          href="/manfromexistence"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname === "/manfromexistence" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Home
        </Link>
        <Link
          href="/manfromexistence/thoughts"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/manfromexistence/thoughts")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Thoughts
        </Link>
        <Link
          href="/manfromexistence/works"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/manfromexistence/works")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Works
        </Link>
        <Link
          href="/manfromexistence/lists"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/manfromexistence/lists")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Lists
        </Link>
        <Link
          href="/manfromexistence/gaming"
          className={cn(
            "transition-colors hover:text-foreground/80",
            pathname?.startsWith("/manfromexistence/gaming")
              ? "text-foreground"
              : "text-foreground/60"
          )}
        >
          Gaming
        </Link>
      </nav>
    </div>
  )
}
