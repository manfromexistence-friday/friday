# Friday Backend

```
curl https://friday-backend.vercel.app/debug
```

```
curl -X POST http://localhost:5000/image_generation -H "Content-Type: application/json" -d '{"prompt": "Hello, make a painting of a vibrant digital art scene depicting an AI model generating an image from text input, with the generated image flowing out like a stream of data, set in a futuristic tech environment with neon lights and holographic displays, capturing the essence of deploying such technology on platforms like Vercel"}' -o response.json
```

```
curl -X POST https://friday-backend.vercel.app/reasoning -H "Content-Type: application/json" -d '{"question": "Hello, make a painting of a vibrant digital art scene depicting an AI model generating an image from text input, with the generated image flowing out like a stream of data, set in a futuristic tech environment with neon lights and holographic displays, capturing the essence of deploying such technology on platforms like Vercel"}' -o response.json
```

From Youtube
```
curl -X POST -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.youtube.com/watch?v=gPpQNzQP6gE"], "prompt": "Summarize this video"}' \
  http://localhost:5000/analyze_media_from_url
```


```
curl -X POST -H "Content-Type: application/json" \
  -d '{"urls": ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c"], "prompt": "Describe this image"}' \
  http://localhost:5000/analyze_media_from_url
```
