from quickstart_connect import connect_to_database
from astrapy.info import (
    CreateTableDefinition,
    ColumnType,
    TableVectorIndexOptions,
    VectorServiceOptions,
)
from astrapy.constants import VectorMetric


def main() -> None:
    database = connect_to_database()

    table_definition = (
        CreateTableDefinition.builder()
        # Define all of the columns in the table
        .add_column("title", ColumnType.TEXT)
        .add_column("author", ColumnType.TEXT)
        .add_column("numberOfPages", ColumnType.INT)
        .add_column("rating", ColumnType.FLOAT)
        .add_column("publicationYear", ColumnType.INT)
        .add_column("summary", ColumnType.TEXT)
        .add_set_column(
            "genres",
            ColumnType.TEXT,
        )
        .add_map_column(
            "metadata",
            # This is the key type for the map column
            ColumnType.TEXT,
            # This is the value type for the map column
            ColumnType.TEXT,
        )
        .add_column("isCheckedOut", ColumnType.BOOLEAN)
        .add_column("borrower", ColumnType.TEXT)
        .add_column("dueDate", ColumnType.DATE)
        # This column will store vector embeddings.
        # The column will use an embedding model from NVIDIA to generate the
        # vector embeddings when data is inserted to the column.
        .add_vector_column(
            "summaryGenresVector",
            dimension=1024,
            service=VectorServiceOptions(
                provider="nvidia",
                model_name="NV-Embed-QA",
            ),
        )
        # Define the primary key for the table.
        # In this case, the table uses a composite primary key.
        .add_partition_by(["title", "author"])
        # Finally, build the table definition.
        .build()
    )

    table = database.create_table(
        "quickstart_table",
        definition=table_definition,
    )

    print("Created table")

    # Index any columns that you want to sort and filter on.
    table.create_index(
        "ratingIndex",
        column="rating",
    )

    table.create_index(
        "numberOfPagesIndex",
        column="numberOfPages",
    )

    table.create_vector_index(
        "summaryGenresVectorIndex",
        column="summaryGenresVector",
        options=TableVectorIndexOptions(
            metric=VectorMetric.COSINE,
        ),
    )

    print("Indexed columns")


if __name__ == "__main__":
    main()