'use client'

import { useCategorySidebar } from '@/components/sidebar/category-sidebar'
import { useSubCategorySidebar } from '@/components/sidebar/sub-category-sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MainProps {
  children: React.ReactNode
}

export function Main({ children }: MainProps) {
  const { categorySidebarState } = useCategorySidebar()
  const { subCategorySidebarState } = useSubCategorySidebar()

  return (
    <div
      className={cn(
        'no-scrollbar flex h-screen w-full flex-col overflow-y-auto transition-all duration-200 ease-linear md:pb-0',
        categorySidebarState === 'expanded' && 'pr-64',
        subCategorySidebarState === 'expanded' && 'pr-64'
      )}
    >
      {children}
    </div>
  )
}
