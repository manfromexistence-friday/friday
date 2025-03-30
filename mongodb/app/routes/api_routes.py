from flask import Blueprint, request, jsonify
from app.services.image_service import upload_image

api_routes = Blueprint('api_routes', __name__)

@api_routes.route('/upload_image', methods=['POST'])
def upload_image_route():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        image_id = upload_image(file)
        return jsonify({"message": "Image uploaded successfully", "image_id": image_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500