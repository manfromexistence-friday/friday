// app/api/friday-ai/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import {
  ComputeTokensParameters,
  ComputeTokensResponse,
  CountTokensParameters,
  CountTokensResponse,
  EmbedContentParameters,
  EmbedContentResponse,
  GenerateContentParameters,
  GenerateContentResponse,
  GenerateImagesParameters,
  GenerateImagesResponse,
  GenerateVideosParameters,
  GenerateVideosOperation,
  GetModelParameters,
  Model,
} from '@/types/google-ai';

const GEMINI_API_KEY = "AIzaSyCJLZ-UHt8SwTFf1aCAEdEpPK1wHtUhRbc";

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper to ensure contents is always an array of Content objects
function toContentArray(input: any): any[] {
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    return [{ role: 'user', parts: [{ text: input }] }];
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      model = 'gemini-1.5-flash',
      prompt,
      contents,
      config,
      useSearch = false,
    } = body;

    const aiModel = genAI.getGenerativeModel({ model });

    switch (action) {
      case 'computeTokens': {
        const contentArr = toContentArray(contents || prompt);
        const response = await aiModel.countTokens({ contents: contentArr });
        return NextResponse.json(response);
      }

      case 'countTokens': {
        const contentArr = toContentArray(contents || prompt);
        const response = await aiModel.countTokens({ contents: contentArr });
        return NextResponse.json(response);
      }

      case 'embedContent': {
        const contentArr = toContentArray(contents || prompt);
        // Pass contentArr directly if SDK expects array, else wrap in object if needed
        const response = await aiModel.embedContent(contentArr);
        return NextResponse.json(response);
      }

      case 'generateContent': {
        const tools = useSearch ? [{ googleSearch: {} }] : [];
        const contentArr = toContentArray(contents || prompt);
        const response = await aiModel.generateContent({
          contents: contentArr,
          tools,
          ...config,
        });
        return NextResponse.json(response);
      }

      case 'generateContentStream': {
        const tools = useSearch ? [{ googleSearch: {} }] : [];
        const contentArr = toContentArray(contents || prompt);
        const response = await aiModel.generateContentStream({
          contents: contentArr,
          tools,
          ...config,
        });

        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of response.stream) {
                const text = chunk.text();
                if (text) {
                  controller.enqueue(new TextEncoder().encode(text));
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
      }

      // The following actions are not supported by the SDK and are commented out
      // case 'generateImages':
      // case 'generateVideos':
      // case 'getModel':

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Friday AI API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}