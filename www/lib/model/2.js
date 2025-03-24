const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run() {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "hello"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Hello! How can I help you?\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "What time it is? "},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Unfortunately, I don't have real-time access to the current time.  To find out what time it is, you could check a clock, use a phone or computer, or ask a person nearby.\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "What time it is?"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "Unfortunately, without knowing your location, I cannot tell you the exact time.  The provided sources give various times for different time zones, but do not specify a location.  To get the correct time for your location, please tell me where you are located.\n"},
          ],
        },
        {
          role: "user",
          parts: [
            {text: "What time it is? "},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "The current time is Thursday, March 13, 2025 at 00:00:05 UTC.\n"},
          ],
        },
      ],
    });
  
    const result = await chatSession.sendMessage("What time it is?");
    console.log(result.response.text());
  }
  
  run();