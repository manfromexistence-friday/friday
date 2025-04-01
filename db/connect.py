from astrapy import DataAPIClient, Database


def connect_to_database() -> Database:

    endpoint = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com"
    token = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119"

    if not token or not endpoint:
        raise RuntimeError(
            "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined"
        )

    # Create an instance of the `DataAPIClient` class with your token.
    client = DataAPIClient(token)

    # Get the database specified by your endpoint.
    database = client.get_database(endpoint)

    print(f"Connected to database {database.info().name}")

    return database
