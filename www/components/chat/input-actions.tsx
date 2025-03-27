'use client'

import * as React from 'react'
import { Globe, Paperclip, ArrowUp, CircleDotDashed, Lightbulb } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InputActionsProps {
  isLoading: boolean
  showSearch: boolean
  showResearch: boolean
  showThinking: boolean
  value: string
  selectedAI: string // Add this new prop
  imagePreview: string | null
  onSubmit: () => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  onThinkingToggle: () => void
  onImageUpload: (file: File | null) => void
  onAIChange: (aiModel: string) => void // Add this new prop
}

export function InputActions({
  isLoading,
  showSearch,
  showResearch,
  showThinking,
  value,
  selectedAI, // New prop
  imagePreview,
  onSubmit,
  onSearchToggle,
  onResearchToggle,
  onThinkingToggle,
  onImageUpload,
  onAIChange, // New prop
}: InputActionsProps) {
  const [aiOpen, setAiOpen] = React.useState(false)

  return (
    <div className="h-12 rounded-b-xl flex flex-row justify-between px-2.5">
      <div className="flex flex-row items-center h-full gap-2.5">
        {/* File Upload Button */}
        <label
          className={cn(
            'relative cursor-pointer rounded-full',
            imagePreview ? 'bg-background text-primary border' : 'text-muted-foreground',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
        >
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Paperclip
              className={cn(
                'text-muted-foreground hover:text-primary size-4 transition-colors',
                imagePreview && 'text-primary',
                isLoading && 'cursor-not-allowed opacity-50'
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

        {/* Search Button */}
        <motion.button
          type="button"
          onClick={onSearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showSearch
              ? 'bg-background border px-2'
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
                'size-4 hover:text-primary',
                showSearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
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

        {/* Research Button */}
        <motion.button
          type="button"
          onClick={onResearchToggle}
          disabled={isLoading}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showResearch
              ? 'bg-background border px-2'
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
                'size-4 hover:text-primary',
                showResearch ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
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

        {/* Think Button */}
        <motion.button
          type="button"
          onClick={() => {
            console.log("Toggling thinking mode:", !showThinking);
            onThinkingToggle();
          }}
          disabled={isLoading}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-full border transition-all text-muted-foreground hover:text-primary',
            showThinking
              ? 'bg-background border px-2'
              : 'border-transparent',
            isLoading && 'cursor-not-allowed opacity-50'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{
              rotate: showThinking ? 360 : 0,
              scale: showThinking ? 1.1 : 1
            }}
            whileHover={{
              rotate: showThinking ? 360 : 15,
              scale: 1.1,
            }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 25,
            }}
          >
            <Lightbulb
              className={cn(
                'size-4 hover:text-primary',
                showThinking ? 'text-primary' : 'text-muted-foreground',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            />
          </motion.div>
          <AnimatePresence>
            {showThinking && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Think
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>


        {/* <Popover open={aiOpen} onOpenChange={setAiOpen}>
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
        </Popover> */}
      </div>

      <div className="flex flex-row items-center h-full">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim()}
          className={cn(
            'border rounded-full transition-colors h-8 w-8 flex items-center justify-center',
            value ? 'bg-primary text-primary-foreground hover:text-background hover:bg-foreground border-none' : 'text-muted-foreground cursor-not-allowed',
            !isLoading && 'p-2'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <div className="border-primary flex items-center justify-center rounded-full border p-2">
              <div className="border-primary size-2 border" />
            </div>
          ) : (
            <ArrowUp className="size-4"/>
          )}
        </motion.button>
      </div>
    </div>
  )
}
