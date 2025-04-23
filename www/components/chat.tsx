// components/Chat.tsx (React component)
import { useState, useEffect } from "react";

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [duration, setDuration] = useState<number | null>(null); // Track duration

  const handleSubmit = async () => {
    setResponse(""); // Clear previous response
    setDuration(null); // Clear previous duration
    setIsLoading(true); // Set loading state
    const startTime = performance.now(); // Start timer

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.body) {
      setIsLoading(false); // Reset loading state on error
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        const endTime = performance.now(); // End timer
        setDuration(endTime - startTime); // Calculate and set duration
        setIsLoading(false); // Reset loading state
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      setResponse((prev) => prev + chunk); // Append streamed text to state
    }
  };

  return (
    <div>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt"
        disabled={isLoading} // Disable input while loading
      />
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? "Generating..." : "Send"}
      </button>
      <div>{response}</div>
      {/* Display duration if available */}
      {duration !== null && (
        <p className="text-sm text-gray-500">
          Response generated in {(duration / 1000).toFixed(2)} seconds.
        </p>
      )}
    </div>
  );
}