import { AnimatePresence, motion } from "framer-motion"

interface AnimatedPlaceholderProps {
  showSearch: boolean
  showResearch: boolean
}

export function AnimatedPlaceholder({ showSearch, showResearch }: AnimatedPlaceholderProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={showSearch ? "search" : "ask"}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.1 }}
        className="text-muted-foreground pointer-events-none absolute w-[150px] text-sm"
      >
        {showSearch
          ? "Search the web..."
          : showResearch
            ? "Show Thinking..."
            : "Ask Ai..."}
      </motion.p>
    </AnimatePresence>
  )
}