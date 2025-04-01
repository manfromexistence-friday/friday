from connect import connect_to_database
from astrapy.info import (
    CreateTableDefinition,
    ColumnType,
)


def main() -> None:
    database = connect_to_database()

    table_definition = (
        CreateTableDefinition.builder()
        # Define only the columns needed for image storage
        .add_column("id", ColumnType.TEXT)  # Unique identifier for each image
        .add_column("data", ColumnType.TEXT)  # Base64-encoded image data
        # Define the primary key for the table
        .add_partition_by(["id"])
        # Build the table definition
        .build()
    )

    table = database.create_table(
        "images",
        definition=table_definition,
    )

    print("Created images table")


if __name__ == "__main__":
    main()