"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, Sun, Sunrise, Sunset, Moon } from "lucide-react"
import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { isFriday } from 'date-fns'

export const SunFilled: LucideIcon = forwardRef(({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  ...props
}, ref) => {
  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15 2h2v5h-2zm6.688 6.9l3.506-3.506l1.414 1.414l-3.506 3.506zM25 15h5v2h-5zm-3.312 8.1l1.414-1.413l3.506 3.506l-1.414 1.414zM15 25h2v5h-2zm-9.606.192L8.9 21.686l1.414 1.414l-3.505 3.506zM2 15h5v2H2zm3.395-8.192l1.414-1.414L10.315 8.9L8.9 10.314zM16 10a6 6 0 1 0 6 6a6 6 0 0 0-6-6" />
    </svg>
  )
})

SunFilled.displayName = 'SunFilled'

export default function PrayerCards({ onProgressUpdate }: { onProgressUpdate: (progress: number) => void }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  })

  // Add useEffect to handle progress updates
  useEffect(() => {
    // Calculate progress
    const totalPrayers = Object.keys(completed).length
    const completedPrayers = Object.values(completed).filter(Boolean).length
    const progress = Math.round((completedPrayers / totalPrayers) * 100)

    // Update progress through callback
    onProgressUpdate(progress)
  }, [completed, onProgressUpdate])

  const isJumuahDay = isFriday(new Date())

  const prayers = [
    {
      id: "fajr",
      name: "Fajr",
      time: "Dawn, before sunrise",
      duration: "Minimum 2 minutes",
      icon: Sunrise,
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600",
    },
    {
      id: "dhuhr",
      name: isJumuahDay ? "Jumu'ah" : "Dhuhr",
      time: isJumuahDay ? "Friday afternoon" : "After sun's zenith",
      duration: isJumuahDay ? "Minimum 15 minutes" : "Minimum 4 minutes",
      icon: SunFilled,
      color: "bg-amber-500",
      hoverColor: "hover:bg-amber-600",
    },
    {
      id: "asr",
      name: "Asr",
      time: "Midway between noon and sunset",
      duration: "Minimum 4 minutes",
      icon: Sun,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
    {
      id: "maghrib",
      name: "Maghrib",
      time: "Just after sunset",
      duration: "Minimum 3 minutes",
      icon: Sunset,
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600",
    },
    {
      id: "isha",
      name: "Isha",
      time: "After twilight disappears",
      duration: "Minimum 4 minutes",
      icon: Moon,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
  ]

  const handleCardClick = (id: string) => {
    setCompleted((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap justify-start gap-4 ">
        {prayers.map((prayer) => {
          const Icon = prayer.icon
          return (
            <Card
              key={prayer.id}
              className={`group relative w-full cursor-pointer overflow-hidden bg-background transition-all duration-300 
                          ease-in-out hover:scale-105 hover:shadow-lg sm:w-[300px]
                          ${completed[prayer.id] ? "bg-primary-foreground" : ""}`}
              onClick={() => handleCardClick(prayer.id)}
            >
              <div className="relative p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full
                                  bg-secondary transition-colors duration-300
                                `}
                  >
                    <Icon className="size-6" />
                  </div>
                  <div
                    className={`} flex size-12 items-start
                                    justify-end transition-colors duration-300`}
                  >
                    <Checkbox
                      id={prayer.id}
                      checked={completed[prayer.id]}
                      onCheckedChange={() => { }}
                      className="size-6 rounded-full"
                    />
                  </div>

                </div>

                <div>
                  <h3 className="mb-1 text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                    {prayer.name}
                  </h3>
                  <p className="mb-2 text-sm text-muted-foreground">{prayer.time}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 inline-block size-3" />
                    <span>{prayer.duration}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}