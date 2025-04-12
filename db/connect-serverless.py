from astrapy import DataAPIClient
import uuid

ASTRA_DB_ID = "8202f58c-eaf8-465e-8437-a6c69f2c00f1"
ASTRA_DB_REGION = "eu-west-1"
ASTRA_DB_APPLICATION_TOKEN = "AstraCS:CqiNIqJTqzPIKUUhyGLhYdZT:d675d95d187295df16dfe0ba3d26dd3c2f334131fa24bbe59f99fa1406782811"
ASTRA_DB_KEYSPACE = "authentication"
COLLECTION_NAME = "test"

client = DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
api_endpoint = f"https://{ASTRA_DB_ID}-{ASTRA_DB_REGION}.apps.astra.datastax.com"
database = client.get_database(api_endpoint)
collection = database.get_collection(COLLECTION_NAME, namespace=ASTRA_DB_KEYSPACE)

cliff_uuid = str(uuid.uuid4())
print(f'Sending request to collection: {COLLECTION_NAME}, with uuid: {cliff_uuid}')

document = {
  "_id": cliff_uuid,
  "first_name": "Cliff",
  "last_name": "Wicklow",
}
response = collection.insert_one(document)

print(response)