const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const fs = require("node:fs");
  const mime = require("mime-types");
  
  const apiKey = "AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp-image-generation",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseModalities: [
      "image",
      "text",
    ],
    responseMimeType: "text/plain",
  };
  
  async function run() {
    const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });
  
    const result = await chatSession.sendMessage(`a full body bio limerent woman looking at viewer, Futuristic retro vaporwave, neon woman with long messy wavy hair, wears orange sunglasses, lights densely packed, mimicking the contours and features of a woman's body, bio-luminescent, translucent, cinematic, Film light, surreal hallucinatory intricately detailed, fairy lights, captures viewers with beauty and mesmerism, Hyper detailed, Hyper realistic, masterpiece, atmospheric, High resolution, Vibrant, CLEAR CRIMSON/AMBER/Cyan/purple, light particles, colorful, backlit, cyberpunk. The whole composition should feel vibrant, chaotic, and energetic, perfect for a t-shirt or poster with a neo-vintage comic and psychedelic urban aesthetic. ((best quality master piece. deep lines, heavy strokes,)) Her expressive, charming eyes and soft, delicate facial features arouse admiration, creating a welcoming and adorable presence. The epic scene with lens glow lighting in a modern futuristic grand setting depicts an intricate with volumetric lighting. (highest quality face), (highest quality clothes), (best shadow)`);
    // TODO: Following code needs to be updated for client-side apps.
    const candidates = result.response.candidates;
    for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
      for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
        const part = candidates[candidate_index].content.parts[part_index];
        if(part.inlineData) {
          try {
            const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
            fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
            console.log(`Output written to: ${filename}`);
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    console.log(result.response.text());
  }
  
  run();