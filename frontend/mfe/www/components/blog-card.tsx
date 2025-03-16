"use client"
import { motion } from "framer-motion"
import Image from "next/image"
import { useRef, useState } from "react"
import { useTheme } from "next-themes"

// Define the props for the BlogCard component
export default function BlogCard({ title, description, image }: {
  title: string,
  description: string,
  image: string
}) {
  // Create a ref for the card element
  const ref = useRef<HTMLDivElement>(null)
  // State to track mouse position relative to the card
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  // State to track whether the card is being hovered
  const [isHovered, setIsHovered] = useState(false)
  const { theme } = useTheme()

  // Function to handle mouse movement over the card
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    // Get the bounding rectangle of the current element
    const rect = ref.current?.getBoundingClientRect()

    // If we successfully got the rectangle
    if (rect) {
      // Calculate the mouse position relative to the element
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      // Update the state with the new mouse position
      setMousePosition({ x, y })
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03 }} // Slightly increase size on hover
      className="relative flex w-full overflow-hidden rounded-2xl border hover:cursor-pointer"
    >
      {/* Radial gradient overlay that follows the mouse */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-300 ease-in-out"
        style={{
          background: `radial-gradient(circle 150px at ${mousePosition.x}px ${mousePosition.y}px, ${theme === "light" ? "#b8b8b8" : "#424242"}, transparent 80%)`,
          opacity: isHovered ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
      {/* Card content */}
      <div className="relative z-10 flex flex-1 flex-col p-3">
        {/* Image container */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded">
          <Image
            src={image}
            alt="Thumbnail"
            fill
            className="object-cover object-center"
          />
        </div>
        {/* Text content */}
        <div className="ustify-center mt-2 flex flex-col gap-1">
          <p className="text-sm text-primary">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}