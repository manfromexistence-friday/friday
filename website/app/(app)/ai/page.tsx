// app/friday/page.tsx
'use client';

import { useState } from 'react';

export default function FridayPage() {
  const [prompt, setPrompt] = useState('');
  const [action, setAction] = useState<
    | 'generateContentStream'
    | 'generateContent'
    | 'countTokens'
    | 'computeTokens'
    | 'embedContent'
    | 'generateImages'
    | 'generateVideos'
    | 'getModel'
  >('generateContentStream');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [useSearch, setUseSearch] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && action !== 'getModel') return;

    setIsLoading(true);
    setResponse(null);

    try {
      const body = {
        action,
        model,
        prompt,
        useSearch,
        config:
          action === 'generateImages'
            ? { numberOfImages: 1, includeRaiReason: true }
            : action === 'generateVideos'
            ? { numberOfVideos: 1 }
            : action === 'embedContent'
            ? { outputDimensionality: 64 }
            : {},
      };

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch response');
      }

      if (action === 'generateContentStream') {
        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let result = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          setResponse(result);
        }
      } else {
        const data = await res.json();
        setResponse(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse({ error: 'Sorry, something went wrong!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Talk to Friday, Your AI Friend</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Action:</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as any)}
            className="w-full p-2 border rounded"
          >
            <option value="generateContentStream">Generate Text (Stream)</option>
            <option value="generateContent">Generate Text</option>
            <option value="countTokens">Count Tokens</option>
            <option value="computeTokens">Compute Tokens</option>
            <option value="embedContent">Embed Content</option>
            <option value="generateImages">Generate Image</option>
            <option value="generateVideos">Generate Video</option>
            <option value="getModel">Get Model Info</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Model:</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., gemini-1.5-flash"
          />
        </div>
        {action !== 'getModel' && (
          <textarea
            className="w-full p-2 border rounded"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask Friday anything..."
            rows={4}
          />
        )}
        {(action === 'generateContent' || action === 'generateContentStream') && (
          <div>
            <label>
              <input
                type="checkbox"
                checked={useSearch}
                onChange={(e) => setUseSearch(e.target.checked)}
              />
              Use Google Search
            </label>
          </div>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>
      {response && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-lg font-semibold">Friday says:</h2>
          {action === 'generateImages' && response?.generatedImages?.[0]?.image?.imageBytes ? (
            <img
              src={`data:image/png;base64,${response.generatedImages[0].image.imageBytes}`}
              alt="Generated Image"
              className="max-w-full"
            />
          ) : action === 'generateVideos' && response?.generatedVideos?.[0]?.video?.uri ? (
            <video controls src={response.generatedVideos[0].video.uri} className="max-w-full" />
          ) : (
            <pre>{JSON.stringify(response, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}