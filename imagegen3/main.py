from flask import Flask, send_file, request, Response
from vertexai.preview.vision_models import ImageGenerationModel
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
    generation_model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")
except DefaultCredentialsError as e:
    print(f"Credential error: {e}")
    raise

@app.route('/generate-image', methods=['POST'])
def generate_image():
    try:
        # Get prompt from request
        data = request.get_json()
        prompt = data.get('prompt', 'A powerful image of a female astronaut in a spacesuit, looking out at the Earth from space.')

        # Generate image using Vertex AI ImageGen3
        images = generation_model.generate_images(
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)