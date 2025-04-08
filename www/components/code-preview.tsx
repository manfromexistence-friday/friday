"use client"

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Filter, X, Terminal, Code, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CodeEditor() {
  // State for console height
  const [consoleHeight, setConsoleHeight] = useState(150) // Default height in pixels
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Sample code to display in the editor, matching cuisine-selector.tsx
  const defaultCode = `
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
  "Japanese",
  "Indian",
  "Greek",
  "French",
  "Spanish",
  "Turkish",
  "Lebanese",
  "Vietnamese",
  "Korean",
  "Argentinian",
  "Peruvian",
  "Ethiopian",
  "Nigerian",
  "German",
  "British",
  "Irish",
  "Swedish",
  "Danish",
  "Polish",
  "Hungarian",
  "Portuguese",
]

const transitionProps = {}
`

  // Handle mouse down to start dragging
  const handleMouseDown = () => {
    setIsDragging(true)
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle mouse move to resize console
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && editorRef.current) {
      const newHeight = window.innerHeight - e.clientY
      if (newHeight >= 100 && newHeight <= window.innerHeight - 100) {
        setConsoleHeight(newHeight)
      }
    }
  }

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <h1 className="text-sm font-medium">Code Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
      
      {/* Monaco Editor */}
      <div
        ref={editorRef}
        className="flex-1 relative bg-muted/30 border-b border-border"
        style={{ height: `calc(100vh - ${consoleHeight}px)` }}
      >
        <div className="absolute top-0 right-0 z-10 p-2 flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm opacity-70 hover:opacity-100">
            <Code className="h-4 w-4" />
          </Button>
        </div>
        <Card className="border-0 shadow-none h-full rounded-none bg-transparent">
          <CardContent className="p-0 h-full">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={defaultCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 20, bottom: 20 },
                fontFamily: "'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
                cursorBlinking: "smooth",
                smoothScrolling: true,
                cursorSmoothCaretAnimation: "on",
                renderLineHighlight: "all",
                contextmenu: true,
                guides: {
                  indentation: true
                },
              }}
              beforeMount={(monaco) => {
                // Custom theme setup using shadcn UI CSS variables
                monaco.editor.defineTheme('shadcn-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': 'var(--background)',
                    'editor.foreground': 'var(--foreground)',
                    'editorCursor.foreground': 'var(--primary)',
                    'editor.lineHighlightBackground': 'var(--muted)',
                    'editorLineNumber.foreground': 'var(--muted-foreground)',
                    'editor.selectionBackground': 'var(--primary-light)',
                    'editor.inactiveSelectionBackground': 'var(--muted)',
                    'editorWidget.background': 'var(--card)',
                    'editorWidget.border': 'var(--border)',
                    'editorSuggestWidget.background': 'var(--popover)',
                    'editorSuggestWidget.border': 'var(--border)',
                    'editorSuggestWidget.foreground': 'var(--popover-foreground)',
                    'editorSuggestWidget.highlightForeground': 'var(--primary)',
                    'editorSuggestWidget.selectedBackground': 'var(--accent)',
                  }
                });
              }}
              onMount={(editor, monaco) => {
                // You can store the editor instance if needed
                // setMonacoEditor(editor);
                editor.updateOptions({
                  theme: 'shadcn-dark'
                });
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Resizable Divider */}
      <div
        className="h-1.5 bg-border hover:bg-primary/30 cursor-ns-resize transition-colors"
        onMouseDown={handleMouseDown}
      />

      {/* Console */}
      <Card
        className="bg-card m-2 border border-border shadow-sm"
        style={{ height: `${consoleHeight}px` }}
      >
        <CardHeader className="py-2 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Terminal className="h-4 w-4 mr-2 text-muted-foreground" />
            Console
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="console" className="w-full">
            <TabsList className="px-4 h-8 bg-transparent justify-start border-b border-border rounded-none">
              <TabsTrigger value="console" className="text-xs h-7 data-[state=active]:bg-background">Output</TabsTrigger>
              <TabsTrigger value="problems" className="text-xs h-7 data-[state=active]:bg-background">Problems</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100%-2.5rem)] w-full">
              <TabsContent value="console" className="p-4 m-0">
                <p className="text-sm text-muted-foreground flex items-center justify-center h-16">
                  No logs available to display
                </p>
              </TabsContent>
              <TabsContent value="problems" className="p-4 m-0">
                <p className="text-sm text-muted-foreground flex items-center justify-center h-16">
                  No problems detected
                </p>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>