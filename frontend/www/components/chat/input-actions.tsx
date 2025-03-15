import { Button } from "@/components/ui/button"
import { Globe, Paperclip, Send, CircleDotDashed } from "lucide-react"

interface InputActionsProps {
  isLoading: boolean
  showSearch: boolean
  showResearch: boolean
  value: string
  onSubmit: () => void
  onSearchToggle: () => void
  onResearchToggle: () => void
  onImageUpload: (file: File) => void
}

export function InputActions({
  isLoading,
  showSearch,
  showResearch,
  value,
  onSubmit,
  onSearchToggle,
  onResearchToggle,
  onImageUpload
}: InputActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-t p-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={onSearchToggle}
          className={showSearch ? "bg-primary-foreground" : ""}
        >
          <Globe className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={onResearchToggle}
          className={showResearch ? "bg-primary-foreground" : ""}
        >
          <CircleDotDashed className="h-4 w-4" />
        </Button>
        <label>
          <Button
            variant="ghost"
            size="icon"
            disabled={isLoading}
            className="cursor-pointer"
            asChild
          >
            <div>
              <Paperclip className="h-4 w-4" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImageUpload(file)
                }}
              />
            </div>
          </Button>
        </label>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isLoading || !value.trim()}
        onClick={onSubmit}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}