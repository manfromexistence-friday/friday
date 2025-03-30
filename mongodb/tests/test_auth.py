from flask import Flask
from flask_pymongo import PyMongo
import pytest

@pytest.fixture
def client():
    app = Flask(__name__)
    app.config['MONGO_URI'] = 'mongodb+srv://<username>:<password>@cluster.mongodb.net/test?retryWrites=true&w=majority'
    mongo = PyMongo(app)

    with app.test_client() as client:
        with app.app_context():
            mongo.init_app(app)
        yield client

def test_user_registration(client):
    response = client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert response.status_code == 201
    assert b'User created successfully' in response.data

def test_user_login(client):
    client.post('/auth/register', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    response = client.post('/auth/login', json={
        'username': 'testuser',
        'password': 'testpassword'
    })
    assert response.status_code == 200
    assert b'Login successful' in response.data

def test_user_login_invalid(client):
    response = client.post('/auth/login', json={
        'username': 'invaliduser',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    assert b'Invalid credentials' in response.data