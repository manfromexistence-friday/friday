import Link from "next/link"
import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { EyeCatchingButton_v1 } from "@/components/eye-catching-buttons"
import { Play } from "lucide-react"
import { ModeSwitcher } from "./mode-switcher"
import ThemeToggleButton from "./ui/theme-toggle-button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl items-center">
        <MainNav />
        <MobileNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggleButton
              showLabel
              variant="gif"
              url="https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s"
            />
            <Link target="_blank" href={"https://www.upwork.com/freelancers/~01221bf135ed62b3b3"}>
              <EyeCatchingButton_v1 className="text-sm">
                <Play className="mr-1 size-4" />
                Start a Project
              </EyeCatchingButton_v1>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}