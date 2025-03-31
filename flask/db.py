import requests
import uuid
import json

# Astra connection information
ASTRA_DB_ID = "24acd8f5-a743-4e45-a146-e1a7faedb4a6"
ASTRA_DB_REGION = "eu-west-1"
ASTRA_DB_APPLICATION_TOKEN = "AstraCS:<your_new_client_id>:<your_new_secret>"  # Replace with new token
ASTRA_DB_KEYSPACE = "flask_images"
COLLECTION_NAME = "local_images"

# Correct Document API endpoint
url = f"https://{ASTRA_DB_ID}-{ASTRA_DB_REGION}.apps.astra.datastax.com/api/rest/v2/keyspaces/{ASTRA_DB_KEYSPACE}/collections/{COLLECTION_NAME}"

# Headers with correct token header
headers = {
    "X-Cassandra-Token": ASTRA_DB_APPLICATION_TOKEN,
    "Content-Type": "application/json"
}

# Create a new document
cliff_uuid = str(uuid.uuid4())
data = {
    "_id": cliff_uuid,
    "first_name": "Cliff",
    "last_name": "Wicklow"
}

# Insert the document
response = requests.post(url, headers=headers, data=json.dumps(data))
print("Insert Status:", response.status_code, response.text)

# Verify the document
find_url = f"{url}/{cliff_uuid}"
find_response = requests.get(find_url, headers=headers)
print("Find Status:", find_response.status_code, find_response.text)