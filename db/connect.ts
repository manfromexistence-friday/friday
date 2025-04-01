import { DataAPIClient } from "@datastax/astra-db-ts";

export function connectToDatabase(): any {

    const endpoint = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com";
    const token = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119";

    if (!token || !endpoint) {
        throw new Error(
            "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined.",
        );
    }

    // Create an instance of the `DataAPIClient` class with your token.
    const client = new DataAPIClient(token);

    // Get the database specified by your endpoint.
    const database = client.db(endpoint);

    console.log(`Connected to database ${database.id}`);

    return database;
}