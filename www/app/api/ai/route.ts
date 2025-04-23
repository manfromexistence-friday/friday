import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt, model = 'gemini-2.5-flash-preview-04-17', useSearch = false } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({
      apiKey: "AIzaSyCJLZ-UHt8SwTFf1aCAEdEpPK1wHtUhRbc",
    });
    const tools = useSearch ? [{ googleSearch: {} }] : [];
    const config = {
      tools,
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are Friday, an AI friend designed to chat, assist, and provide creative content like poems, stories, and more.`,
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

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.text) {
              controller.enqueue(new TextEncoder().encode(chunk.text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('Error in Friday AI API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}