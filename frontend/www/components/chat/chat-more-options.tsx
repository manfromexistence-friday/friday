import { Download, Share2, EllipsisVertical } from 'lucide-react'
import * as React from "react"
import {
  Bell,
  FileText,
  LineChart,
  Star,
  Trash2,
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar/actions-sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const data = [
  [
    {
      label: "Save to Favorites",
      icon: Star,
    },
    {
      label: "Share Response",
      icon: Share2,
    }
  ],
  [
    {
      label: "Download as PDF",
      icon: FileText,
    },
    {
      label: "Download as Text",
      icon: Download,
    }
  ],
  [
    {
      label: "View Analytics",
      icon: LineChart,
    },
    {
      label: "Report Issue",
      icon: Bell,
    }
  ],
  [
    {
      label: "Delete Response",
      icon: Trash2,
    }
  ]
]

export function MoreActions() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex items-center text-sm">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="hover:bg-muted rounded-full p-1.5 transition-colors"
                >
                  <EllipsisVertical className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}
