import pytest
from app import create_app
from app.utils.db import get_db
from app.utils.gridfs_handler import upload_image

@pytest.fixture
def client():
    app = create_app()
    with app.test_client() as client:
        yield client

def test_image_upload(client):
    with open('tests/test_image.jpg', 'rb') as image_file:
        response = client.post('/upload_image', data={'file': image_file})
    
    assert response.status_code == 200
    assert 'image_id' in response.json

def test_image_retrieval(client):
    image_id = 'some_image_id'  # Replace with a valid image ID after upload
    response = client.get(f'/images/{image_id}')
    
    assert response.status_code == 200
    assert response.data is not None
    assert response.content_type == 'image/jpeg'  # Adjust based on the uploaded image type

def test_invalid_image_upload(client):
    response = client.post('/upload_image', data={'file': ''})
    
    assert response.status_code == 400
    assert response.json['error'] == 'No file uploaded'  # Adjust based on actual error message