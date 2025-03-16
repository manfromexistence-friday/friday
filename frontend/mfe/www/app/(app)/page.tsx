"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import PrayerCards from "@/components/prayer-cards"
import BoringStudyCards from "@/components/boring-study-cards"
import CalendarComponent from "@/components/calendar"
import ChessCards from "@/components/chess-cards"
import LeetcodeCards from "@/components/leetcode-cards"
import QuranCards from "@/components/quran-cards"
import SocialMediaCards from "@/components/social-media-influencing-cards"
import PixelatedText from "@/components/pixel"
import { format } from 'date-fns'
import { useEffect, useState } from "react"
import { useRemoveGrammarly } from '@/hooks/use-remove-grammarly'

export default function Page() {
  useRemoveGrammarly()
  const [prayerProgress, setPrayerProgress] = React.useState(0)
  const [boringStudyProgress, setBoringStudyProgress] = React.useState(0)
  const [chessProgress, setChessProgress] = React.useState(0)
  const [leetcodeProgress, setLeetcodeProgress] = React.useState(0)
  const [socialMediaInfluencingCards, setSocialMediaInfluencingCards] = React.useState(0)
  const [quranProgress, setQuranProgress] = React.useState(0)
  const [currentDate, setCurrentDate] = React.useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return "Good Morning"
    if (hour >= 12 && hour < 17) return "Good Afternoon"
    if (hour >= 17 && hour < 21) return "Good Evening"
    return "Good Night"
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="size-full overflow-auto p-2 pb-12" suppressHydrationWarning>
      <PixelatedText fontSize={40} pixelSize={3} position="left" className="py-6">
        {getTimeBasedGreeting()}, <PixelatedText.Rainbow>manfromexistence</PixelatedText.Rainbow>. Level <PixelatedText.Rainbow>#19</PixelatedText.Rainbow> : Streak <PixelatedText.Rainbow>#1</PixelatedText.Rainbow>
      </PixelatedText>

      <div className="flex h-20 w-full items-center justify-start border">
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Prayer</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Boring Study</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Quran</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Programming</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Excercise</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Mathamatics</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Physics</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Chemistry</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Biology</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Social Media Influencing</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Chess</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Leetcode</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Family</span>

          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Friends</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="flex h-10 w-max items-center justify-center border-b border-r px-4 font-mono text-xs">Journaling</span>
          <div className="flex h-10 w-full items-center justify-center border-r px-4 font-mono text-xs hover:border-b hover:bg-primary-foreground">
            <Checkbox />
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <span className="flex h-10 w-full items-center justify-center border-b px-4 font-mono text-xs">Date</span>
          <span className="flex h-10 w-full items-center justify-center px-4 font-mono text-xs">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </span>
        </div>
      </div>
      <div className="mt-2 min-h-screen space-y-2 px-1">
        <div className="flex w-full flex-col space-y-2">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Prayer</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={prayerProgress} className="w-[250px]" />
            </div>
          </div>
          <PrayerCards onProgressUpdate={setPrayerProgress} />
        </div>
        <div className="flex w-full flex-col space-y-2 px-1">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Boring Study</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={boringStudyProgress} className="w-[250px]" />
            </div>
          </div>
          <BoringStudyCards onProgressUpdate={setBoringStudyProgress} />
        </div>
        <div className="flex w-full flex-col space-y-2 px-1">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Quran</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={quranProgress} className="w-[250px]" />
            </div>
          </div>
          <QuranCards onProgressUpdate={setQuranProgress} />
        </div>
        <div className="flex w-full flex-col space-y-2 px-1">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Social Media Influencing</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={socialMediaInfluencingCards} className="w-[250px]" />
            </div>
          </div>
          <SocialMediaCards onProgressUpdate={setSocialMediaInfluencingCards} />
        </div>
        <div className="flex w-full flex-col space-y-2 px-1">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Chess</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={chessProgress} className="w-[250px]" />
            </div>
          </div>
          <ChessCards onProgressUpdate={setChessProgress} />
        </div>
        <div className="flex w-full flex-col space-y-2 px-1">
          <div className="flex h-10 w-full items-start justify-between">
            <span className="flex h-full items-center text-2xl font-bold">Leetcode</span>
            <div className="mt-2 flex h-full items-center justify-end">
              <Progress value={leetcodeProgress} className="w-[250px]" />
            </div>
          </div>
          <LeetcodeCards onProgressUpdate={setLeetcodeProgress} />
        </div>
      </div>
    </main>
  )
}