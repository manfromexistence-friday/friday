import base64
import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-pro-exp-03-25"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""Hello?"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""Thinking Process:

1.  **Identify the input:** The user simply said \"Hello?\".
2.  **Recognize the nature of the input:** It's a standard greeting, often used to initiate a conversation or check if someone is present/listening. The question mark might indicate a slight uncertainty or a prompt for a response.
3.  **Determine the goal:** Respond appropriately to the greeting and signal readiness to engage further.
4.  **Formulate a response:**
    *   Acknowledge the greeting: Start with a reciprocal greeting like \"Hello!\" or \"Hi there!\".
    *   Indicate presence and readiness: Add a phrase like \"How can I help you today?\" or \"What can I do for you?\". This invites the user to state their purpose.
    *   Maintain a helpful and friendly tone.
5.  **Refine the response:**
    *   \"Hello!\" - Simple, direct reciprocation.
    *   \"How can I help you today?\" - Standard, polite, and functional for an AI assistant.
    *   Combine them: \"Hello! How can I help you today?\" or \"Hi there! What can I do for you?\". Both are good. Let's go with the first one as it's very common.
6.  **Final check:** Does the response directly address the input? Yes. Is it polite and helpful? Yes. Does it encourage further interaction? Yes."""),
                types.Part.from_text(text="""Hi there! How can I help you today?"""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        safety_settings=[
            types.SafetySetting(
                category="HARM_CATEGORY_HARASSMENT",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_HATE_SPEECH",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
            types.SafetySetting(
                category="HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold="BLOCK_LOW_AND_ABOVE",  # Block most
            ),
        ],
        response_mime_type="text/plain",
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")

if __name__ == "__main__":
    generate()
