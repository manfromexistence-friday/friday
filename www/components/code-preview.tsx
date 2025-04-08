"use client"

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Filter, X, Terminal, Code, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"

export function CodeEditor() {
  // Theme state
  const { theme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>("dark")
  const [monacoInstance, setMonacoInstance] = useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  
  // State for console height
  const [consoleHeight, setConsoleHeight] = useState(150) // Default height in pixels
  const [isDragging, setIsDragging] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  // Sample code to display in the editor, matching cuisine-selector.tsx
  const defaultCode = `
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

  // Update theme when it changes
  useEffect(() => {
    // Avoid running during SSR
    if (typeof window === 'undefined') return;
    
    // Update local theme state when theme changes
    setCurrentTheme(theme === 'light' ? 'light' : 'dark');
    
    // Update Monaco editor theme if editor is initialized
    if (monacoInstance && editorInstance) {
      try {
        const themeToUse = theme === 'light' ? 'shadcn-light' : 'shadcn-dark';
        editorInstance.updateOptions({ theme: themeToUse });
      } catch (err) {
        console.error("Failed to update editor theme:", err);
      }
    }
  }, [theme, monacoInstance, editorInstance]);

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
              theme={currentTheme === 'light' ? 'vs' : 'vs-dark'} // Default theme based on current theme
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
                // Define both light and dark themes
                monaco.editor.defineTheme('shadcn-light', {
                  base: 'vs',
                  inherit: true,
                  rules: [
                    // More distinctive syntax colors for light theme
                    { token: 'keyword', foreground: '5b21b6' },     // deeper purple
                    { token: 'string', foreground: '047857' },      // darker green
                    { token: 'identifier', foreground: '1e3a8a' },  // deeper blue
                    { token: 'type', foreground: '0e7490' },        // darker cyan
                    { token: 'number', foreground: 'a21caf' },      // richer magenta
                    { token: 'delimiter', foreground: '374151' },   // darker gray
                    { token: 'comment', foreground: '64748b', fontStyle: 'italic' }, // slate/500
                    { token: 'variable', foreground: '1e293b' },    // slate/800
                    { token: 'constant', foreground: 'c2410c' },    // darker orange
                    { token: 'function', foreground: '0369a1' },    // darker blue
                    { token: 'operator', foreground: '334155' },    // darker slate
                  ],
                  colors: {
                    'editor.background': '#ffffff', // background
                    'editor.foreground': '#020617', // foreground
                    'editorCursor.foreground': '#334155', // slate/700
                    'editor.lineHighlightBackground': '#f4f4f5',
                    'editorLineNumber.foreground': '#71717a',
                    'editor.selectionBackground': '#7c3aed50',     // text-primary with opacity
                    'editor.selectionForeground': '#7c3aed',       // text-primary for selected text
                    'editor.inactiveSelectionBackground': '#f4f4f5',
                    'editorWidget.background': '#ffffff',
                    'editorWidget.border': '#e4e4e7',
                    'editorSuggestWidget.background': '#ffffff',
                    'editorSuggestWidget.border': '#e4e4e7',
                    'editorSuggestWidget.foreground': '#000000',
                    'editorSuggestWidget.highlightForeground': '#7c3aed',
                    'editorSuggestWidget.selectedBackground': '#f4f4f5',
                  }
                });
                
                monaco.editor.defineTheme('shadcn-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    // More vibrant syntax colors for dark theme
                    { token: 'keyword', foreground: 'a78bfa' },     // brighter violet
                    { token: 'string', foreground: '86efac' },      // brighter green
                    { token: 'identifier', foreground: 'cbd5e1' },  // slate/300
                    { token: 'type', foreground: '7dd3fc' },        // lighter sky
                    { token: 'number', foreground: 'f0abfc' },      // brighter fuchsia
                    { token: 'delimiter', foreground: '94a3b8' },   // slate/400
                    { token: 'comment', foreground: '64748b', fontStyle: 'italic' }, // slate/500
                    { token: 'variable', foreground: 'f1f5f9' },    // slate/100
                    { token: 'constant', foreground: 'fdba74' },    // brighter orange
                    { token: 'function', foreground: '0ea5e9' },    // sky/500
                    { token: 'operator', foreground: 'cbd5e1' },    // slate/300
                  ],
                  colors: {
                    'editor.background': '#09090b', // background
                    'editor.foreground': '#fafafa', // foreground
                    'editorCursor.foreground': '#e2e8f0', // slate/200
                    'editor.lineHighlightBackground': '#1e1e2c',
                    'editorLineNumber.foreground': '#6f6f84',
                    'editor.selectionBackground': '#7c3aed50',     // text-primary with opacity
                    'editor.selectionForeground': '#7c3aed',       // text-primary for selected text
                    'editor.inactiveSelectionBackground': '#1e1e2c',
                    'editorWidget.background': '#111114',
                    'editorWidget.border': '#27272a',
                    'editorSuggestWidget.background': '#11111b',
                    'editorSuggestWidget.border': '#27272a',
                    'editorSuggestWidget.foreground': '#e2e2e5',
                    'editorSuggestWidget.highlightForeground': '#7c3aed',
                    'editorSuggestWidget.selectedBackground': '#18181b',
                  }
                });
              }}
              onMount={(editor, monaco) => {
                // Store references for theme switching
                setEditorInstance(editor);
                setMonacoInstance(monaco);
                
                // Apply theme after component mounts
                setTimeout(() => {
                  try {
                    const themeToUse = currentTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
                    editor.updateOptions({
                      theme: themeToUse
                    });
                  } catch (err) {
                    console.error("Failed to apply custom theme:", err);
                    // Fallback to a default theme
                    editor.updateOptions({
                      theme: currentTheme === 'light' ? 'vs' : 'vs-dark'
                    });
                  }
                }, 0);
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
      </Card>
    </div>
  )
}