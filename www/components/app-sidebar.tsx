import * as React from "react"

import {
  CodeSidebar,
  CodeSidebarContent,
  CodeSidebarGroup,
  CodeSidebarGroupContent,
  CodeSidebarGroupLabel,
  CodeSidebarMenu,
  CodeSidebarMenuButton,
  CodeSidebarMenuItem,
  CodeSidebarMenuSub,
  CodeSidebarMenuSubButton,
  CodeSidebarMenuSubItem,
  CodeSidebarRail,
} from "@/app/dashboard/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Installation",
          url: "#",
        },
        {
          title: "Project Structure",
          url: "#",
        },
      ],
    },
    {
      title: "Building Your Application",
      url: "#",
      items: [
        {
          title: "Routing",
          url: "#",
        },
        {
          title: "Data Fetching",
          url: "#",
          isActive: true,
        },
        {
          title: "Rendering",
          url: "#",
        },
        {
          title: "Caching",
          url: "#",
        },
        {
          title: "Styling",
          url: "#",
        },
        {
          title: "Optimizing",
          url: "#",
        },
        {
          title: "Configuring",
          url: "#",
        },
        {
          title: "Testing",
          url: "#",
        },
        {
          title: "Authentication",
          url: "#",
        },
        {
          title: "Deploying",
          url: "#",
        },
        {
          title: "Upgrading",
          url: "#",
        },
        {
          title: "Examples",
          url: "#",
        },
      ],
    },
    {
      title: "API Reference",
      url: "#",
      items: [
        {
          title: "Components",
          url: "#",
        },
        {
          title: "File Conventions",
          url: "#",
        },
        {
          title: "Functions",
          url: "#",
        },
        {
          title: "next.config.js Options",
          url: "#",
        },
        {
          title: "CLI",
          url: "#",
        },
        {
          title: "Edge Runtime",
          url: "#",
        },
      ],
    },
    {
      title: "Architecture",
      url: "#",
      items: [
        {
          title: "Accessibility",
          url: "#",
        },
        {
          title: "Fast Refresh",
          url: "#",
        },
        {
          title: "Next.js Compiler",
          url: "#",
        },
        {
          title: "Supported Browsers",
          url: "#",
        },
        {
          title: "Turbopack",
          url: "#",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      items: [
        {
          title: "Contribution Guide",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof CodeSidebar>) {
  return (
    <CodeSidebar {...props} variant="floating">
      <CodeSidebarContent>
        <CodeSidebarGroup>
          <CodeSidebarGroupLabel>Table of Contents</CodeSidebarGroupLabel>
          <CodeSidebarGroupContent>
            <CodeSidebarMenu>
              {data.navMain.map((item) => (
                <CodeSidebarMenuItem key={item.title}>
                  <CodeSidebarMenuButton asChild>
                    <a href={item.url} className="font-medium">
                      {item.title}
                    </a>
                  </CodeSidebarMenuButton>
                  {item.items?.length ? (
                    <CodeSidebarMenuSub>
                      {item.items.map((item) => (
                        <CodeSidebarMenuSubItem key={item.title}>
                          <CodeSidebarMenuSubButton
                            asChild
                            isActive={item.isActive}
                          >
                            <a href={item.url}>{item.title}</a>
                          </CodeSidebarMenuSubButton>
                        </CodeSidebarMenuSubItem>
                      ))}
                    </CodeSidebarMenuSub>
                  ) : null}
                </CodeSidebarMenuItem>
              ))}
            </CodeSidebarMenu>
          </CodeSidebarGroupContent>
        </CodeSidebarGroup>
      </CodeSidebarContent>
      <CodeSidebarRail />
    </CodeSidebar>
  )
}
