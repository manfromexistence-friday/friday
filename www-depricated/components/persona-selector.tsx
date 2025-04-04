"use client"

import { useState } from "react"
import { FileText, Heart, SmilePlus, User, FileCheck, X, Brain, Search, Tag, Zap, BarChart2, Code } from "lucide-react"

export default function PersonaSelector() {
  const [view, setView] = useState<"personas" | "suggestions">("personas")
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)

  const personas = [
    { id: "latest-news", label: "Latest News", icon: FileText, color: "text-blue-500" },
    { id: "companion", label: "Companion", icon: Heart, color: "text-pink-500" },
    { id: "comedian", label: "Unhinged Comedian", icon: SmilePlus, color: "text-yellow-500" },
    { id: "friend", label: "Loyal Friend", icon: User, color: "text-purple-500" },
    { id: "homework", label: "Homework Helper", icon: FileCheck, color: "text-green-500" },
  ]

  const secondaryPersonas = [
    { id: "not-doctor", label: "Not a Doctor", icon: X, color: "text-red-500" },
    { id: "not-therapist", label: "Not a Therapist", icon: Brain, color: "text-amber-500" },
  ]

  const suggestions = [
    { id: "research", label: "Research", icon: Search, color: "text-sky-500" },
    { id: "create-images", label: "Create images", icon: Tag, color: "text-emerald-500" },
    { id: "how-to", label: "How to", icon: Zap, color: "text-orange-500" },
    { id: "analyze", label: "Analyze", icon: BarChart2, color: "text-violet-500" },
    { id: "code", label: "Code", icon: Code, color: "text-cyan-500" },
  ]

  const handlePersonaClick = (id: string) => {
    setSelectedPersona(id === selectedPersona ? null : id)
  }

  const handleTagToggle = (id: string) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]))
  }

  const toggleView = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setView((prev) => (prev === "personas" ? "suggestions" : "personas"))
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className="flex flex-col items-center gap-2 p-2 max-w-[50%] mx-auto transition-all duration-500 ease-in-out">
      <div 
        className={`w-full transition-all duration-300 ease-in-out ${
          isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {view === "personas" ? (
          <>
            <div className="flex flex-wrap justify-center gap-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona.id)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-${persona.color.split('-')[1]}-400 hover:bg-${persona.color.split('-')[1]}-50 dark:hover:bg-${persona.color.split('-')[1]}-900/20 transition-all duration-300 ${
                    selectedPersona === persona.id 
                      ? `bg-${persona.color.split('-')[1]}-100 dark:bg-${persona.color.split('-')[1]}-800/30 shadow-md shadow-${persona.color.split('-')[1]}-200/20 transform scale-105` 
                      : "bg-background hover:scale-103 hover:-translate-y-0.5"
                  }`}
                >
                  <persona.icon className={`w-5 h-5 ${persona.color} transition-transform group-hover:scale-110`} />
                  <span className={selectedPersona === persona.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}>
                    {persona.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {secondaryPersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona.id)}
                  className={`group flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-${persona.color.split('-')[1]}-400 hover:bg-${persona.color.split('-')[1]}-50 dark:hover:bg-${persona.color.split('-')[1]}-900/20 transition-all duration-300 ${
                    selectedPersona === persona.id 
                      ? `bg-${persona.color.split('-')[1]}-100 dark:bg-${persona.color.split('-')[1]}-800/30 shadow-md shadow-${persona.color.split('-')[1]}-200/20 transform scale-105` 
                      : "bg-background hover:scale-103 hover:-translate-y-0.5"
                  }`}
                >
                  <persona.icon className={`w-5 h-5 ${persona.color} transition-transform group-hover:scale-110`} />
                  <span className={selectedPersona === persona.id ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}>
                    {persona.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleTagToggle(suggestion.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                  selectedTags.includes(suggestion.id)
                    ? `border-${suggestion.color.split('-')[1]}-500 bg-${suggestion.color.split('-')[1]}-50 dark:bg-${suggestion.color.split('-')[1]}-900/20 shadow-md shadow-${suggestion.color.split('-')[1]}-200/10 transform scale-105`
                    : `border-border bg-background hover:scale-103 hover:-translate-y-0.5 hover:bg-${suggestion.color.split('-')[1]}-50 dark:hover:bg-${suggestion.color.split('-')[1]}-900/10 hover:border-${suggestion.color.split('-')[1]}-400`
                }`}
              >
                <suggestion.icon
                  className={`w-5 h-5 ${selectedTags.includes(suggestion.id) ? suggestion.color : suggestion.color + " opacity-70 group-hover:opacity-100"} transition-transform group-hover:scale-110`}
                />
                <span
                  className={`transition-all ${selectedTags.includes(suggestion.id) ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  {suggestion.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={toggleView}
        className="mt-4 text-muted-foreground text-sm hover:text-foreground hover:underline transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
        disabled={isAnimating}
      >
        Switch to {view === "personas" ? "Suggestions" : "Personas"}
      </button>
    </div>
  )
}