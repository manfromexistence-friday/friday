"use client"
import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Message, ChatState } from '@/types/chat'

export default function ChatPage() {
    const [chatState, setChatState] = useState<ChatState>({
        messages: [],
        isLoading: false,
        error: null,
    })
    const [input, setInput] = useState('')
    const [conversationHistory, setConversationHistory] = useState<string>('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chatState.messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
        }

        // Update conversation history
        const contextWindow = 3;
        const conversations = conversationHistory.split('\n')
            .slice(-contextWindow * 4)
            .join('\n');

        const newHistory = conversations + 
            `\nHuman: ${input.trim()}\nAssistant:`;
        
        setConversationHistory(newHistory);

        setChatState(prev => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isLoading: true,
            error: null,
        }))
        setInput('')

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: newHistory // Send full conversation history
                }),
            })

            if (!response.ok) throw new Error('Failed to get response')
            
            const data = await response.json()
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
            }

            setConversationHistory(newHistory + ` ${data.response}\n`)
            setChatState(prev => ({
                ...prev,
                messages: [...prev.messages, assistantMessage],
                isLoading: false,
            }))
        } catch (error) {
            setChatState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Failed to get response from AI',
            }))
        }
    }

    return (
        <div className="container mx-auto max-w-4xl p-4">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Chat with AI</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] w-full pr-4">
                        {chatState.messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-4 flex gap-3 ${
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar>
                                        <AvatarImage src="/avatars/01.png" />
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-lg p-4 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {message.content}
                                </div>
                                {message.role === 'user' && (
                                    <Avatar>
                                        <AvatarImage src="/avatars/02.png" />
                                        <AvatarFallback>You</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {chatState.isLoading && (
                            <div className="mb-4 flex gap-3">
                                <Avatar>
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg bg-muted p-4">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        {chatState.error && (
                            <div className="p-2 text-center text-destructive">
                                {chatState.error}
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </ScrollArea>
                </CardContent>
                <CardFooter>
                    <form onSubmit={handleSubmit} className="flex w-full gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={chatState.isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={chatState.isLoading}>
                            Send
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    )
}