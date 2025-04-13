"use client"

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import {
  Terminal, Code, RefreshCw,
  Copy, Download, FileText, Folder,
  FolderOpen, ArrowLeft, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "@/components/ui/resizable"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ToastAction } from "@/components/ui/toast"

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
  const { resolvedTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string | undefined>(undefined)
  const [monacoInstance, setMonacoInstance] = useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [activeFile, setActiveFile] = useState<string | undefined>(undefined)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [consoleExpanded, setConsoleExpanded] = useState(false)
  const [editorError, setEditorError] = useState<Error | null>(null)
  const SIDEBAR_WIDTH = 250; // Constant for sidebar width to keep it consistent
  // Sample code to display in the editor
  const defaultCode = `const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
]

const transitionProps = {}
`
  // Monaco Editor mounting handler with error handling
  const handleEditorMount = (editor: any, monaco: any) => {
    try {
      setEditorInstance(editor);
      setMonacoInstance(monaco);
    } catch (error) {
      console.error("Error during editor mount:", error);
    }
  };

  // Fix hydration mismatch by ensuring client-side only rendering for interactive elements
  useEffect(() => {
    try {
      setIsClient(true)
      setActiveFile("App.tsx")
      setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark')
      // Set values after client-side rendering to avoid hydration mismatch
      const timer = setTimeout(() => {
        setSidebarOpen(true)
        setConsoleExpanded(true)
      }, 0)
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in initialization effect:", error);
    }
  }, [resolvedTheme])
  
  // Handle copy code with error handling
  const handleCopyCode = () => {
    if (!editorInstance) return;
    
    try {
      const code = editorInstance.getValue();
      navigator.clipboard.writeText(code)
        .then(() => {
          // Show toast notification on successful copy
          toast({
            title: "Code copied to clipboard",
            description: `Successfully copied code from ${activeFile}`,
            action: (
              <ToastAction altText="Dismiss">Dismiss</ToastAction>
            ),
          });
        })
        .catch(err => {
          console.error('Failed to copy code:', err);
          // Show error toast if copy fails
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "There was an error copying to clipboard",
          });
        });
    } catch (error) {
      console.error("Error while copying code:", error);
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
      // Show toast notification on successful download
      toast({
        title: "File downloaded",
        description: `Successfully saved ${activeFile || "code.tsx"}`,
        action: (
          <ToastAction altText="Dismiss">Dismiss</ToastAction>
        ),
      });
    }
  }
  // Update theme when it changes - after component is mounted
  useEffect(() => {
    if (!isClient || !monacoInstance || !editorInstance) return;
    
    try {
      const themeToUse = resolvedTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
      editorInstance.updateOptions({ theme: themeToUse });
    } catch (err) {
      console.error("Failed to update editor theme:", err);
    }
  }, [resolvedTheme, monacoInstance, editorInstance, isClient]);
  // Toggle sidebar visibility with animation
  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }
  const toggleConsole = () => {
    setConsoleExpanded(prev => !prev)
  }
  // If we're in server-side rendering, return minimal UI to avoid hydration issues
  if (!isClient) {
    return (
      <div className="bg-background text-foreground flex h-[calc(100vh-48px)] flex-col" suppressHydrationWarning>
        <div className="border-border flex items-center justify-between border-b p-2">
          <div className="flex items-center gap-2">
            <Code className="text-primary size-5" />
            <h1 className="text-sm font-medium">Code Editor</h1>
          </div>
        </div>
        <div className="grid flex-1 place-items-center">
          <div className="text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  // Check for editor errors after the client-side check
  if (editorError) {
    return (
      <div className="bg-background text-foreground flex h-[calc(100vh-48px)] flex-col p-4">
        <h2 className="text-lg font-semibold text-red-500">Editor Error</h2>
        <p className="mt-2 text-sm">{editorError.message}</p>
        <Button 
          className="mt-4" 
          onClick={() => setEditorError(null)}
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex h-[calc(100vh-48px)] flex-col overflow-hidden" suppressHydrationWarning>
      <div className="border-border flex h-[41px] items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <Code className="text-primary size-5" />
          <h1 className="text-sm font-medium">Code Editor</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8">
            <RefreshCw className="mr-1 size-4" />
            Reset
          </Button>
        </div>
      </div>
      {/* Main Editor Layout with Resizable Panels */}
      <div className="relative flex h-[calc(100%-41px)] flex-1">
        {/* Sidebar toggle button - Fixed position relative to parent */}
        <button
          className="bg-primary text-primary-foreground absolute left-0 top-4 z-30 rounded-r-md p-1.5 shadow-md transition-transform duration-300"
          onClick={toggleSidebar}
          style={{
            transform: `translateX(${sidebarOpen ? SIDEBAR_WIDTH : 0}px)`
          }}
        >
          {sidebarOpen ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
        
        {/* Fixed-width sidebar container */}
        <div 
          className="h-full transition-all duration-300 ease-in-out"
          style={{ 
            width: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px',
            overflow: 'hidden',
            flexShrink: 0
          }}
        >
          {/* Sidebar content container */}
          <div className="border-border bg-muted/30 h-full border-r" style={{ width: `${SIDEBAR_WIDTH}px` }}>
            <div className="h-full overflow-hidden">
              <div className="size-full p-2">
                <h3 className="text-muted-foreground mb-2 text-xs font-medium">Project Files</h3>
                <div className="space-y-0.5">
                  {files.map((item) => (
                    <FileTreeItem
                      key={item.name}
                      item={item}
                      activeFile={activeFile}
                      setActiveFile={setActiveFile}
                      level={0}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Editor Content - Width explicitly reduced when sidebar is open */}
        <div 
          className="h-full overflow-hidden transition-all duration-300 ease-in-out"
          style={{ 
            width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%',
            flexGrow: 1,
          }}
        >
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={75} minSize={30}>
              {/* Editor Header */}
              <div className="border-border bg-muted/30 flex h-[33px] items-center justify-between border-b px-3 py-1.5">
                <div className="flex items-center">
                  <FileText className="text-muted-foreground mr-1.5 size-3.5" />
                  <span className="text-xs font-medium">{activeFile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground size-6"
                          onClick={handleCopyCode}
                        >
                          <Copy className="size-3.5" />
                          <span className="sr-only">Copy code</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={5}>
                        <p className="text-xs">Copy to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground size-6"
                          onClick={handleDownloadCode}
                        >
                          <Download className="size-3.5" />
                          <span className="sr-only">Download file</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={5}>
                        <p className="text-xs">Download as file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              {/* Monaco Editor */}
              <div className="h-[calc(100%-33px)] overflow-hidden">
                <Editor
                  height="100%"
                  defaultLanguage="typescript"
                  value={defaultCode}
                  theme={currentTheme === 'light' ? 'shadcn-light' : 'shadcn-dark'}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 24,
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
                      indentation: true,
                    },
                  }}
                  beforeMount={(monaco) => {
                    try {
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
                    } catch (error) {
                      console.error("Error in beforeMount:", error);
                      setEditorError(error instanceof Error ? error : new Error(String(error)));
                    }
                  }}
                  onMount={handleEditorMount}
                />
              </div>
            </ResizablePanel>
            {/* Resizable Handle for Console */}
            <ResizableHandle className={consoleExpanded ? "" : "hidden"} />
            {/* Console Panel - Fixed to be just header when collapsed */}
            <ResizablePanel
              defaultSize={25}
              minSize={consoleExpanded ? 10 : 0}
              maxSize={consoleExpanded ? 50 : 5}
              className={consoleExpanded ? "" : "!h-[40px] !min-h-[40px] overflow-hidden"}
            >
              <div className="border-border bg-background flex h-full flex-col border-t">
                {/* Console Header - Always visible */}
                <div className="border-border flex h-[40px] items-center justify-between border-b px-3 py-1.5">
                  <div className="flex items-center">
                    <Terminal className="text-muted-foreground mr-1.5 size-3.5" />
                    <span className="text-xs font-medium">Console</span>
                  </div>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground size-6"
                            onClick={toggleConsole}
                          >
                            {consoleExpanded ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronUp className="size-3.5" />
                            )}
                            <span className="sr-only">
                              {consoleExpanded ? "Collapse console" : "Expand console"}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={5}>
                          <p className="text-xs">{consoleExpanded ? "Collapse" : "Expand"} console</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Console Content - Only visible when expanded */}
                {consoleExpanded && (
                  <div className="h-[calc(100%-40px)] flex-1 overflow-auto p-2">
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs italic">
                      No logs available to display
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}

// Helper component for recursive file tree rendering within the Sidebar
function FileTreeItem({
  item,
  activeFile,
  setActiveFile,
  level = 0
}: {
  item: any;
  activeFile?: string;
  setActiveFile: (file: string) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(() => !!item.expanded);
  const isFolder = item.type === 'folder';
  const Icon = isFolder ? (expanded ? FolderOpen : Folder) : FileText;

  const handleClick = () => {
    if (isFolder) {
      setExpanded(!expanded);
    } else {
      setActiveFile(item.name);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "flex w-full cursor-pointer items-center rounded-sm px-2 py-1 text-xs",
          "hover:bg-accent/50",
          item.name === activeFile && "bg-accent/70 text-accent-foreground font-medium"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <Icon className="text-muted-foreground mr-1.5 size-3.5 min-w-[14px]" />
        <span className="truncate">{item.name}</span>
      </div>

      {isFolder && expanded && item.children?.length > 0 && (
        <div className="w-full">
          {item.children.map((child: any) => (
            <FileTreeItem
              key={child.name}
              item={child}
              activeFile={activeFile}
              setActiveFile={setActiveFile}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}