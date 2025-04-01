from astrapy import DataAPIClient

# Initialize the client
client = DataAPIClient("AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119")
db = client.get_database_by_api_endpoint(
  "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com",
    keyspace="default_keyspace",
)
      
print(f"Connected to Astra DB: {db.list_collection_names()}")
