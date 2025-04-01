import { connectToDatabase } from "./connect";
import { Table, InferTablePrimaryKey, InferTableSchema } from "@datastax/astra-db-ts";

const database = connectToDatabase();

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    title: "text",
    author: "text",
    numberOfPages: "int",
    rating: "float",
    publicationYear: "int",
    summary: "text",
    genres: { type: "set", valueType: "text" },
    metadata: {
      type: "map",
      keyType: "text",
      valueType: "text",
    },
    isCheckedOut: "boolean",
    borrower: "text",
    dueDate: "date",
    // This column will store vector embeddings.
    // The column will use an embedding model from NVIDIA to generate the
    // vector embeddings when data is inserted to the column.
    summaryGenresVector: {
      type: "vector",
      dimension: 1024,
      service: {
        provider: "nvidia",
        modelName: "NV-Embed-QA",
      },
    },
  },
  // Define the primary key for the table.
  // In this case, the table uses a composite primary key.
  primaryKey: {
    partitionBy: ["title", "author"],
  },
});

// Infer the TypeScript-equivalent type of the table's schema and primary key.
// Export the types for later use.
export type TableSchema = InferTableSchema<typeof tableDefinition>;
export type TablePrimaryKey = InferTablePrimaryKey<typeof tableDefinition>;

(async function () {
  const table = await database.createTable<TableSchema, TablePrimaryKey>(
    "quickstartTable",
    { definition: tableDefinition },
  );

  console.log("Created table");

  // Index any columns that you want to sort and filter on.
  await table.createIndex("ratingIndex", "rating");

  await table.createIndex("numberOfPagesIndex", "numberOfPages");

  await table.createVectorIndex(
    "summaryGenresVectorIndex",
    "summaryGenresVector",
    {
      options: {
        metric: "cosine",
      },
    },
  );

  console.log("Indexed columns");
})();