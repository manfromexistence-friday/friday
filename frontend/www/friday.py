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
