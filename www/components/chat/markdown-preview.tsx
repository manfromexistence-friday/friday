import React, { useState, useEffect } from 'react'
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

interface ImageGenResponse {
  text: string;
  image: string;
  model_used: string;
  file_path: string;
}

interface ReasoningResponse {
  response: string;
  image?: string;
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

// Helper function to determine if a text might be a data URI for an image
const isDataUri = (text: string): boolean => {
    return text.trim().startsWith('data:image/') && text.includes('base64,');
}

// Helper function to extract the image URLs from content
const extractImageUrls = (content: string): string[] => {
    // This regex looks for data:image URLs in the content, including those in markdown image syntax
    const dataUriRegex = /data:image\/[^;]+;base64,[^\s)"']*/g;
    
    // Also look for image URLs in markdown format: ![...](data:image/...)
    const markdownImageRegex = /!\[[^\]]*\]\((data:image\/[^;]+;base64,[^\s)"']*)\)/g;
    
    let urls: string[] = [];
    
    // Extract direct data URIs
    const directMatches = content.match(dataUriRegex) || [];
    urls = [...urls, ...directMatches];
    
    // Extract URLs from markdown image syntax
    const markdownMatches = Array.from(content.matchAll(markdownImageRegex) || []);
    for (const match of markdownMatches) {
        if (match[1] && !urls.includes(match[1])) {
            urls.push(match[1]);
        }
    }
    
    return Array.from(new Set(urls)); // Remove duplicates
}

// Modify the parseJsonResponse function to better handle image_generation responses

const parseJsonResponse = (content: string): { text: string; imageUrl: string | null; isJsonContent: boolean } => {
    try {
        // First check if this is a full URL to an image endpoint
        if (content.trim().includes('friday-backend.vercel.app/image_generation')) {
            // This might be a direct reference to the image generation endpoint
            return {
                text: "Image generated successfully.",
                imageUrl: content.trim(),
                isJsonContent: true
            };
        }

        // Check if content is valid JSON
        const jsonData = JSON.parse(content);
        
        // Handle direct ImageGenResponse format (most important case)
        if (jsonData.text !== undefined && jsonData.image) {
            console.log("Found ImageGenResponse format", jsonData);
            return {
                text: jsonData.text || "Image generated successfully.",
                imageUrl: jsonData.image,
                isJsonContent: true
            };
        }
        
        // Handle ReasoningResponse format
        if (jsonData.response) {
            console.log("Found ReasoningResponse format", jsonData);
            return {
                text: jsonData.response,
                imageUrl: jsonData.image || null,
                isJsonContent: true
            };
        }
        
        // Other JSON format with image field
        if (jsonData.image) {
            console.log("Found generic JSON with image field", jsonData);
            return {
                text: jsonData.text || "Image generated successfully.",
                imageUrl: jsonData.image,
                isJsonContent: true
            };
        }
        
        // Generic JSON - use the full content
        return {
            text: content,
            imageUrl: null,
            isJsonContent: false
        };
    } catch (e) {
        // Not valid JSON, check if it's a direct URL to an image
        if (content.trim().startsWith('http') && 
            (content.trim().endsWith('.png') || 
             content.trim().endsWith('.jpg') || 
             content.trim().endsWith('.jpeg') || 
             content.trim().endsWith('.gif') ||
             content.trim().includes('image'))) {
            
            return {
                text: "Image generated successfully.",
                imageUrl: content.trim(),
                isJsonContent: true
            };
        }
        
        // Not valid JSON and not an image URL, use as plain text
        return {
            text: content,
            imageUrl: null,
            isJsonContent: false
        };
    }
}

// Add this utility function to check if the content is directly related to image generation
const isImageGenerationContent = (content: string): boolean => {
  return (
    content.includes('image_generation') || 
    content.includes('gemini-2.0-flash-exp-image-generation') ||
    (content.length < 1000 && content.includes('image'))
  );
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

// Component to render image galleries when multiple images are generated
function ImageGallery({ urls }: { urls: string[] }) {
    if (!urls || urls.length === 0) return null;
    
    return (
        <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {urls.map((url, index) => (
                <div key={index} className="overflow-hidden rounded-lg border shadow-md">
                    <img 
                        src={url} 
                        alt={`Generated image ${index + 1}`} 
                        className="mx-auto h-auto max-h-[60vh] w-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.appendChild(
                                document.createTextNode('Failed to load image')
                            );
                        }}
                    />
                    <div className="text-muted-foreground p-2 text-center text-sm">
                        Generated Image {index + 1}
                    </div>
                </div>
            ))}
        </div>
    );
}

// Component to render a single image with caption (for image generation and reasoning)
function GeneratedImage({ url, caption }: { url: string; caption?: string }) {
    const [error, setError] = useState(false);
    
    if (error) {
        return (
            <div className="bg-muted/20 my-4 rounded-lg border p-4 text-center">
                <p className="text-destructive">Failed to load image</p>
            </div>
        );
    }
    
    return (
        <div className="my-6 w-full">
            <div className="overflow-hidden rounded-lg border shadow-md">
                <img 
                    src={url} 
                    alt={caption || 'Generated image'} 
                    className="mx-auto h-auto max-h-[60vh] w-full object-contain"
                    loading="lazy"
                    onError={() => setError(true)}
                />
                {caption && (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                        {caption}
                    </div>
                )}
            </div>
        </div>
    );
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
    const [parsedContent, setParsedContent] = useState<{
        text: string;
        imageUrl: string | null;
        isJsonContent: boolean;
    }>({ text: content, imageUrl: null, isJsonContent: false });
    
    // Parse content when it changes, with special handling for image generation
    useEffect(() => {
        console.log("Original content:", content);

        // Direct handling for image_generation endpoint
        if (isImageGenerationContent(content)) {
            try {
                // Try to parse as JSON first
                const jsonData = JSON.parse(content);
                if (jsonData.image) {
                    console.log("Found direct image URL in JSON:", jsonData.image);
                    setParsedContent({
                        text: jsonData.text || "Image generated successfully.",
                        imageUrl: jsonData.image,
                        isJsonContent: true
                    });
                    return;
                }
            } catch (e) {
                // Not JSON, might be a direct URL or endpoint reference
                console.log("Not valid JSON, treating as direct reference to image");
                
                // If it looks like a URL or endpoint reference, treat it as an image URL
                if (content.includes('https://') || content.includes('http://')) {
                    setParsedContent({
                        text: "Image generated successfully.",
                        imageUrl: content.trim(),
                        isJsonContent: true
                    });
                    return;
                }
                
                // This could be a case where the model is referring to image generation 
                // but didn't actually provide an image URL
                if (content.includes('image_generation')) {
                    // In this case, we can either show a placeholder or just display the text
                    setParsedContent({
                        text: content,
                        imageUrl: null,
                        isJsonContent: false
                    });
                    return;
                }
            }
        }
        
        // Standard parsing for other content
        const parsed = parseJsonResponse(content);
        console.log("Parsed content:", parsed);
        setParsedContent(parsed);
    }, [content]);

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
        // Image rendering
        img: ({ src, alt, ...props }: { src?: string, alt?: string } & BasicComponentProps) => {
            const [error, setError] = useState(false);
            
            if (error) {
                return (
                    <div className="bg-muted/20 my-4 rounded-lg border p-4 text-center">
                        <p className="text-destructive">Failed to load image</p>
                    </div>
                );
            }
            
            if (src && (isDataUri(src) || src.startsWith('data:image/'))) {
                return (
                    <div className="my-4 w-full">
                        <img 
                            src={src} 
                            alt={alt || 'Generated image'} 
                            className="mx-auto h-auto max-w-full overflow-hidden rounded-lg shadow-md"
                            loading="lazy"
                            onError={() => setError(true)}
                            {...props}
                        />
                    </div>
                );
            }
            return <img src={src} alt={alt} onError={() => setError(true)} {...props} />;
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
            {/* Special handling for image generation strings */}
            {content === "image_generation" ? (
                <div className="my-6 w-full text-center">
                    <p>Image is being generated...</p>
                </div>
            ) : (
                <>
                    {/* Render markdown content */}
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={markdownComponents}
                    >
                        {parsedContent.isJsonContent ? parsedContent.text : content}
                    </ReactMarkdown>
                    
                    {/* Render single image from JSON response if available */}
                    {parsedContent.imageUrl && (
                        <GeneratedImage 
                            url={parsedContent.imageUrl} 
                            caption={parsedContent.isJsonContent ? "Generated Image" : undefined} 
                        />
                    )}
                    
                    {/* Render extracted image URLs if no JSON image was found */}
                    {!parsedContent.imageUrl && extractImageUrls(content).length > 0 && (
                        <ImageGallery urls={extractImageUrls(content)} />
                    )}
                </>
            )}
            
            <style jsx global>{`
                .prose .highlight {
                    background-color: hsl(var(--primary) / 0.2);
                    color: hsl(var(--primary));
                    font-weight: 500;
                    border-radius: 0.25rem;
                    padding-left: 0.25rem;
                    padding-right: 0.25rem;
                }
            `}</style>
        </div>
    )
}