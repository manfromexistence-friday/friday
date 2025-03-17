"use client"

import * as React from "react"
import * as Portal from '@radix-ui/react-portal'
import { isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday } from 'date-fns'

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Clock, BookOpen, Calculator, TestTube, Dna, Laptop, Languages, BookText, Info, Binary, BookMarked, Beaker, FlaskConical, Microscope, CircleDot, ScrollText, PenTool, GraduationCap } from "lucide-react"
import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

// Add this custom hook
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
};

const SunFilled: LucideIcon = forwardRef(({
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

type SubjectId = 'higher_mathamethics_1st_paper' | 'higher_mathamethics_2nd_paper' | 'physics_1st_paper' | 
  'physics_2nd_paper' | 'chemistry_1st_paper' | 'chemistry_2nd_paper' | 'biology_1st_paper' | 
  'biology_2nd_paper' | 'ict' | 'bangla_1st_paper' | 'bangla_2nd_paper' | 'english_1st_paper' | 
  'english_2nd_paper';

interface Subject {
  id: SubjectId
  name: string
  time: string
  duration: string
  icon: LucideIcon
}

export default function BoringStudyCards({ onProgressUpdate }: { onProgressUpdate: (progress: number) => void }) {
  const [completed, setCompleted] = useLocalStorage('completedSubjects', {
    higher_mathamethics_1st_paper: false,
    higher_mathamethics_2nd_paper: false,
    physics_1st_paper: false,
    physics_2nd_paper: false,
    chemistry_1st_paper: false,
    chemistry_2nd_paper: false,
    biology_1st_paper: false,
    biology_2nd_paper: false,
    ict: false,
    bangla_1st_paper: false,
    bangla_2nd_paper: false,
    english_1st_paper: false,
    english_2nd_paper: false,
  });

  // Reset completed state at midnight
  React.useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeToMidnight = tomorrow.getTime() - now.getTime();

    const resetTimer = setTimeout(() => {
      setCompleted(Object.keys(completed).reduce<typeof completed>((acc, key) => ({
        ...acc,
        [key]: false
      }), {} as typeof completed));
    }, timeToMidnight);

    return () => clearTimeout(resetTimer);
  }, [completed, setCompleted]);

  const today = new Date()

  const isSubjectForToday = (time: string) => {
    if (isMonday(today) && time.includes('Monday')) return true
    if (isTuesday(today) && time.includes('Tuesday')) return true
    if (isWednesday(today) && time.includes('Wednesday')) return true
    if (isThursday(today) && time.includes('Thursday')) return true
    if (isFriday(today) && time.includes('Friday')) return true
    if (isSaturday(today) && time.includes('Saturday')) return true
    return false
  }

  const subjects: Subject[] = [
    {
      id: "higher_mathamethics_1st_paper",
      name: "Higher Math (1st Paper)",
      time: "Morning - Monday, Wednesday, Friday",
      duration: "1.5 hours",
      icon: Calculator,
    },
    {
      id: "higher_mathamethics_2nd_paper",
      name: "Higher Math (2nd Paper)",
      time: "Morning - Tuesday, Thursday, Saturday",
      duration: "1.5 hours",
      icon: Binary,
    },
    {
      id: "physics_1st_paper",
      name: "Physics (1st Paper)",
      time: "Late Morning - Monday, Wednesday, Friday",
      duration: "1.5 hours",
      icon: BookOpen,
    },
    {
      id: "physics_2nd_paper",
      name: "Physics (2nd Paper)",
      time: "Late Morning - Tuesday, Thursday, Saturday",
      duration: "1.5 hours",
      icon: BookMarked,
    },
    {
      id: "chemistry_1st_paper",
      name: "Chemistry (1st Paper)",
      time: "Afternoon - Monday, Thursday",
      duration: "1 hour",
      icon: Beaker,
    },
    {
      id: "chemistry_2nd_paper",
      name: "Chemistry (2nd Paper)",
      time: "Afternoon - Tuesday, Friday",
      duration: "1 hour",
      icon: FlaskConical,
    },
    {
      id: "biology_1st_paper",
      name: "Biology (1st Paper)",
      time: "Evening - Monday, Thursday",
      duration: "1 hour",
      icon: Microscope,
    },
    {
      id: "biology_2nd_paper",
      name: "Biology (2nd Paper)",
      time: "Evening - Tuesday, Friday",
      duration: "1 hour",
      icon: CircleDot,
    },
    {
      id: "ict",
      name: "ICT",
      time: "Late Morning - Wednesday, Saturday",
      duration: "1 hour",
      icon: Laptop,
    },
    {
      id: "bangla_1st_paper",
      name: "Bangla (1st Paper)",
      time: "Night - Monday, Thursday",
      duration: "45 minutes",
      icon: ScrollText,
    },
    {
      id: "bangla_2nd_paper",
      name: "Bangla (2nd Paper)",
      time: "Night - Tuesday, Friday",
      duration: "45 minutes",
      icon: PenTool,
    },
    {
      id: "english_1st_paper",
      name: "English (1st Paper)",
      time: "Night - Wednesday",
      duration: "45 minutes",
      icon: Languages,
    },
    {
      id: "english_2nd_paper",
      name: "English (2nd Paper)",
      time: "Night - Saturday",
      duration: "45 minutes",
      icon: GraduationCap,
    },
  ]

  const todaySubjects = subjects.filter(subject => isSubjectForToday(subject.time))

  const handleCardClick = (id: SubjectId) => {
    setCompleted((prev) => {
      const newState = {
        ...prev,
        [id]: !prev[id],
      };
      return newState;
    });
  };

  // Add this useEffect to handle progress updates
  React.useEffect(() => {
    const totalSubjects = todaySubjects.length;
    const completedSubjects = todaySubjects.filter(subject => completed[subject.id]).length;
    const progress = totalSubjects > 0 ? Math.round((completedSubjects / totalSubjects) * 100) : 0;
    onProgressUpdate(progress);
  }, [completed, todaySubjects, onProgressUpdate]);

  return (
    <div className="mt-1 w-full">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {todaySubjects.map((subject) => {
          const Icon = subject.icon
          return (
            <Card
              key={subject.id}
              className={`group relative h-[180px] cursor-pointer bg-background 
                          transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg
                          ${completed[subject.id] ? "bg-primary-foreground" : ""}`}
              onClick={() => handleCardClick(subject.id)}
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
                      id={subject.id}
                      checked={completed[subject.id]}
                      onCheckedChange={() => { }}
                      className="size-6 rounded-full"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-bold transition-colors duration-300 group-hover:text-primary">
                    {subject.name}
                  </h3>
                  <div className="flex items-center gap-1">

                    <p className="mb-2 max-w-[80%] truncate text-sm text-muted-foreground">
                      {subject.time}
                    </p>
                    <div className="mb-1">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Info className="size-4 cursor-pointer text-muted-foreground transition-colors hover:text-primary" />
                        </HoverCardTrigger>
                        <Portal.Root>
                          <HoverCardContent
                            className="relative z-[9999] w-auto rounded-md bg-popover p-2 text-popover-foreground shadow-md"
                          >
                            <p className="whitespace-nowrap text-sm">{subject.time}</p>
                          </HoverCardContent>
                        </Portal.Root>
                      </HoverCard>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 inline-block size-3" />
                    <span>{subject.duration}</span>
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