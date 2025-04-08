"use client"

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import {
  Filter, X, Terminal, Code, RefreshCw,
  Copy, Download, FileText, Folder,
  FolderOpen, File, GitBranch, Settings
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTheme } from "next-themes"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dummy file structure for sidebar
const files = [
  {
    name: "src",
    type: "folder",
    expanded: true,
    children: [
      {
        name: "components",
        type: "folder",
        expanded: true,
        children: [
          { name: "Button.tsx", type: "file", language: "typescript" },
          { name: "Card.tsx", type: "file", language: "typescript" },
          { name: "Input.tsx", type: "file", language: "typescript" },
        ]
      },
      {
        name: "pages",
        type: "folder",
        expanded: false,
        children: [
          { name: "index.tsx", type: "file", language: "typescript" },
          { name: "about.tsx", type: "file", language: "typescript" },
        ]
      },
      { name: "App.tsx", type: "file", language: "typescript" },
      { name: "index.css", type: "file", language: "css" },
    ]
  },
  { name: "package.json", type: "file", language: "json" },
  { name: "tsconfig.json", type: "file", language: "json" },
]

export function CodeEditor() {
  // Client-side only state (initialized in useEffect)
  const { resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined)
  const [monacoInstance, setMonacoInstance] = useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [activeFile, setActiveFile] = useState<string | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)

  // Sample code to display in the editor
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

  // Fix hydration mismatch by ensuring client-side only rendering for interactive elements
  useEffect(() => {
    setIsClient(true)
    setActiveFile("App.tsx")
    setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark')
  }, [resolvedTheme])

  // Handle copy code
  const handleCopyCode = () => {
    if (editorInstance) {
      const code = editorInstance.getValue();
      navigator.clipboard.writeText(code)
        .then(() => console.log('Code copied to clipboard'))
        .catch(err => console.error('Failed to copy code:', err));
    }
  }

  // Handle download code
  const handleDownloadCode = () => {
    if (editorInstance) {
      const code = editorInstance.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile || "code.tsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  // Update theme when it changes - after component is mounted
  useEffect(() => {
    if (!isClient) return;

    if (monacoInstance && editorInstance) {
      try {
        const themeToUse = resolvedTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
        editorInstance.updateOptions({ theme: themeToUse });
      } catch (err) {
        console.error("Failed to update editor theme:", err);
      }
    }
  }, [resolvedTheme, monacoInstance, editorInstance, isClient]);

  // Render file/folder item in sidebar
  const renderItem = (item: any, level = 0) => {
    if (!isClient) return null; // Don't render tree until client-side

    const Icon = item.type === 'folder'
      ? (item.expanded ? FolderOpen : Folder)
      : FileText;

    return (
      <div key={item.name}>
        <div
          className={cn(
            "flex items-center py-1 px-2 text-xs rounded-sm cursor-pointer",
            "hover:bg-muted/50",
            item.name === activeFile && "bg-muted font-medium text-primary"
          )}
          style={{ paddingLeft: `${(level * 12) + 8}px` }}
          onClick={() => item.type === 'file' && setActiveFile(item.name)}
        >
          <Icon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <span>{item.name}</span>
        </div>
        {item.type === 'folder' && item.expanded && item.children?.map((child: any) =>
          renderItem(child, level + 1)
        )}
      </div>
    );
  };

  // If we're in server-side rendering, return minimal UI to avoid hydration issues
  if (!isClient) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground" suppressHydrationWarning>
        <div className="flex items-center justify-between p-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h1 className="text-sm font-medium">Code Editor</h1>
          </div>
        </div>
        <div className="flex-1 grid place-items-center">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground" suppressHydrationWarning>
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

      {/* Main Editor Layout with Resizable Panels */}
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
      >
        {/* Sidebar Panel */}
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={25}
          className="border-r border-border"
        >
          <div className="flex items-center justify-between p-2 border-b border-border">
            <div className="flex items-center">
              <GitBranch className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span className="text-xs">main</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100%-33px)]">
            <div className="p-2">
              {files.map(item => renderItem(item))}
            </div>
          </ScrollArea>
        </ResizablePanel>

        {/* Resizable Handle */}
        <ResizableHandle />

        {/* Editor Panel */}
        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={75} minSize={30}>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30">
                <div className="flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{activeFile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={handleCopyCode}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Copy code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={handleDownloadCode}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Download file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Monaco Editor */}
              <div className="h-[calc(100%-33px)]">
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  value={defaultCode}
                  theme={currentTheme === 'light' ? 'shadcn-light' : 'shadcn-dark'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 16, bottom: 16 },
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
                    // Define both light and dark themes with default syntax highlighting
                    monaco.editor.defineTheme('shadcn-light', {
                      base: 'vs',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#ffffff',
                        'editor.foreground': '#020617',
                        'editorCursor.foreground': '#171717',
                        'editor.lineHighlightBackground': '#f5f5f5',
                        'editorLineNumber.foreground': '#737373',
                        'editorLineNumber.activeForeground': '#171717',
                        'editor.selectionBackground': '#f5f5f580',
                        'editor.selectionForeground': '#171717',
                        'editor.inactiveSelectionBackground': '#f5f5f5',
                        'editorWidget.background': '#ffffff',
                        'editorWidget.border': '#e5e5e5',
                        'editorSuggestWidget.background': '#ffffff',
                        'editorSuggestWidget.border': '#e5e5e5',
                        'editorSuggestWidget.foreground': '#020617',
                        'editorSuggestWidget.highlightForeground': '#171717',
                        'editorSuggestWidget.selectedBackground': '#f5f5f5',
                      }
                    });

                    monaco.editor.defineTheme('shadcn-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#0a0a0a',
                        'editor.foreground': '#fafafa',
                        'editorCursor.foreground': '#fafafa',
                        'editor.lineHighlightBackground': '#27272a',
                        'editorLineNumber.foreground': '#a1a1aa',
                        'editorLineNumber.activeForeground': '#fafafa',
                        'editor.selectionBackground': '#27272a80',
                        'editor.selectionForeground': '#fafafa',
                        'editor.inactiveSelectionBackground': '#27272a',
                        'editorWidget.background': '#0a0a0a',
                        'editorWidget.border': '#27272a',
                        'editorSuggestWidget.background': '#0a0a0a',
                        'editorSuggestWidget.border': '#27272a',
                        'editorSuggestWidget.foreground': '#fafafa',
                        'editorSuggestWidget.highlightForeground': '#fafafa',
                        'editorSuggestWidget.selectedBackground': '#27272a',
                      }
                    });
                  }}
                  onMount={(editor, monaco) => {
                    setEditorInstance(editor);
                    setMonacoInstance(monaco);
                  }}
                />
              </div>
            </ResizablePanel>

            {/* Resizable Handle for Console */}
            <ResizableHandle withHandle />
            
            {/* Console Panel - Simplified to avoid hydration issues */}
            <ResizablePanel defaultSize={25} minSize={10}>
              <div className="h-full border-t border-border bg-background flex flex-col">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-border">
                  <div className="flex items-center">
                    <Terminal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-xs font-medium">Console</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      <Filter className="h-3 w-3 mr-1" />
                      <span className="sr-only md:not-sr-only md:ml-1">Filter</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs px-2">
                      <X className="h-3 w-3" />
                      <span className="sr-only">Clear</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-auto p-2">
                  <div className="text-xs text-muted-foreground flex items-center justify-center h-full italic">
                    No logs available to display
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}