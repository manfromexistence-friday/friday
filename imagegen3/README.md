# Vertex AI ImageGen3 and Gemini Text Generation API

This project provides a Flask API for generating images using Vertex AI's Imagen 3 model and generating text using various Gemini models.

## Features

-   Generate images based on text prompts using Imagen 3.
-   Generate text using different Gemini models:
    -   `gemini-2.0-flash-001`
    -   `gemini-2.0-flash-lite-001`
    -   `gemini-2.5-flash-preview-04-17`
    -   `gemini-2.5-pro-preview-03-25`

## Setup

1.  **Clone the repository (if applicable).**
2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Set up Google Cloud Credentials:**
    -   Ensure you have a Google Cloud project with the Vertex AI API enabled.
    -   Create a service account key and download the JSON file.
    -   Place the `service-account-key.json` file in the `imagegen3` directory.
    -   The application expects the credentials file at `/workspaces/friday/imagegen3/service-account-key.json`. You might need to adjust the path in `main.py` (`os.environ["GOOGLE_APPLICATION_CREDENTIALS"]`) based on your setup.
    -   Make sure the service account has the necessary permissions (e.g., Vertex AI User role).

## Running the API

```bash
python main.py
```

The API will be available at `http://0.0.0.0:5000`.

## API Endpoints

### Image Generation

-   **Endpoint:** `/generate-image`
-   **Method:** `POST`
-   **Request Body (JSON):**
    ```json
    {
      "prompt": "Your image description here"
    }
    ```
    *(If no prompt is provided, a default astronaut prompt is used.)*
-   **Response:** An image file (PNG format).

### Text Generation

-   **Endpoints:**
    -   `/generate-text-gemini-2-flash`
    -   `/generate-text-gemini-2-flash-lite`
    -   `/generate-text-gemini-2.5-flash`
    -   `/generate-text-gemini-2.5-pro`
-   **Method:** `POST`
-   **Request Body (JSON):**
    ```json
    {
      "prompt": "Your text prompt here"
    }
    ```
    *(If no prompt is provided, a default prompt specific to the model is used.)*
-   **Response:** Plain text response from the selected Gemini model.

## Dependencies

-   Flask
-   google-cloud-aiplatform (includes vertexai)
-   Pillow

See `requirements.txt` for details.