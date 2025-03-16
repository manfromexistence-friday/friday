import { Button } from "@/components/ui/button"
import { Globe, Paperclip, Send, CircleDotDashed } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface InputActionsProps {
  isLoading: boolean
  showSearch: boolean
  showResearch: boolean
  value: string
  imagePreview: string | null
  onSubmit: () => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  onImageUpload: (file: File | null) => void
}

export function InputActions({
  isLoading,
  showSearch,
  showResearch,
  value,
  imagePreview,
  onSubmit,
  onSearchToggle,
  onResearchToggle,
  onImageUpload
}: InputActionsProps) {
  return (
    <div className="h-12 rounded-b-xl">
      <div className="absolute bottom-3 left-3 flex items-center gap-1">
        {/* File Upload Button */}
        <label className={cn(
          "relative cursor-pointer rounded-full p-2",
          imagePreview ? "bg-background text-primary border" : "text-muted-foreground",
          isLoading && "cursor-not-allowed opacity-50"
        )}>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paperclip className={cn(
              "text-muted-foreground hover:text-primary size-4 transition-colors",
              imagePreview && "text-primary",
              isLoading && "opacity-50"
            )} />
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
            "flex h-8 items-center gap-1 rounded-full border px-2 py-0.5 transition-all",
            showSearch ? "bg-background text-muted-foreground hover:text-primary border" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
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
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
          >
            <Globe className={cn(
              "size-4",
              showSearch ? "text-primary" : "text-muted-foreground",
              isLoading && "opacity-50"
            )} />
          </motion.div>
          <AnimatePresence>
            {showSearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
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
            "flex h-8 items-center gap-2 rounded-full border px-1.5 py-1 transition-all",
            showResearch ? "bg-background text-muted-foreground hover:text-primary border" : "border-transparent",
            isLoading && "cursor-not-allowed opacity-50"
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
              type: "spring",
              stiffness: 260,
              damping: 25,
            }}
          >
            <CircleDotDashed className={cn(
              "size-4",
              showResearch ? "text-primary" : "text-muted-foreground",
              isLoading && "opacity-50"
            )} />
          </motion.div>
          <AnimatePresence>
            {showResearch && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-primary shrink-0 overflow-hidden whitespace-nowrap text-[11px]"
              >
                Research
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Send Button */}
      <div className="absolute bottom-3 right-3">
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className={cn(
            "text-muted-foreground hover:text-primary rounded-full p-2 transition-colors",
            value && !isLoading ? "text-primary" : "text-muted-foreground cursor-not-allowed opacity-50"
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