import Image from "next/image"
import { Plus } from "lucide-react"

interface ImagePreviewProps {
  imagePreview: string
  inputHeight: number
  onRemove: () => void
}

export function ImagePreview({ imagePreview, inputHeight, onRemove }: ImagePreviewProps) {
  return (
    <div
      className="absolute h-[60px] left-1/2 z-20 w-1/2 translate-x-[-50%] rounded-2xl bg-transparent"
      style={{
        bottom: `${inputHeight + 45}px`,
      }}
    >
      <Image
        className="rounded-lg object-cover"
        src={imagePreview}
        height={50}
        width={50}
        alt="uploaded preview"
      />
      <button
        onClick={onRemove}
        className="shadow-3xl absolute -left-2 -top-2 rotate-45 rounded-lg"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}