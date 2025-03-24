'use client'

import * as React from 'react'
import { ais, data } from '@/data'
import { aiService } from '@/lib/services/ai-service'
import { Check, ChevronDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Globe, Paperclip, Send, CircleDotDashed } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InputActionsProps {
  isLoading: boolean
  showSearch: boolean
  showResearch: boolean
  value: string
  selectedAI: string // Add this new prop
  imagePreview: string | null
  onSubmit: () => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  onImageUpload: (file: File | null) => void
  onAIChange: (aiModel: string) => void // Add this new prop
}

export function InputActions({
  isLoading,
  showSearch,
  showResearch,
  value,
  selectedAI, // New prop
  imagePreview,
  onSubmit,
  onSearchToggle,
  onResearchToggle,
  onImageUpload,
  onAIChange, // New prop
}: InputActionsProps) {
  const [aiOpen, setAiOpen] = React.useState(false)

  return (
    <div className="mt-2 h-12 rounded-b-xl">
      <div className="absolute bottom-3 left-3 flex max-w-[50%] items-center gap-1">
        <Popover open={aiOpen} onOpenChange={setAiOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={aiOpen}
              className="bg-primary-foreground hover:bg-secondary h-8 w-full min-w-[50px] justify-between px-2 text-xs sm:min-w-[150px] md:w-[200px] md:min-w-[180px]"
            >
              <span className="mr-1 flex-1 truncate text-start">
                {selectedAI ? ais.find((ai) => ai.value === selectedAI)?.label : 'Gemini 2.0 Flash'}
              </span>
              <ChevronDown className="shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-[100000] mr-2 w-[var(--radix-popover-trigger-width)] p-0 text-xs">
            <Command className="bg-primary-foreground">
              <CommandInput placeholder="Search ai..." />
              <CommandList className="overflow-hidden">
                <CommandEmpty>No ai found.</CommandEmpty>
                <CommandGroup className="px-0">
                  <ScrollArea className="h-max max-h-[300px] px-1.5">
                    {ais.map((ai) => (
                      <CommandItem
                        className="text-xs"
                        key={ai.value}
                        value={ai.value}
                        onSelect={(currentValue) => {
                          const newValue = currentValue === selectedAI ? '' : currentValue
                          onAIChange(newValue)
                          aiService.setModel(newValue || 'gemini-2.0-flash')
                          setAiOpen(false)
                        }}
                      >
                        <span className="w-[20px] max-w-full flex-1 truncate">{ai.label}</span>
                        <Check
                          className={cn(
                            'ml-auto',
                            selectedAI === ai.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                      </CommandItem>
                    ))}
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Rest of the component (buttons on right) remains the same */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1">
        {/* Research Button */}
        <motion.button
          type="button"
          onClick={onResearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 items-center gap-2 rounded-full border px-1.5 py-1 transition-all',
            showResearch
              ? 'bg-background text-muted-foreground hover:text-primary border'
              : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              rotate: showResearch ? 180 : 0,
              scale: showResearch ? 1.1 : 1,
            }}
            whileHover={{
              rotate: showResearch ? 180 : 15,
              scale: 1.1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 25,
            }}
          >
            <CircleDotDashed
              className={cn(
                'size-4',
                showResearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showResearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Research
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Search Button */}
        <motion.button
          type="button"
          onClick={onSearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 items-center gap-1 rounded-full border px-2 py-0.5 transition-all',
            showSearch
              ? 'bg-background text-muted-foreground hover:text-primary border'
              : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              rotate: showSearch ? 180 : 0,
              scale: showSearch ? 1.1 : 1,
            }}
            whileHover={{
              rotate: showSearch ? 180 : 15,
              scale: 1.1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 25,
            }}
          >
            <Globe
              className={cn(
                'size-4',
                showSearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showSearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Search
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* File Upload Button */}
        <label
          className={cn(
            'relative cursor-pointer rounded-full p-2',
            imagePreview ? 'bg-background text-primary border' : 'text-muted-foreground',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Paperclip
              className={cn(
                'text-muted-foreground hover:text-primary size-4 transition-colors',
                imagePreview && 'text-primary',
                isLoading && 'opacity-50'
              )}
            />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              disabled={isLoading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImageUpload(file)
              }}
            />
          </motion.div>
        </label>

        {/* Send Button */}
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className={cn(
            'text-muted-foreground hover:text-primary rounded-full p-2 transition-colors',
            value && !isLoading
              ? 'text-primary'
              : 'text-muted-foreground cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Send className="size-4" />
        </motion.button>
      </div>
    </div>
  )
}
