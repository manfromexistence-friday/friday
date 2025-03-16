"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, CircleDot, Circle, CircleDashed } from "lucide-react"

const activities = [
    {
        id: "easy",
        name: "Easy Problems",
        time: "Beginner Level",
        duration: "30-45 min",
        icon: CircleDot
    },
    {
        id: "medium",
        name: "Medium Problems",
        time: "Intermediate Level",
        duration: "45-60 min",
        icon: Circle
    },
    {
        id: "hard",
        name: "Hard Problems",
        time: "Advanced Level",
        duration: "60+ min",
        icon: CircleDashed
    }
]

export default function LeetcodeCards({ onProgressUpdate }: { onProgressUpdate: (progress: number) => void }) {
    const [completed, setCompleted] = useState<Record<string, boolean>>({
        easy: false,
        medium: false,
        hard: false,
    })

    // Move progress calculation to useEffect
    useEffect(() => {
        const totalActivities = Object.keys(completed).length
        const completedActivities = Object.values(completed).filter(Boolean).length
        const progress = Math.round((completedActivities / totalActivities) * 100)
        onProgressUpdate(progress)
    }, [completed, onProgressUpdate])

    const handleCardClick = (id: string) => {
        setCompleted((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    return (
        <div className="w-full">
            <div className="flex flex-wrap justify-start gap-4 ">
                {activities.map((activity) => {
                    const Icon = activity.icon
                    return (
                        <Card
                            key={activity.id}
                            className={`group relative w-full cursor-pointer overflow-hidden bg-background transition-all duration-300 
                          ease-in-out hover:scale-105 hover:shadow-lg sm:w-[300px]
                          ${completed[activity.id] ? "bg-primary-foreground" : ""}`}
                            onClick={() => handleCardClick(activity.id)}
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
                                            id={activity.id}
                                            checked={completed[activity.id]}
                                            onCheckedChange={() => { }}
                                            className="size-6 rounded-full"
                                        />
                                    </div>

                                </div>

                                <div>
                                    <h3 className="mb-1 text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                                        {activity.name}
                                    </h3>
                                    <p className="mb-2 text-sm text-muted-foreground">{activity.time}</p>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Clock className="mr-1 inline-block size-3" />
                                        <span>{activity.duration}</span>
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