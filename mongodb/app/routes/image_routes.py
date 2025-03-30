from flask import Blueprint, request, jsonify
from app.services.image_service import upload_image

image_routes = Blueprint('image_routes', __name__)

@image_routes.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        image_url = upload_image(file)
        return jsonify({"url": image_url}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@image_routes.route('/images/<image_id>', methods=['GET'])
def get_image(image_id):
    try:
        image_data = get_image_from_db(image_id)  # Assuming a function to retrieve image data
        if image_data:
            return jsonify({"image": image_data}), 200
        else:
            return jsonify({"error": "Image not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500