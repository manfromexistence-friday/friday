from flask import Flask, send_file, request, Response
from vertexai.preview.vision_models import ImageGenerationModel
from vertexai.generative_models import GenerativeModel # Added import
import vertexai
from PIL import Image
import io
import os
from google.auth.exceptions import DefaultCredentialsError

app = Flask(__name__)

# Set Google Cloud credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/workspaces/friday/imagegen3/service-account-key.json"

try:
    # Initialize Vertex AI
    vertexai.init(project="friday-458605", location="us-central1")
    image_generation_model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
except DefaultCredentialsError as e:
    print(f"Credential error: {e}")
    raise

# Helper function for text generation
def handle_text_generation(model_name):
    try:
        data = request.get_json()
        prompt = data.get('prompt', f'Tell me something interesting using {model_name}.')

        # Initialize the specific GenerativeModel
        model = GenerativeModel(model_name)

        # Generate text
        response = model.generate_content(prompt)

        # Extract and return the text (assuming response.text exists)
        # You might need to adjust based on the actual response structure
        return Response(response.text, mimetype='text/plain')

    except Exception as e:
        return Response(f"Error generating text with {model_name}: {str(e)}", status=500)

@app.route('/generate-image', methods=['POST'])
def generate_image():
    try:
        # Get prompt from request
        data = request.get_json()
        prompt = data.get('prompt', 'A powerful image of a female astronaut in a spacesuit, looking out at the Earth from space.')

        # Generate image using Vertex AI ImageGen3
        images = image_generation_model.generate_images(
            prompt=prompt,
            number_of_images=1,
            aspect_ratio="1:1",
            negative_prompt="",
            safety_filter_level="block_few",
            person_generation="allow_adult",
            add_watermark=True,
        )

        # Extract image data (adjust based on actual object structure)
        generated_image = images[0]
        image_data = generated_image._image_bytes  # Assuming _image_bytes contains the image data

        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))

        # Save to BytesIO for response
        img_io = io.BytesIO()
        pil_image.save(img_io, format='PNG')
        img_io.seek(0)

        # Return the image
        return send_file(img_io, mimetype='image/png')

    except Exception as e:
        return Response(f"Error generating image: {str(e)}", status=500)

# --- Routes for Gemini Text Models ---

@app.route('/generate-text-gemini-2-flash', methods=['POST'])
def generate_text_gemini_2_flash():
    return handle_text_generation('gemini-2.0-flash-001')

@app.route('/generate-text-gemini-2-flash-lite', methods=['POST'])
def generate_text_gemini_2_flash_lite():
    return handle_text_generation('gemini-2.0-flash-lite-001')

@app.route('/generate-text-gemini-2.5-flash', methods=['POST'])
def generate_text_gemini_2_5_flash():
    # Assuming 'gemini-2.5-flash-preview-04-17' is the intended model ID
    return handle_text_generation('gemini-2.5-flash-preview-04-17')

@app.route('/generate-text-gemini-2.5-pro', methods=['POST'])
def generate_text_gemini_2_5_pro():
     # Assuming 'gemini-2.5-pro-preview-03-25' is the intended model ID
    return handle_text_generation('gemini-2.5-pro-preview-03-25')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)