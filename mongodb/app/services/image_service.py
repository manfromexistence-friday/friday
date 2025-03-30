from pymongo import MongoClient
from gridfs import GridFS
import os

class ImageService:
    def __init__(self, db_uri, db_name):
        self.client = MongoClient(db_uri)
        self.db = self.client[db_name]
        self.fs = GridFS(self.db)

    def upload_image(self, image_data, filename):
        """Uploads an image to MongoDB Atlas using GridFS."""
        try:
            file_id = self.fs.put(image_data, filename=filename)
            return str(file_id)
        except Exception as e:
            raise RuntimeError(f"Failed to upload image: {e}")

    def get_image(self, file_id):
        """Retrieves an image from MongoDB Atlas using GridFS."""
        try:
            image_data = self.fs.get(file_id)
            return image_data.read()
        except Exception as e:
            raise RuntimeError(f"Failed to retrieve image: {e}")

    def delete_image(self, file_id):
        """Deletes an image from MongoDB Atlas using GridFS."""
        try:
            self.fs.delete(file_id)
        except Exception as e:
            raise RuntimeError(f"Failed to delete image: {e}")