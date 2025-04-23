import { useState } from "react";
import { Input } from "@/components/ui/input"; // Assuming shadcn setup
import { Button } from "@/components/ui/button"; // Assuming shadcn setup
import { Card, CardContent } from "@/components/ui/card"; // Assuming shadcn setup
import { Loader2 } from "lucide-react"; // For loading spinner

// Define the structure for different message parts from the SSE stream
interface MessagePart {
  type: 'text' | 'search_result' | 'tool_call' | 'tool_response' | 'error' | 'done';
  data: any;
}

// Define a more specific type for search results
interface SearchResultData {
    url: string;
    title?: string;
    snippet?: string;
}

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [messageParts, setMessageParts] = useState<MessagePart[]>([]); // Store structured response parts
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null); // State for API errors

  const handleSubmit = async () => {
    setMessageParts([]); // Clear previous response parts
    setDuration(null);
    setError(null); // Clear previous errors
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send useSearch: true to enable search tool if desired
        body: JSON.stringify({ prompt, useSearch: true }),
      });

      if (!res.ok) {
        // Handle HTTP errors (e.g., 4xx, 5xx)
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch response' }));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Response body is missing.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ""; // Buffer for incomplete SSE messages

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // Process any remaining buffer content if needed, though usually ends with \n\n
          if (buffer.trim()) {
              console.warn("Stream ended with unprocessed buffer:", buffer);
          }
          break; // Exit loop when stream is done
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages in the buffer
        // SSE messages are separated by double newlines (\n\n)
        const messageEndMarker = "\n\n";
        let messageStartIndex = 0;
        let messageEndIndex = buffer.indexOf(messageEndMarker);

        while (messageEndIndex !== -1) {
            const message = buffer.substring(messageStartIndex, messageEndIndex);
            buffer = buffer.substring(messageEndIndex + messageEndMarker.length); // Remove processed message from buffer
            messageStartIndex = 0; // Reset start index for next search in remaining buffer

            if (message.startsWith("event: message")) {
                const dataLine = message.split("\ndata: ")[1];
                if (dataLine) {
                    try {
                        const parsedData: MessagePart = JSON.parse(dataLine);

                        if (parsedData.type === 'done') {
                            // Final updates when the 'done' event is received
                            const endTime = performance.now();
                            setDuration(endTime - startTime);
                            setIsLoading(false);
                            // Don't add 'done' event to rendered parts
                        } else if (parsedData.type === 'error') {
                            console.error("Streaming Error:", parsedData.data.message);
                            setError(parsedData.data.message || "An unknown error occurred during streaming.");
                            // Add error part to display it
                            setMessageParts((prev) => [...prev, parsedData]);
                            // Optionally stop processing further messages on error
                            // setIsLoading(false); // Stop loading indicator
                            // return; // Exit the handler
                        } else {
                            // Add other message types (text, search_result, tool_call, etc.)
                            setMessageParts((prev) => [...prev, parsedData]);
                        }
                    } catch (e) {
                        console.error("Failed to parse SSE data:", dataLine, e);
                        setError("Failed to parse stream data.");
                    }
                }
            } else if (message.trim()) {
                // Handle potential non-event lines if necessary
                console.log("Received non-event message line:", message);
            }

            messageEndIndex = buffer.indexOf(messageEndMarker, messageStartIndex); // Find next message boundary
        }
      }
    } catch (err) {
        console.error("Fetch or processing error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setIsLoading(false); // Ensure loading stops on error
        const endTime = performance.now(); // Still record duration up to the error point if needed
        setDuration(endTime - startTime);
    } finally {
        // Ensure loading is always set to false if it hasn't been already
        // This handles cases where the loop might exit unexpectedly without 'done'
        if (isLoading) {
            setIsLoading(false);
            if (duration === null) { // Set duration if not set by 'done' or error block
                 const endTime = performance.now();
                 setDuration(endTime - startTime);
            }
        }
    }
  };

  // Helper to render different message parts
  const renderMessagePart = (part: MessagePart, index: number) => {
    switch (part.type) {
      case 'text':
        // Render text, potentially using a markdown renderer in the future
        // Replace \n with <br /> for simple line breaks, or use CSS white-space: pre-wrap
        return <p key={index} className="whitespace-pre-wrap">{part.data}</p>;
      case 'search_result':
        const searchData = part.data as SearchResultData;
        return (
          <div key={index} className="my-2 p-3 border rounded bg-muted/50">
            <a
              href={searchData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium text-sm"
            >
              {searchData.title || searchData.url}
            </a>
            {searchData.snippet && (
              <p className="text-xs text-muted-foreground mt-1">{searchData.snippet}</p>
            )}
          </div>
        );
      case 'tool_call':
        // Display tool calls (thinking steps) - could be styled differently
        return (
          <details key={index} className="my-2 text-xs text-muted-foreground">
             <summary className="cursor-pointer">Tool Call Initiated</summary>
             <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(part.data, null, 2)}
             </pre>
          </details>
        );
      case 'tool_response':
         // Display tool responses (excluding search results already handled)
         // You might want to hide googleSearch responses here if they are verbose
         if (part.data?.name === 'googleSearch') return null; // Avoid duplicate display if search_result is preferred
         return (
            <details key={index} className="my-2 text-xs text-muted-foreground">
               <summary className="cursor-pointer">Tool Response Received</summary>
               <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(part.data, null, 2)}
               </pre>
            </details>
         );
      case 'error':
         // Error messages are handled by the main error state, but could be shown inline too
         return <p key={index} className="text-red-600 text-sm font-medium">Error: {part.data.message}</p>;
      default:
        // Ignore 'done' or other types for rendering
        return null;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Input and Button */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask Friday anything..."
          disabled={isLoading}
          onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading && prompt) handleSubmit(); }}
          className="flex-grow"
        />
        <Button onClick={handleSubmit} disabled={isLoading || !prompt}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? "Generating..." : "Send"}
        </Button>
      </div>

      {/* Display Area */}
      {(isLoading || messageParts.length > 0 || error) && (
          <Card className="min-h-[150px] shadow-sm">
            <CardContent className="p-4 space-y-3">
              {messageParts.map(renderMessagePart)}
              {isLoading && messageParts.length === 0 && !error && (
                <div className="flex items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading response...
                </div>
              )}
               {/* Display general API error */}
              {error && !messageParts.some(p => p.type === 'error') && (
                 <p className="text-red-600 text-sm font-medium">Error: {error}</p>
              )}
            </CardContent>
          </Card>
      )}


      {/* Duration */}
      {duration !== null && (
        <p className="text-xs text-muted-foreground text-center">
          Response generated in {(duration / 1000).toFixed(2)} seconds.
        </p>
      )}
    </div>
  );
}
