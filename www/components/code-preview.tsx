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
  // Theme state - remove initial state from useState to prevent hydration mismatch
  const { theme, resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>() 
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

  // Update theme when it changes - modified to avoid hydration issues
  useEffect(() => {
    // Set currentTheme only after component is mounted
    setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark');
    
    // Update Monaco editor theme if editor is initialized
    if (monacoInstance && editorInstance) {
      try {
        const themeToUse = resolvedTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
        editorInstance.updateOptions({ theme: themeToUse });
      } catch (err) {
        console.error("Failed to update editor theme:", err);
      }
    }
  }, [resolvedTheme, monacoInstance, editorInstance]);

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
              theme="vs-dark" // Default theme for initial render
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
                    // Syntax colors using shadcn color palette for light theme
                    { token: 'keyword', foreground: '171717' },     // primary (240 5.9% 10%)
                    { token: 'string', foreground: '16a34a' },      // green
                    { token: 'identifier', foreground: '334155' },   // slate
                    { token: 'type', foreground: '0369a1' },        // sky
                    { token: 'number', foreground: 'a21caf' },      // fuchsia
                    { token: 'delimiter', foreground: '64748b' },   // muted-foreground (240 3.8% 46.1%)
                    { token: 'comment', foreground: '737373', fontStyle: 'italic' }, // muted-foreground
                    { token: 'variable', foreground: '020617' },    // foreground (240 10% 3.9%)
                    { token: 'constant', foreground: 'dc2626' },    // destructive (0 72.22% 50.59%)
                    { token: 'function', foreground: '171717' },    // primary (240 5.9% 10%)
                    { token: 'operator', foreground: '737373' },    // muted-foreground
                  ],
                  colors: {
                    'editor.background': '#ffffff', // background
                    'editor.foreground': '#020617', // foreground (240 10% 3.9%)
                    'editorCursor.foreground': '#171717', // primary (240 5.9% 10%)
                    'editor.lineHighlightBackground': '#f5f5f5', // muted (240 4.8% 95.9%)
                    'editorLineNumber.foreground': '#737373', // muted-foreground (240 3.8% 46.1%)
                    'editorLineNumber.activeForeground': '#171717', // primary (240 5.9% 10%)
                    'editor.selectionBackground': '#f5f5f580', // muted (240 4.8% 95.9%) with opacity
                    'editor.selectionForeground': '#171717', // primary
                    'editor.inactiveSelectionBackground': '#f5f5f5', // muted
                    'editorWidget.background': '#ffffff', // card
                    'editorWidget.border': '#e5e5e5', // border (240 5.9% 90%)
                    'editorSuggestWidget.background': '#ffffff', // popover
                    'editorSuggestWidget.border': '#e5e5e5', // border
                    'editorSuggestWidget.foreground': '#020617', // popover-foreground
                    'editorSuggestWidget.highlightForeground': '#171717', // primary
                    'editorSuggestWidget.selectedBackground': '#f5f5f5', // accent
                  }
                });
                
                monaco.editor.defineTheme('shadcn-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    // Syntax colors using shadcn color palette for dark theme
                    { token: 'keyword', foreground: 'fafafa' },     // primary (0 0% 98%)
                    { token: 'string', foreground: '86efac' },      // green
                    { token: 'identifier', foreground: 'e2e8f0' },  // slate
                    { token: 'type', foreground: '7dd3fc' },        // sky
                    { token: 'number', foreground: 'f0abfc' },      // fuchsia
                    { token: 'delimiter', foreground: 'a1a1aa' },   // muted-foreground (240 5% 64.9%)
                    { token: 'comment', foreground: 'a1a1aa', fontStyle: 'italic' }, // muted-foreground
                    { token: 'variable', foreground: 'fafafa' },    // foreground (0 0% 98%)
                    { token: 'constant', foreground: '7f1d1d' },    // destructive (0 62.8% 30.6%)
                    { token: 'function', foreground: 'fafafa' },    // primary (0 0% 98%)
                    { token: 'operator', foreground: 'a1a1aa' },    // muted-foreground
                  ],
                  colors: {
                    'editor.background': '#0a0a0a', // background (240 10% 3.9%)
                    'editor.foreground': '#fafafa', // foreground (0 0% 98%)
                    'editorCursor.foreground': '#fafafa', // primary (0 0% 98%)
                    'editor.lineHighlightBackground': '#27272a', // muted (240 3.7% 15.9%)
                    'editorLineNumber.foreground': '#a1a1aa', // muted-foreground (240 5% 64.9%)
                    'editorLineNumber.activeForeground': '#fafafa', // primary (0 0% 98%)
                    'editor.selectionBackground': '#27272a80', // muted (240 3.7% 15.9%) with opacity
                    'editor.selectionForeground': '#fafafa', // primary (0 0% 98%)
                    'editor.inactiveSelectionBackground': '#27272a', // muted
                    'editorWidget.background': '#0a0a0a', // card
                    'editorWidget.border': '#27272a', // border (240 3.7% 15.9%)
                    'editorSuggestWidget.background': '#0a0a0a', // popover
                    'editorSuggestWidget.border': '#27272a', // border
                    'editorSuggestWidget.foreground': '#fafafa', // popover-foreground
                    'editorSuggestWidget.highlightForeground': '#fafafa', // primary
                    'editorSuggestWidget.selectedBackground': '#27272a', // accent
                  }
                });
              }}
              onMount={(editor, monaco) => {
                // Store references for theme switching
                setEditorInstance(editor);
                setMonacoInstance(monaco);
                
                // Apply theme after component mounts, using a more reliable approach
                const applyTheme = () => {
                  try {
                    // Use the current state rather than accessing theme directly
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
                };
                
                // Only apply theme if currentTheme is set
                if (currentTheme) {
                  applyTheme();
                }
                
                // Set up an effect that will run when currentTheme changes
                const observer = new MutationObserver(() => {
                  if (currentTheme) {
                    applyTheme();
                  }
                });
                
                // Disconnect observer when component unmounts
                return () => observer.disconnect();
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