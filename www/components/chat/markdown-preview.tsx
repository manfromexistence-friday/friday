import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { InlineMath, BlockMath } from 'react-katex'
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import 'katex/dist/katex.min.css'

// Custom theme extensions for coldarkDark
const codeTheme = {
    ...coldarkDark,
    'pre[class*="language-"]': {
        ...coldarkDark['pre[class*="language-"]'],
        backgroundColor: 'hsl(var(--background))',
        borderRadius: '0 0 0.5rem 0.5rem',
    },
    'code[class*="language-"]': {
        ...coldarkDark['code[class*="language-"]'],
        backgroundColor: 'transparent',
    }
}

interface CodeBlockProps {
    language: string
    value: string
}

function CodeBlock({ language, value }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="w-full overflow-hidden">
            <div className={cn(
                "bg-background flex items-center justify-between px-4 py-2",
                isCollapsed ? "" : "border-b"
            )}>
                <div className="flex items-center gap-2">
                    <span className='h-full text-center text-sm'>{language}</span>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hover:text-primary text-muted-foreground h-full"
                    >
                        {isCollapsed ? (
                            <ChevronDown className="size-4" />
                        ) : (
                            <ChevronUp className="size-4" />
                        )}
                    </button>
                </div>
                <button
                    onClick={copyToClipboard}
                    className="hover:text-primary text-muted-foreground"
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </button>
            </div>
            <div
                className={cn(
                    "transition-all duration-200 ease-in-out",
                    isCollapsed ? "max-h-0" : "max-h-fit"
                )}
            >
                <ScrollArea
                    className="relative w-full"
                >
                    <div className="min-w-full p-2">
                        <SyntaxHighlighter
                            style={codeTheme}
                            language={language}
                            PreTag="div"
                            customStyle={{
                                margin: 0,
                                background: 'transparent',
                                minWidth: '100%',
                                width: 'fit-content',
                                whiteSpace: 'pre',
                            }}
                        >
                            {value}
                        </SyntaxHighlighter>
                    </div>
                </ScrollArea>
            </div>
        </Card>
    )
}

export function MarkdownPreview({ content }: { content: string }) {
    return (
        <div className="prose prose-sm dark:prose-invert min-w-full [&_ol]:ml-2 [&_pre]:bg-transparent [&_pre]:p-0">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={
                    {
                        code({ node, inline, className, children, ...props }: { node: unknown, inline: boolean, className?: string, children: React.ReactNode[] }) {
                            const match = /language-(\w+)/.exec(className || '')
                            if (!inline && match) {
                                return (
                                    <CodeBlock
                                        language={match[1]}
                                        value={String(children).replace(/\n$/, '')}
                                    />
                                )
                            }
                            return (
                                <code {...props} className={cn("bg-muted rounded-md", className)}>
                                    {children}
                                </code>
                            )
                        },
                        table({ children }: { children: React.ReactNode }) {
                            return (
                                <div className="my-4 w-full">
                                    <Table>
                                        {children}
                                    </Table>
                                </div>
                            )
                        },
                        thead({ children }: { children: React.ReactNode }) {
                            return <TableHeader>{children}</TableHeader>
                        },
                        tbody({ children }: { children: React.ReactNode }) {
                            return <TableBody>{children}</TableBody>
                        },
                        tr({ children }: { children: React.ReactNode }) {
                            return <TableRow>{children}</TableRow>
                        },
                        th({ children }: { children: React.ReactNode }) {
                            return <TableHead>{children}</TableHead>
                        },
                        td({ children }: { children: React.ReactNode }) {
                            return <TableCell>{children}</TableCell>
                        },
                        blockquote({ children }: { children: React.ReactNode }) {
                            return (
                                <Alert className="my-4">
                                    <AlertDescription>{children}</AlertDescription>
                                </Alert>
                            )
                        },
                        math: ({ value }: { value: string }) => (
                            <Card className="my-4 overflow-x-auto p-4">
                                <BlockMath math={value} />
                            </Card>
                        ),
                        inlineMath: ({ value }: { value: string }) => <InlineMath math={value} />,
                    } as any}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}