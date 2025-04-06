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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
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

interface ReasoningPreviewProps {
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

export function ReasoningPreview({ content, currentWordIndex = -1 }: ReasoningPreviewProps) {
    const [isThinkingOpen, setIsThinkingOpen] = useState(false)

    // Filter out empty list items before processing
    const cleanContent = (text: string): string => {
        // More aggressive cleaning approach
        return text
            // Remove lines that are just list markers with optional whitespace
            .replace(/^(\s*[-*+][ \t]*|\s*\d+\.[ \t]*)$/gm, '')
            
            // Remove lines with list markers followed by only whitespace characters or HTML entities
            .replace(/^(\s*[-*+][ \t]+)([ \t\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|&nbsp;)*$/gm, '')
            .replace(/^(\s*\d+\.[ \t]+)([ \t\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|&nbsp;)*$/gm, '')
            
            // Handle common HTML entities and invisible Unicode characters
            .replace(/^(\s*[-*+][ \t]+)([^\S\r\n]|&[a-z0-9#]+;|[\u200B-\u200D\uFEFF])*$/gmi, '')
            .replace(/^(\s*\d+\.[ \t]+)([^\S\r\n]|&[a-z0-9#]+;|[\u200B-\u200D\uFEFF])*$/gmi, '')
            
            // Normalize multiple newlines to prevent excessive spacing
            .replace(/\n{3,}/g, '\n\n');
    };

    // Add this helper function
    const removeEmptyListItems = (markdown: string): string => {
        // Split the markdown into lines
        const lines = markdown.split('\n');
        
        // Filter out lines that are just list markers
        const filteredLines = lines.filter(line => {
            // Skip lines that are just list markers with optional whitespace
            return !(/^\s*[-*+][ \t]*$/.test(line) || /^\s*\d+\.[ \t]*$/.test(line));
        });
        
        // Join the filtered lines back into a string
        return filteredLines.join('\n');
    };

    // Split content into thinking and answer sections
    const splitContent = () => {
        // Clean the content first
        let cleanedContent = cleanContent(content);
        
        // Additional post-processing to remove any remaining empty list items
        cleanedContent = removeEmptyListItems(cleanedContent);
        
        // Look for common section headers that might indicate the answer part
        const answerPatterns = [
            /#{1,6}\s*Answer:?/i,
            /^\s*Answer:?/im,
            /#{1,6}\s*Conclusion:?/i,
            /^\s*Conclusion:?/im,
            /#{1,6}\s*Final Answer:?/i,
            /^\s*Final Answer:?/im,
        ]

        let thinking = cleanedContent
        let answer = ""

        // Try to find where the answer section begins
        for (const pattern of answerPatterns) {
            const match = cleanedContent.match(pattern)
            if (match && match.index !== undefined) {
                thinking = cleanedContent.substring(0, match.index).trim()
                answer = cleanedContent.substring(match.index).trim()
                break
            }
        }

        // If no answer section found, consider everything as answer
        if (!answer) {
            answer = cleanedContent
            thinking = ""
        }

        return { thinking, answer }
    }

    const { thinking, answer } = splitContent()

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
        li: ({ children, ...props }: BasicComponentProps) => {
            // If children is empty or contains only whitespace, don't render the list item
            const content = getTextFromChildren(children);
            if (!content || /^\s*$/.test(content)) {
                return null;
            }
            
            return (
                <li {...props}>
                    <TextRenderer>{children}</TextRenderer>
                </li>
            );
        },
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
        math: ({ value }: { value: string }) => (
            <Card className="my-4 overflow-x-auto p-4">
                <BlockMath math={value} />
            </Card>
        ),
        inlineMath: ({ value }: { value: string }) => <InlineMath math={value} />,
    };

    return (
        <div className="prose prose-sm dark:prose-invert min-w-full [&_ol]:ml-2 [&_pre]:bg-transparent [&_pre]:p-0">

            {/* Display thinking section in a collapsible */}
            {thinking && (
                <Collapsible
                    open={isThinkingOpen}
                    onOpenChange={setIsThinkingOpen}
                    className="border rounded-lg !m-0 px-4 py-2"
                >
                    <div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="flex w-full justify-between p-0 hover:bg-transparent">
                                <span>View thinking</span>
                                <ChevronUp className={`h-4 w-4 transition-transform ${isThinkingOpen ? "" : "rotate-180"}`} />
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="border-t border-dashed mt-2 !py-0">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                        >
                            {thinking}
                        </ReactMarkdown>
                    </CollapsibleContent>
                </Collapsible>
            )}

            {/* Display the answer section first */}
            {answer && (
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={markdownComponents}
                >
                    {answer}
                </ReactMarkdown>
            )}
        </div>
    )
}