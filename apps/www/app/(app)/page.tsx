"use client"
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

} from "@/registry/new-york/ui/sidebar"
import { Settings, Lock, ChevronsLeftRightIcon, ChevronsDown, ChevronDown, Earth, Type, MessageCircle } from "lucide-react"
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  User,
  UserPlus,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/new-york/ui/dropdown-menu"
import { SidebarProvider, SidebarTrigger } from "@/registry/new-york/ui/sidebar"
import { Sidebar, SidebarContent } from "@/registry/new-york/ui/sidebar"
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import RightSidebar from "@/components/sidebar/right-sidebar"

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/new-york/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/new-york/ui/popover"

const ais = [

  {
    value: "chatgpt",
    label: "ChatGPT"
  },
  {
    value: "bard",
    label: "Bard"
  },
  {
    value: "llama2",
    label: "Llama 2"
  },
  {
    value: "claude",
    label: "Claude"
  },
  {
    value: "dalle2",
    label: "DALL-E 2"
  },
  {
    value: "midjourney",
    label: "Midjourney"
  },
  {
    value: "stable_diffusion",
    label: "Stable Diffusion"
  },
  {
    value: "gpt3",
    label: "GPT-3"
  },
  {
    value: "gpt4",
    label: "GPT-4"
  },
  {
    value: "palm2",
    label: "PaLM 2"
  },
  {
    value: "ernie",
    label: "ERNIE"
  },
  {
    value: "bloom",
    label: "BLOOM"
  },
  {
    value: "jurassic2",
    label: "Jurassic-2"
  },
  {
    value: "cohere",
    label: "Cohere"
  },
  {
    value: "ai21_labs_j2",
    label: "AI21 Labs J2"
  }

]

export function ComboboxDemo() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? ais.find((ai) => ai.value === value)?.label
            : "Select ai..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search ai..." />
          <CommandList>
            <CommandEmpty>No ai found.</CommandEmpty>
            <CommandGroup>
              {ais.map((ai) => (
                <CommandItem
                  key={ai.value}
                  value={ai.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {ai.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === ai.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}


import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/registry/new-york/ui/select"





export function AppSidebar() {
  return (
    <Sidebar side="right">
      <SidebarContent />
    </Sidebar>
  )
}


export default function Page() {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (

    // <SidebarProvider>
    //   <AppSidebar />

    // </SidebarProvider>
    <main className="w-full">
      <header className="flex h-12 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Project Management & Task Tracking
                </BreadcrumbPage>
                <div className="flex items-center justify-center gap-1 rounded-full border px-2 py-1 hover:bg-primary-foreground hover:text-primary ">
                  <Earth className="h-[13px] w-[13px]" />
                  <span className="h-full text-[10px]">
                    Public
                  </span>
                </div>
                {/* <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select> */}
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center justify-center gap-1 rounded-md border p-2 hover:bg-primary-foreground hover:text-primary">
                      <Earth className="h-[13px] w-[13px]" />
                      <span className="h-full">
                        Public
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>
                      <Lock />
                      <span>Private</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lock />
                      <span>Unlisted</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3">
          {/* <NavActions /> */}
          {/* <SidebarTrigger /> */}
          <div className="flex h-9 items-center justify-center gap-1 rounded-md border px-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary-foreground">
              <MessageCircle className="h-4 w-4" />
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-primary-foreground">
              <Type className="h-4 w-4" />
            </div>
          </div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="min-w-[100px] justify-between px-2"
              >
                {value
                  ? ais.find((ai) => ai.value === value)?.label
                  : "Friday"}
                <ChevronDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mr-2 w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search ai..." />
                <CommandList>
                  <CommandEmpty>No ai found.</CommandEmpty>
                  <CommandGroup>
                    {ais.map((ai) => (
                      <CommandItem
                        key={ai.value}
                        value={ai.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        {ai.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            value === ai.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <RightSidebar />
        </div>
      </header>
    </main>
  )
}
