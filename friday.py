import os
from google import genai
from google.genai import types

def generate():
    # Ensure API key is securely accessed
    api_key = os.environ.get("GENAI_API_KEY")  # Updated environment variable name for clarity
    if not api_key:
        raise ValueError("API key is missing! Please set it as an environment variable: GENAI_API_KEY.")

    # Initialize the GenAI client
    client = genai.Client(api_key=api_key)

    # Specify the model and input content
    model = "gemini-2.0-pro-exp-02-05"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="Who are you?"),
            ],
        ),
    ]

    # Configure generation parameters
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=64,
        max_output_tokens=8192,
        response_mime_type="text/plain",
    )

    try:
        # Generate and print the content stream
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=contents,
            config=generate_content_config,
        ):
            print(chunk.text, end="")
    except Exception as e:
        print(f"An error occurred during content generation: {e}")

if __name__ == "__main__":
    generate()


# import base64
# import os
# from google import genai
# from google.genai import types


# def generate():
#     client = genai.Client(
#         api_key=os.environ.get("AIzaSyB1wMO-rpZGWTxDiDT8eyy_fpp3blbykIo"),
#     )

#     model = "gemini-2.0-pro-exp-02-05"
#     contents = [
#         types.Content(
#             role="user",
#             parts=[
#                 types.Part.from_text(text="""Who are you?"""),
#             ],
#         ),
#     ]
#     generate_content_config = types.GenerateContentConfig(
#         temperature=1,
#         top_p=0.95,
#         top_k=64,
#         max_output_tokens=8192,
#         response_mime_type="text/plain",
#     )

#     for chunk in client.models.generate_content_stream(
#         model=model,
#         contents=contents,
#         config=generate_content_config,
#     ):
#         print(chunk.text, end="")

# if __name__ == "__main__":
#     generate()
