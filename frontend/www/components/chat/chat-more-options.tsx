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

export function MoreActions() {
  const [open, setOpen] = React.useState(false)

  const handleAction = (action: string) => {
    console.log(`Action clicked: ${action}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="absolute hover:bg-muted rounded-full p-1.5 transition-colors left-0 top-0 h-16">
          <EllipsisVertical className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-56 p-0" 
        align="end"
        side="top"
        sideOffset={5}
      >
        <div className="relative z-50">
          <Sidebar collapsible={"none"} className="bg-transparent border-none">
            <SidebarContent>
              {data.map((group, groupIndex) => (
                <SidebarGroup 
                  key={groupIndex} 
                  className="border-b last:border-none"
                >
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, itemIndex) => (
                        <SidebarMenuItem key={itemIndex}>
                          <SidebarMenuButton 
                            onClick={() => handleAction(item.label)}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-muted"
                          >
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </div>
      </PopoverContent>
    </Popover>
  )
}

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
