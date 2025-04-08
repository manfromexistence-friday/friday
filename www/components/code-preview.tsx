"use client"

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import {
  Filter, X, Terminal, Code, RefreshCw,
  Copy, Download, FileText, Folder,
  FolderOpen, File, GitBranch, Settings,
  Check, ArrowLeft, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar"
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
import { useToast } from "@/hooks/use-toast"
import { Toast, ToastAction } from "@/components/ui/toast"

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
  const { toast } = useToast()
  // Initialize both sidebar and console to false to avoid hydration mismatch
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [consoleExpanded, setConsoleExpanded] = useState(false)
  const SIDEBAR_WIDTH = 250; // Constant for sidebar width to keep it consistent
  // Sample code to display in the editor
  const defaultCode = `const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
]

const transitionProps = {}
`
  // Fix hydration mismatch by ensuring client-side only rendering for interactive elements
  useEffect(() => {
    setIsClient(true)
    setActiveFile("App.tsx")
    setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark')
    // Set values after client-side rendering to avoid hydration mismatch
    setTimeout(() => {
      setSidebarOpen(true)
      setConsoleExpanded(true)
    }, 0)
  }, [resolvedTheme])
  // Handle copy code
  const handleCopyCode = () => {
    if (editorInstance) {
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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" suppressHydrationWarning>
      <div className="flex items-center justify-between p-2 border-b border-border h-[41px]">
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
      <div className="flex flex-1 h-[calc(100vh-41px)] relative">
        {/* Sidebar toggle button - Positioned absolutely to remain visible */}
        <motion.button
          className="absolute left-0 top-4 z-20 rounded-r-md bg-primary text-primary-foreground p-1.5 shadow-md"
          onClick={toggleSidebar}
          whileTap={{ scale: 0.9 }}
          initial={false}
          animate={{
            x: sidebarOpen ? SIDEBAR_WIDTH : 0,
            transition: { type: "spring", stiffness: 300, damping: 20 }
          }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {sidebarOpen ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </motion.div>
        </motion.button>
        
        {/* Sidebar with Files */}
        <motion.div
          className="h-full border-r border-border bg-muted/30"
          initial={false}
          animate={{
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ flexShrink: 0 }}
        >
          <div className="h-full overflow-hidden">
            <div className="p-2 h-full w-full">
              <h3 className="text-xs font-medium mb-2 text-muted-foreground">Project Files</h3>
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
        </motion.div>
        
        {/* Main Editor Content */}
        <motion.div 
          className="flex-1 h-full overflow-hidden"
          initial={false}
          animate={{ 
            marginLeft: sidebarOpen ? 0 : 0 
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%' }}
        >
          <ResizablePanelGroup direction="vertical">
            {/* Code Editor Panel */}
            <ResizablePanel defaultSize={75} minSize={30}>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/30 h-[33px]">
                <div className="flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{activeFile}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={handleCopyCode}
                        >
                          <Copy className="h-3.5 w-3.5" />
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
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={handleDownloadCode}
                        >
                          <Download className="h-3.5 w-3.5" />
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
                      indentation: true,
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
            <ResizableHandle className={consoleExpanded ? "" : "hidden"} />
            {/* Console Panel - Fixed to be just header when collapsed */}
            <ResizablePanel
              defaultSize={25}
              minSize={consoleExpanded ? 10 : 0}
              maxSize={consoleExpanded ? 50 : 5}
              className={consoleExpanded ? "" : "!h-[40px] !min-h-[40px] overflow-hidden"}
            >
              <div className="h-full border-t border-border bg-background flex flex-col">
                {/* Console Header - Always visible */}
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-border h-[40px]">
                  <div className="flex items-center">
                    <Terminal className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                    <span className="text-xs font-medium">Console</span>
                  </div>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            onClick={toggleConsole}
                          >
                            {consoleExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronUp className="h-3.5 w-3.5" />
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
                  <div className="flex-1 overflow-auto p-2 h-[calc(100%-40px)]">
                    <div className="text-xs text-muted-foreground flex items-center justify-center h-full italic">
                      No logs available to display
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </motion.div>
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
          "flex items-center py-1 px-2 text-xs rounded-sm cursor-pointer w-full",
          "hover:bg-accent/50",
          item.name === activeFile && "bg-accent/70 font-medium text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        <Icon className="h-3.5 w-3.5 min-w-[14px] mr-1.5 text-muted-foreground" />
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