import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the JSON body to get the prompt
    const { prompt } = await request.json();

    // Initialize Google Gemini API
    const genAI = new GoogleGenerativeAI("AIzaSyCJLZ-UHt8SwTFf1aCAEdEpPK1wHtUhRbc");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await model.generateContentStream({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });

          // Stream chunks to the client
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Close the stream
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error streaming content" },
      { status: 500 }
    );
  }
}