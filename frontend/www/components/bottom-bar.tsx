"use client"

import Link from "next/link"
import { Home, Sparkles, CircleSlash2, LibraryBig, Ellipsis } from "lucide-react"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"

export function BottomBar() {
  const params = useParams()
  const navItems = [
    {
      href: "/home",
      icon: Home,
      label: "Home"
    },
    {
      href: "/automations",
      icon: Sparkles,
      label: "Automations"  
    },
    {
      href: "/variants",
      icon: CircleSlash2,
      label: "Variants"
    },
    {
      href: "/library",
      icon: LibraryBig,
      label: "Library"
    },
    {
      href: "/more",
      icon: Ellipsis,
      label: "More"
    }
  ]

  return (
    <nav className="bg-background fixed bottom-0 left-0 z-50 flex h-12 w-full items-center justify-around border-t md:hidden lg:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={{ pathname: item.href }}
          className={cn(
            "flex flex-col items-center gap-1",
            params?.slug === item.href.replace("/", "") 
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <item.icon className="size-4" />
          <span className="text-[8.5px]">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}