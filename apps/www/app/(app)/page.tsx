import { NavActions } from "@/registry/new-york/blocks/sidebar-10/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/registry/new-york/ui/breadcrumb"
import { Button } from "@/registry/new-york/ui/button"
import { Separator } from "@/registry/new-york/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/registry/new-york/ui/sidebar"
import { Settings, Lock } from "lucide-react"

export default function Page() {
  return (
    <SidebarInset>
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Project Management & Task Tracking
                </BreadcrumbPage>
                <div className="flex items-center justify-center gap-0.5 rounded-full border px-2 py-[2.5px] text-[0.60rem] text-primary">
                  <Lock className="h-[13px] w-[13px]" />
                  <span className="">
                    Private
                  </span>
                </div>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto px-3">
          {/* <NavActions /> */}
          
        </div>
      </header>
    </SidebarInset>
  )
}
