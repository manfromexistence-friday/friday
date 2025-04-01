from quickstart_connect import connect_to_database
from astrapy import Database, Collection
from astrapy.constants import VectorMetric
from astrapy.info import CollectionVectorServiceOptions
import json


def create_collection(database: Database, collection_name: str) -> Collection:
    """
    Creates a collection in the specified database with vectorization enabled.
    The collection will use NVIDIA's NV-Embed-QA embedding model
    to generate vector embeddings for data in the collection.

    Args:
        database (Database): The instantiated object that represents the database where the collection will be created.
        collection_name (str): The name of the collection to create.

    Returns:
        Collection: The created collection.
    """
    collection = database.create_collection(
        collection_name,
        metric=VectorMetric.COSINE,
        service=CollectionVectorServiceOptions(
            provider="nvidia",
            model_name="NV-Embed-QA",
        ),
    )

    print(f"Created collection {collection.full_name}")

    return collection


def upload_json_data(
    collection: Collection,
    data_file_path: str,
    embedding_string_creator: callable,
) -> None:
    """
     Uploads data from a file containing a JSON array to the specified collection.
     For each piece of data, a $vectorize field is added. The $vectorize value is
     a string from which vector embeddings will be generated.

    Args:
        collection (Collection): The instantiated object that represents the collection to upload data to.
        data_file_path (str): The path to a JSON file containing a JSON array.
        embedding_string_creator (callable): A function to create the string for which vector embeddings will be generated.
    """
    # Read the JSON file and parse it into a JSON array.
    with open(data_file_path, "r", encoding="utf8") as file:
        json_data = json.load(file)

    # Add a $vectorize field to each piece of data.
    documents = [
        {
            **data,
            "$vectorize": embedding_string_creator(data),
        }
        for data in json_data
    ]

    # Upload the data.
    inserted = collection.insert_many(documents)
    print(f"Inserted {len(inserted.inserted_ids)} items.")

def main() -> None:
    database = connect_to_database()

    collection = create_collection(database, "quickstart_collection")

    upload_json_data(
        collection,
        "PATH_TO_DATA_FILE",
        lambda data: (
            f"summary: {data['summary']} | "
            f"genres: {', '.join(data['genres'])}"
        ),
    )

if __name__ == "__main__":
    main()