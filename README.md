# Friday
Your ai friend!

```
// pages/api/tts.js or a client-side fetch
async function getTTS(text) {
    const response = await fetch('http://127.0.0.1:5000/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}

// Usage
getTTS("Hola mundo").catch(console.error);
```