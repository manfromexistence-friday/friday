"use client"

import * as React from "react"
import { addDays } from "date-fns"
import { type DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"

export default function CalendarComponent() {
    const [range, setRange] = React.useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 12),
        to: addDays(new Date(new Date().getFullYear(), 0, 12), 50),
    })

    return (
        <div className="mb-2 w-full">
            <Calendar
                mode="range"
                defaultMonth={range?.from}
                selected={range}
                onSelect={setRange}
                numberOfMonths={7}
                className="w-full rounded-md border shadow-sm [&>div]:gap-5"
            />
        </div>
    )
}