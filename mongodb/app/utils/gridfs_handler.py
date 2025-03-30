from pymongo import MongoClient
from gridfs import GridFS
import os

class GridFSHandler:
    def __init__(self, db_name):
        self.client = MongoClient(os.getenv("MONGODB_URI"))
        self.db = self.client[db_name]
        self.fs = GridFS(self.db)

    def upload_file(self, file_data, filename):
        """Uploads a file to GridFS."""
        file_id = self.fs.put(file_data, filename=filename)
        return file_id

    def get_file(self, file_id):
        """Retrieves a file from GridFS by its ID."""
        file_data = self.fs.get(file_id).read()
        return file_data

    def delete_file(self, file_id):
        """Deletes a file from GridFS by its ID."""
        self.fs.delete(file_id)

    def get_file_metadata(self, file_id):
        """Retrieves metadata for a file stored in GridFS."""
        file_info = self.fs.get(file_id)
        return {
            "filename": file_info.filename,
            "length": file_info.length,
            "upload_date": file_info.upload_date,
            "content_type": file_info.content_type
        }