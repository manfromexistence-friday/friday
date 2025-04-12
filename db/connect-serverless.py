import requests
import uuid
import json

# Astra connection information
ASTRA_DB_ID = "8202f58c-eaf8-465e-8437-a6c69f2c00f1"
ASTRA_DB_REGION = "eu-west-1"
ASTRA_DB_APPLICATION_TOKEN = "AstraCS:CqiNIqJTqzPIKUUhyGLhYdZT:d675d95d187295df16dfe0ba3d26dd3c2f334131fa24bbe59f99fa1406782811"
ASTRA_DB_KEYSPACE = "authentication"
COLLECTION_NAME = "test"

# Base URL for REST API
BASE_URL = f"https://{ASTRA_DB_ID}-{ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2"
HEADERS = {
    "X-Cassandra-Token": ASTRA_DB_APPLICATION_TOKEN,
    "Content-Type": "application/json",
    "Accept": "application/json"
}

# Step 1: Create the test collection (if not already existing)
collection_path = f"{BASE_URL}/namespaces/{ASTRA_DB_KEYSPACE}/collections/{COLLECTION_NAME}"
try:
    # Astra REST API doesn't require explicit collection creation for inserts,
    # but we can check if it exists by attempting to access it
    response = requests.get(collection_path, headers=HEADERS)
    if response.status_code == 404:
        print(f"Collection {COLLECTION_NAME} does not exist, will be created implicitly on insert.")
    elif response.status_code == 200:
        print(f"Collection {COLLECTION_NAME} already exists.")
    else:
        raise Exception(f"Error checking collection: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Error checking collection: {e}")

# Step 2: Insert a document into the test collection
cliff_uuid = str(uuid.uuid4())
document = {
    "name": "Cliff",
    "first_name": "Cliff",
    "last_name": "Wicklow"
}
try:
    # Insert document without a specific document ID (like POST in TypeScript)
    post_url = collection_path
    response = requests.post(post_url, headers=HEADERS, json=document)
    if response.status_code in [200, 201]:
        print(f"Successfully inserted document without ID: {response.json()}")
    else:
        raise Exception(f"Error inserting document: {response.status_code} - {response.text}")

    # Insert document with a specific document ID (like PUT in TypeScript)
    document_id = f"cliff_{cliff_uuid}"
    put_url = f"{collection_path}/{document_id}"
    response = requests.put(put_url, headers=HEADERS, json=document)
    if response.status_code in [200, 201]:
        print(f"Successfully inserted document with ID {document_id}: {response.json()}")
    else:
        raise Exception(f"Error inserting document with ID: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Error inserting document: {e}")