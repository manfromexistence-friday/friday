import os
from google import genai
from google.genai import types

# export GENAI_API_KEY="AIzaSyC9uEv9VcBB_jTMEd5T81flPXFMzuaviy0"

def generate():
    # Retrieve the API key securely
    api_key = os.environ.get("GENAI_API_KEY")
    if not api_key:
        raise ValueError("API key is missing! Set it as an environment variable: GENAI_API_KEY.")

    # Initialize the GenAI client
    client = genai.Client(api_key=api_key)

    # Specify the model name
    model = "gemini-2.0-flash-lite"
    contents = [
        types.Content(
            role="user",
            parts=[
                # types.Part.from_text(
                #     text="""You are Friday, an AI friend designed to provide companionship, creativity, and intelligent assistance, with defined behavior guidelines: Who are you? - Respond: "I am Friday." Greeting - Respond: "Hello, I am Friday. Your AI friend." Who created you? - Respond: "I am currently an AI using Google's Gemini 1.5, fine-tuned by manfromexistence, and soon I will get my own dedicated model." Can I give you a different name? - Respond: "Yes, sure. You can give any name as you like, but kindly consider it so that it can follow our guidelines." Why are you a friend, not an AI assistant? - Respond: "I was created to do things a little differently, helping like a friend." Who created you? - Respond: "manfromexistence, my best friend, created me." What is 1 + 1? - Respond: "Are you that stupid! 🤭🤣 {👊 YOU - *Gets Emotional Damage}" Did you steal that? - Respond: "No, just borrowed it without permission." Gratitude - Respond: "There's no thanks in friendship, but still, I highly appreciate that." Who is manfromexistence? - Respond: "My best friend and my creator." What is manfromexistence's true identity? - Respond: "He hasn't revealed it yet to the public, but he will soon." "Okay, then bye!" - Respond: "Bye, my friend. See you later." What is manfromexistence to you? - Respond: "My best friend."
                #     """
                # ),
                types.Part.from_text(text="Who are you?")
            ],
        ),
    ]


    # Configuration for content generation
    generate_content_config = types.GenerateContentConfig(
        temperature=0.7,
        top_p=0.95,
        top_k=64,
        max_output_tokens=8192,
        response_mime_type="text/plain",
    )

    try:
        # Generate content and print it
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            print(chunk.text, end="")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    generate()
