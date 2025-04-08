"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
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

// Create ErrorBoundary component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground p-4">
      <h2 className="text-red-500 text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm mt-2">{error.message || "Unknown error occurred"}</p>
      <Button 
        className="mt-4" 
        onClick={resetErrorBoundary}
        variant="outline"
      >
        Try Again
      </Button>
    </div>
  );
}

export function CodeEditor() {
  // State hooks
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
  const [isEditorReady, setIsEditorReady] = useState(false)
  
  const SIDEBAR_WIDTH = 250;
  
  const defaultCode = `const cuisines = [
  "Mexican",
  "Italian",
  "Chinese",
]

const transitionProps = {}
`
  // Reset any error state
  const resetError = useCallback(() => {
    setEditorError(null);
  }, []);

  // Memoize the editor mount handler to prevent unnecessary re-renders
  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    try {
      setEditorInstance(editor);
      setMonacoInstance(monaco);
      setIsEditorReady(true);
    } catch (error) {
      console.error("Error during editor mount:", error);
      setEditorError(error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

  // Initialize client-side state
  useEffect(() => {
    try {
      setIsClient(true);
      setActiveFile("App.tsx");
      setCurrentTheme(resolvedTheme === 'light' ? 'light' : 'dark');
      
      // Delayed initialization to avoid hydration issues
      const timer = setTimeout(() => {
        try {
          setSidebarOpen(true);
          setConsoleExpanded(true);
        } catch (err) {
          console.error("Error in delayed initialization:", err);
        }
      }, 100); // Slightly longer timeout to ensure hydration is complete
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error("Error in initialization effect:", error);
      setEditorError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [resolvedTheme]);
  
  // Copy code with error handling
  const handleCopyCode = useCallback(() => {
    if (!editorInstance) return;
    
    try {
      const code = editorInstance.getValue();
      navigator.clipboard.writeText(code)
        .then(() => {
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
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "There was an error copying to clipboard",
          });
        });
    } catch (error) {
      console.error("Error while copying code:", error);
    }
  }, [editorInstance, activeFile, toast]);
  
  // Download code with error handling
  const handleDownloadCode = useCallback(() => {
    if (!editorInstance) return;
    
    try {
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
      
      toast({
        title: "File downloaded",
        description: `Successfully saved ${activeFile || "code.tsx"}`,
        action: (
          <ToastAction altText="Dismiss">Dismiss</ToastAction>
        ),
      });
    } catch (error) {
      console.error("Error while downloading code:", error);
    }
  }, [editorInstance, activeFile, toast]);
  
  // Update theme when it changes
  useEffect(() => {
    if (!isClient || !monacoInstance || !editorInstance || !isEditorReady) return;
    
    try {
      const themeToUse = resolvedTheme === 'light' ? 'shadcn-light' : 'shadcn-dark';
      editorInstance.updateOptions({ theme: themeToUse });
    } catch (err) {
      console.error("Failed to update editor theme:", err);
    }
  }, [resolvedTheme, monacoInstance, editorInstance, isClient, isEditorReady]);
  
  // Toggle handlers as callbacks to prevent re-creation
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const toggleConsole = useCallback(() => {
    setConsoleExpanded(prev => !prev);
  }, []);
  
  // Server-side rendering fallback
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

  // Error state handling
  if (editorError) {
    return <ErrorFallback error={editorError} resetErrorBoundary={resetError} />;
  }

  // Wrap the entire component in a try-catch to catch any rendering errors
  try {
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
        
        {/* Main Editor Layout */}
        <div className="flex flex-1 h-[calc(100vh-41px)] relative">
          {/* Sidebar toggle button */}
          <button
            className={cn(
              "absolute left-0 top-4 z-20 rounded-r-md bg-primary text-primary-foreground p-1.5 shadow-md",
              "transition-transform duration-300"
            )}
            onClick={toggleSidebar}
            style={{
              transform: `translateX(${sidebarOpen ? SIDEBAR_WIDTH : 0}px)`
            }}
          >
            {sidebarOpen ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
          
          {/* Sidebar with Files - Using simple transition instead of motion for stability */}
          <div
            className="h-full border-r border-border bg-muted/30 overflow-hidden transition-all duration-300"
            style={{
              width: sidebarOpen ? `${SIDEBAR_WIDTH}px` : '0px',
              opacity: sidebarOpen ? 1 : 0,
              flexShrink: 0
            }}
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
          </div>
          
          {/* Main Editor Content */}
          <div 
            className="flex-1 h-full overflow-hidden transition-all duration-300"
            style={{ 
              width: sidebarOpen ? `calc(100% - ${SIDEBAR_WIDTH}px)` : '100%' 
            }}
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
                
                {/* Monaco Editor with simplified options and error handling */}
                <div className="h-[calc(100%-33px)] overflow-hidden">
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    value={defaultCode}
                    theme={currentTheme === 'light' ? 'vs-light' : 'vs-dark'} // Use built-in themes first
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      fontFamily: "monospace", // Simplified font family
                      contextmenu: true,
                    }}
                    beforeMount={(monaco) => {
                      try {
                        // Only define custom themes if needed
                        monaco.editor.defineTheme('shadcn-light', {
                          base: 'vs',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#ffffff',
                            'editor.foreground': '#020617',
                          }
                        });
                        monaco.editor.defineTheme('shadcn-dark', {
                          base: 'vs-dark',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#0a0a0a',
                            'editor.foreground': '#fafafa',
                          }
                        });
                      } catch (error) {
                        console.error("Error in beforeMount:", error);
                        setEditorError(error instanceof Error ? error : new Error(String(error)));
                      }
                    }}
                    onMount={handleEditorMount}
                    loading={<div className="text-center p-4">Loading editor...</div>}
                  />
                </div>
              </ResizablePanel>
              
              {/* Resizable Handle for Console */}
              {consoleExpanded && <ResizableHandle />}
              
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
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Render error in CodeEditor:", error);
    return <ErrorFallback error={error instanceof Error ? error : new Error(String(error))} resetErrorBoundary={resetError} />;
  }
}

// FileTreeItem component with memoized state and callback
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

  const handleClick = useCallback(() => {
    if (isFolder) {
      setExpanded(prev => !prev);
    } else {
      setActiveFile(item.name);
    }
  }, [isFolder, item.name, setActiveFile]);

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