from quickstart_connect import connect_to_database

def main() -> None:
    database = connect_to_database()

    collection = database.get_collection("quickstart_collection")

    # Find documents that match a filter
    print("\nFinding books with rating greater than 4.7...")

    rating_cursor = collection.find({"rating": {"$gt": 4.7}})

    for document in rating_cursor:
        print(f"{document['title']} is rated {document['rating']}")

    # Perform a vector search to find the closest match to a search string
    print("\nUsing vector search to find a single scary novel...")

    single_vector_match = collection.find_one(
        {}, sort={"$vectorize": "A scary novel"}
    )

    print(f"{single_vector_match['title']} is a scary novel")

    # Combine a filter, vector search, and projection to find the 3 books with
    # more than 400 pages that are the closest matches to a search string,
    # and just return the title and author
    print("\nUsing filters and vector search to find 3 books with more than 400 pages that are set in the arctic, returning just the title and author...")

    vector_cursor = collection.find(
        {"numberOfPages": {"$gt": 400}},
        sort={"$vectorize": "A book set in the arctic"},
        limit=3,
        projection={"title": True, "author": True}
    )

    for document in vector_cursor:
        print(document)


if __name__ == "__main__":
    main()