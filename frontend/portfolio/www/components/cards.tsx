"use client"

import * as React from "react"
import { Card as UICard } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import * as Icons from "lucide-react";

interface CardProps {
  name: string
  time: string
  duration: string
  icon: string
  checked?: boolean
  onClick?: () => void
  className?: string
}

export const Card: React.FC<CardProps> = ({
  name,
  time,
  duration,
  icon,
  checked,
  onClick,
  className
}) => {
  const IconComponent = (Icons[icon as keyof typeof Icons] || Icons.Circle) as React.ElementType

  return (
    <UICard className={cn(
        "group relative w-full cursor-pointer overflow-hidden transition-all hover:scale-105 sm:w-[300px]",
        className,
      )} onClick={onClick}
       
     
    
     
    
    >
      <div className="relative p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-full bg-secondary">
            <IconComponent className="size-6" />
          </div>
        </div>
        <div>
          <h3 className="mb-1 text-xl font-bold">{name}</h3>
          <p className="mb-2 text-sm text-muted-foreground">{time}</p>
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="mr-1 size-3" />
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </UICard>
  )
}

interface CardsComponentProps {
  cards: any[]
  className?: string
}

export default function Cards({ cards, className }: CardsComponentProps) {
  return (
    <div className={cn("w-full",className)}>
      <div className="flex flex-wrap gap-4">
        {cards.map((card: any) => (          
            <Card
              key={card.id}
              name={card.name}
              time={card.time}
              duration={card.duration}
              icon={card.icon}
              onClick={card.onClick}
              checked={card.checked}
              className={card.className}
            />          
        ))}
      </div>
    </div>
  )
}