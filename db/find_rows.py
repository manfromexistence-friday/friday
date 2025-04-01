from connect import connect_to_database


def main() -> None:
    database = connect_to_database()

    table = database.get_table("quickstart_table")

    # Find rows that match a filter
    print("\nFinding books with rating greater than 4.7...")

    rating_cursor = table.find(
        {"rating": {"$gt": 4.7}},
        projection={"title": True, "rating": True}
    )

    for row in rating_cursor:
        print(f"{row['title']} is rated {row['rating']}")

    # Perform a vector search to find the closest match to a search string
    print("\nUsing vector search to find a single scary novel...")

    single_vector_match = table.find_one(
        {},
        sort={"summaryGenresVector": "A scary novel"},
        projection={"title": True}
    )

    print(f"{single_vector_match['title']} is a scary novel")

    # Combine a filter and vector search to find the 3 books with
    # more than 400 pages that are the closest matches to a search string
    print(
        "\nUsing filters and vector search to find 3 books with more than 400 pages that are set in the arctic, returning just the title and author..."
    )

    vector_cursor = table.find(
        {"numberOfPages": {"$gt": 400}},
        sort={"summaryGenresVector": "A book set in the arctic"},
        limit=5,
        projection={"title": True, "author": True},
    )

    for row in vector_cursor:
        print(row)


if __name__ == "__main__":
    main()