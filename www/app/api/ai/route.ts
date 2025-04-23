import { GoogleGenAI, Part } from '@google/genai'; // Import Part type
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model = 'gemini-2.5-flash-preview-04-17', useSearch = false } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // WARNING: Hardcoded API Key is a security risk. Consider using environment variables.
    const ai = new GoogleGenAI({
      apiKey: "AIzaSyCJLZ-UHt8SwTFf1aCAEdEpPK1wHtUhRbc",
    });
    const tools = useSearch ? [{ googleSearch: {} }] : [];
    const config = {
      tools,
      // Removed responseMimeType to allow structured output from tools
      systemInstruction: [
        {
          // Added instructions for reasoning and citing sources
          text: `You are Friday, an AI friend designed to chat, assist, and provide creative content like poems, stories, and more. Think step-by-step if needed to explain your reasoning. If using search, cite relevant sources with URLs in your response.`,
        },
      ],
    };
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const responseStream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Use text/event-stream for structured streaming
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        function enqueueJsonEvent(type: string, data: any) {
          // Format data as Server-Sent Event (SSE)
          controller.enqueue(encoder.encode(`event: message
data: ${JSON.stringify({ type, data })}

`));
        }

        try {
          // Process the stream chunk by chunk
          for await (const chunk of responseStream) {
            // Check for function/tool calls (like googleSearch being initiated)
            // Note: The exact structure for tool calls/results can vary.
            // Using chunk.functionCalls is one way, but check library specifics.
            const functionCalls = chunk.functionCalls; // Removed () as it's a property
            if (functionCalls) {
               console.log("Detected function calls:", functionCalls);
               // Send an event indicating a tool call is happening
               // You might want to map functionCalls content to a more specific event
               enqueueJsonEvent('tool_call', functionCalls);
            }

            // Process parts within the chunk's candidates
            if (chunk.candidates && chunk.candidates.length > 0) {
              const parts = chunk.candidates[0].content?.parts || [];
              for (const part of parts) {
                if (part.text) {
                  // Send text parts - could be reasoning or final answer text
                  // The client can accumulate and display this stream.
                  enqueueJsonEvent('text', part.text);
                } else if (part.functionResponse) {
                   // This part contains the result of a tool call (e.g., googleSearch)
                   console.log("Detected function response:", part.functionResponse);
                   // Send the tool response details
                   // Attempt to extract search results if it's from googleSearch
                   // The actual structure of search results needs verification based on API/library behavior.
                   // This is a hypothetical structure:
                   let isSearchResult = false;
                   if (part.functionResponse.name === 'googleSearch' && part.functionResponse.response?.searchResults) {
                     const searchResults = part.functionResponse.response.searchResults;
                     if (searchResults && Array.isArray(searchResults)) {
                       searchResults.forEach((result: any) => { // Use 'any' or define a type
                         enqueueJsonEvent('search_result', {
                           url: result.url,
                           title: result.title,
                           snippet: result.snippet,
                         });
                       });
                       isSearchResult = true;
                     }
                   }
                   // If it wasn't parsed as a known search result structure, send the raw response
                   if (!isSearchResult) {
                     enqueueJsonEvent('tool_response', part.functionResponse);
                   }
                }
                // Add checks here if other part types are expected (e.g., part.toolCodeOutput)
              }
            }
          }
          // Signal end of stream
          enqueueJsonEvent('done', {});
          controller.close();
        } catch (error) {
          console.error('Error processing stream:', error);
          // Send an error event to the client before closing the stream with an error
          try {
             const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
             enqueueJsonEvent('error', { message: errorMessage });
          } catch (e) {
             console.error("Error sending error event:", e);
          }
          controller.error(error); // Signal error to the stream
        }
      },
    });

    // Return SSE response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache', // Ensure client doesn't cache the stream
        'Connection': 'keep-alive', // Keep connection open for streaming
      },
    });
  } catch (error) {
    console.error('Error in Friday AI API:', error);
    // Ensure error response is JSON
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    // Better status code detection (e.g., check error type)
    const status = error instanceof SyntaxError ? 400 : 500; // Example: handle JSON parsing error
    return NextResponse.json({ error: errorMessage }, { status });
  }
}