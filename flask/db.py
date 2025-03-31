from astrapy.collections import create_client
import uuid
import os

# get Astra connection information from environment variables
ASTRA_DB_ID = "24acd8f5-a743-4e45-a146-e1a7faedb4a6"
ASTRA_DB_REGION = "eu-west-1"
ASTRA_DB_APPLICATION_TOKEN = "AstraCS:HZIOZLgFWeXXQULgtwAxDodm:6b04db9fc71199fecc20b3f0943c8f2513fd6d8fa671ca40dd0a21631805e2d2"
ASTRA_DB_KEYSPACE = "flask_images"

COLLECTION_NAME = "test"

# setup an Astra Client
astra_client = create_client(astra_database_id=ASTRA_DB_ID,
  astra_database_region=ASTRA_DB_REGION,
  astra_application_token=ASTRA_DB_APPLICATION_TOKEN)
collection = astra_client.namespace(ASTRA_DB_KEYSPACE).collection(COLLECTION_NAME)

# create a new document
cliff_uuid = str(uuid.uuid4())
print(f'Sending AstraCollection request using namespace: {ASTRA_DB_KEYSPACE}, collection: {COLLECTION_NAME}, and uuid: cliff_uuid')

response = collection.create(path=cliff_uuid, document={
  "first_name": "Cliff",
  "last_name": "Wicklow",
})

print (response)