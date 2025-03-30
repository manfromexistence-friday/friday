from flask import jsonify
from pymongo import MongoClient
import gridfs
import os

# Initialize MongoDB client and GridFS
client = MongoClient(os.getenv('MONGODB_URI'))
db = client.get_default_database()
fs = gridfs.GridFS(db)

def upload_image(image_data, filename):
    """Uploads an image to MongoDB Atlas using GridFS."""
    try:
        file_id = fs.put(image_data, filename=filename)
        return str(file_id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_image(file_id):
    """Retrieves an image from MongoDB Atlas using GridFS."""
    try:
        image_data = fs.get(file_id)
        return image_data.read()
    except gridfs.errors.NoFile:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500