from astrapy import DataAPIClient
client = DataAPIClient("TOKEN")
database = client.get_database("API_ENDPOINT")

collection = database.get_collection("COLLECTION_NAME")
collection.count_documents({}, upper_bound=100)  # will print e.g.: 41