"use client"

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Code } from 'lucide-react'

// Dynamically import the CodeEditor component with SSR disabled
const CodeEditorComponent = dynamic(
  () => import('./code-preview').then(mod => ({ default: mod.CodeEditor })),
  { ssr: false }
)

export function CodeEditorWrapper() {
  return (
    <div suppressHydrationWarning>
      <Suspense fallback={
        <div className="flex flex-col h-screen bg-background text-foreground">
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
      }>
        <CodeEditorComponent />
      </Suspense>
    </div>
  )
}
