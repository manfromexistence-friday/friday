import { connectToDatabase } from "./connect-collection";
import type { Book } from "./connect-collection";
import { Db, Collection } from "@datastax/astra-db-ts";
import fs from "fs";

/**
 * Creates a collection in the specified database with vectorization enabled.
 * The collection will use NVIDIA's NV-Embed-QA embedding model
 * to generate vector embeddings for data in the collection.
 *
 * @param database - The instantiated object that represents the database where the collection will be created.
 * @param collectionName - The name of the collection to create.
 * @returns A promise that resolves to the created collection.
 */
async function createCollection(
  database: Db,
  collectionName: string,
): Promise<Collection<Book>> {
  const collection = await database.createCollection<Book>(collectionName, {
    vector: {
      service: {
        provider: "nvidia",
        modelName: "NV-Embed-QA",
      },
    },
  });

  console.log(
    `Created collection ${collection.keyspace}.${collection.name}`,
  );

  return collection;
}

/**
 * Uploads data from a file containing a JSON array to the specified collection.
 * For each piece of data, a $vectorize field is added. The $vectorize value is
 * a string from which vector embeddings will be generated.
 *
 * @param collection - The instantiated object that represents the collection to upload the data to.
 * @param dataFilePath - The path to a JSON file containing a JSON array.
 * @param embeddingStringCreator - A function to create the string for which vector embeddings will be generated.
 * @returns {Promise<void>} A promise that resolves when the data has been uploaded.
 */
async function uploadJsonData(
  collection: Collection<Book>,
  dataFilePath: string,
  embeddingStringCreator: (data: Record<string, any>) => string,
): Promise<void> {
  // Read the JSON file and parse it into a JSON array.
  const rawData = fs.readFileSync(dataFilePath, "utf8");
  const jsonData = JSON.parse(rawData);

  // Add a $vectorize field to each piece of data.
  const documents: Book[] = jsonData.map((data: any) => ({
    ...data,
    $vectorize: embeddingStringCreator(data),
  }));

  // Upload the data.
  const inserted = await collection.insertMany(documents);
  console.log(`Inserted ${inserted.insertedCount} items.`);
}

(async function () {
  const database = connectToDatabase();

  const collection = await createCollection(
    database,
    "quickstart_collection",
  );

  await uploadJsonData(
    collection,
    "./data.json",
    (data) => {
      return `summary: ${data["summary"]} | genres: ${data["genres"].join(", ")}`;
    },
  );
})();