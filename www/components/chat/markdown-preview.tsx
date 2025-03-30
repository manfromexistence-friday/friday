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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import 'katex/dist/katex.min.css'
import type { Components } from 'react-markdown'

// Extend Components type to include math components
declare module 'react-markdown' {
  interface ComponentPropsWithoutRef<T> {
    value?: string;
  }
}

type CustomComponents = Omit<Components, 'code'> & {
    code: React.ComponentType<{ inline?: boolean; className?: string; children?: React.ReactNode } & BasicComponentProps>;
    math: React.ComponentType<{ value: string }>;
    inlineMath: React.ComponentType<{ value: string }>;
}
  
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
                    className="relative w-full text-lg"
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

interface MarkdownPreviewProps {
  content: string
  currentWordIndex?: number
}

// Define a type for the children prop
interface TextRendererProps {
  children: React.ReactNode;
}

// Define basic component props type
interface BasicComponentProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export function MarkdownPreview({ content, currentWordIndex = -1 }: MarkdownPreviewProps) {
    const splitIntoTokens = (text: string) => {
        return text.match(/[a-zA-Z0-9']+|[^\s\w']+|\s+/g) || []
    }

    // Helper function to safely convert ReactNode to string
    const getTextFromChildren = (children: React.ReactNode): string => {
        if (children === undefined || children === null) return '';
        if (typeof children === 'string') return children;
        if (typeof children === 'number') return String(children);
        if (Array.isArray(children)) {
            return children.map(getTextFromChildren).join('');
        }
        return '';
    }

    const TextRenderer = ({ children }: TextRendererProps) => {
        const plainText = getTextFromChildren(children);
        const tokens = splitIntoTokens(plainText);
        let wordIndex = 0;

        return (
            <>
                {tokens.map((token, index) => {
                    const isWord = /[a-zA-Z0-9']+/.test(token);
                    const tokenIndex = isWord ? wordIndex++ : -1;
                    return (
                        <span
                            key={index}
                            className={isWord && tokenIndex === currentWordIndex ? "bg-primary/20 text-primary rounded px-1 font-medium" : ""}
                        >
                            {token}
                        </span>
                    );
                })}
            </>
        );
    };

    // Build markdown components with proper typing
    const markdownComponents: CustomComponents = {
        code({ inline, className, children, ...props }: { inline?: boolean, className?: string, children?: React.ReactNode } & BasicComponentProps) {
            const match = /language-(\w+)/.exec(className || '')
            if (!inline && match && children) {
                return (
                    <CodeBlock
                        language={match[1]}
                        value={String(children).replace(/\n$/, '')}
                    />
                )
            }
            return (
                <code className={cn("bg-muted rounded-md", className)} {...props}>
                    {children}
                </code>
            )
        },
        // Text formatting components with highlighting
        p: ({ children, ...props }: BasicComponentProps) => (
            <p {...props}>
                <TextRenderer>{children}</TextRenderer>
            </p>
        ),
        li: ({ children, ...props }: BasicComponentProps) => (
            <li {...props}>
                <TextRenderer>{children}</TextRenderer>
            </li>
        ),
        h1: ({ children, ...props }: BasicComponentProps) => (
            <h1 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h1>
        ),
        h2: ({ children, ...props }: BasicComponentProps) => (
            <h2 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h2>
        ),
        h3: ({ children, ...props }: BasicComponentProps) => (
            <h3 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h3>
        ),
        h4: ({ children, ...props }: BasicComponentProps) => (
            <h4 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h4>
        ),
        h5: ({ children, ...props }: BasicComponentProps) => (
            <h5 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h5>
        ),
        h6: ({ children, ...props }: BasicComponentProps) => (
            <h6 {...props}>
                <TextRenderer>{children}</TextRenderer>
            </h6>
        ),
        a: ({ children, ...props }: BasicComponentProps) => (
            <a {...props}>
                <TextRenderer>{children}</TextRenderer>
            </a>
        ),
        em: ({ children, ...props }: BasicComponentProps) => (
            <em {...props}>
                <TextRenderer>{children}</TextRenderer>
            </em>
        ),
        strong: ({ children, ...props }: BasicComponentProps) => (
            <strong {...props}>
                <TextRenderer>{children}</TextRenderer>
            </strong>
        ),
        // Table components
        table: ({ children, ...props }: BasicComponentProps) => {
            return (
                <div className="my-4 w-full">
                    <Table>{children}</Table>
                </div>
            )
        },
        thead: ({ children, ...props }: BasicComponentProps) => {
            return <TableHeader>{children}</TableHeader>
        },
        tbody: ({ children, ...props }: BasicComponentProps) => {
            return <TableBody>{children}</TableBody>
        },
        tr: ({ children, ...props }: BasicComponentProps) => {
            return <TableRow>{children}</TableRow>
        },
        th: ({ children, ...props }: BasicComponentProps) => {
            return <TableHead>{children}</TableHead>
        },
        td: ({ children, ...props }: BasicComponentProps) => {
            return <TableCell>{children}</TableCell>
        },
        // Special elements
        blockquote: ({ children, ...props }: BasicComponentProps) => {
            return (
                <Alert className="my-4">
                    <AlertDescription>
                        <TextRenderer>{children}</TextRenderer>
                    </AlertDescription>
                </Alert>
            )
        },
        // Simple img tag without special handling
        img: ({ src, alt, ...props }: { src?: string, alt?: string } & BasicComponentProps) => {
            return <img src={src} alt={alt} {...props} />;
        },
        math: ({ value }: { value: string }) => (
            <Card className="my-4 overflow-x-auto p-4">
                <BlockMath math={value} />
            </Card>
        ),
        inlineMath: ({ value }: { value: string }) => <InlineMath math={value} />,
    };

    return (
        <div className="prose prose-sm dark:prose-invert min-w-full [&_ol]:ml-2 [&_pre]:bg-transparent [&_pre]:p-0">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}