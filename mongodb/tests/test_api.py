from flask import Flask, jsonify
import pytest
from app import create_app  # Assuming you have a function to create your Flask app

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_api_status(client):
    response = client.get('/')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'ok'
    assert 'available_models' in json_data

def test_image_upload(client):
    with open('tests/test_image.jpg', 'rb') as img:
        response = client.post('/upload', data={'file': img})
        assert response.status_code == 200
        json_data = response.get_json()
        assert 'url' in json_data

def test_invalid_image_upload(client):
    response = client.post('/upload', data={'file': ''})
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['error'] == 'No file uploaded'