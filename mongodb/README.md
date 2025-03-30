# MongoDB Image Uploader

This project is a Flask application that allows users to upload images directly to MongoDB Atlas using GridFS. It provides a simple API for image upload and retrieval, along with user authentication features.

## Project Structure

```
mongodb-image-uploader
├── app
│   ├── __init__.py
│   ├── config.py
│   ├── main.py
│   ├── routes
│   │   ├── __init__.py
│   │   ├── auth_routes.py
│   │   ├── image_routes.py
│   │   └── api_routes.py
│   ├── models
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── image_service.py
│   │   └── ai_service.py
│   └── utils
│       ├── __init__.py
│       ├── db.py
│       ├── gridfs_handler.py
│       └── validators.py
├── tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_image_upload.py
│   └── test_api.py
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## Features

- User authentication (registration and login)
- Image upload and retrieval using MongoDB GridFS
- RESTful API for interacting with the application

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mongodb-image-uploader
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env` and fill in the required values, especially for MongoDB Atlas connection.

## Usage

1. Run the application:
   ```
   python app/main.py
   ```

2. Access the API documentation at `http://localhost:5000/` to explore available endpoints.

## Testing

To run the tests, use:
```
pytest
```

## License

This project is licensed under the MIT License. See the LICENSE file for details.