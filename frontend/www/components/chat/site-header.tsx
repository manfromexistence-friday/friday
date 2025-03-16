"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { LogoIcon } from "@/components/sidebar/team-switcher"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import Link from "next/link"
import { useState } from "react"

// Import navigation items from left sidebar
import { data } from "@/data"

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-background fixed left-0 top-0 z-50 flex h-12 w-full items-center justify-between border-b px-4 lg:hidden">
      <div className="flex items-center gap-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                {data.navMain.map((item:any) => (
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

        <LogoIcon className="size-6" />
      </div>

      <RightSidebar />
    </header>
  )
}