from astrapy import DataAPIClient
from astrapy.constants import VectorMetric
from astrapy.ids import UUID
from astrapy.info import CollectionDefinition
import base64
import uuid

ASTRA_DB_APPLICATION_TOKEN = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119"
ASTRA_DB_API_ENDPOINT = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com"

# Connect and create the Database object
my_client = DataAPIClient()
my_database = my_client.get_database(
    ASTRA_DB_API_ENDPOINT,
    token=ASTRA_DB_APPLICATION_TOKEN,
)

# Create a vector collection
my_collection = my_database.create_collection(
    "image_generations",
    definition=(
        CollectionDefinition.builder()
        .set_vector_dimension(3)
        .set_vector_metric(VectorMetric.COSINE)
        .build()
    )
)

# Path to the image file
image_path = "./db/image.png"

# Generate a unique ID for the image
image_id = str(uuid.uuid4())

# Read the image as binary data and encode in base64
with open(image_path, "rb") as image_file:
    image_data = image_file.read()
    
base64_image = base64.b64encode(image_data).decode('utf-8')

# Insert image into the vector collection
# In a real application, you would generate the vector embedding from image features
my_collection.insert_one({
    "_id": UUID(image_id),
    "id": image_id,
    "data": base64_image,
    "$vector": [0.1, 0.2, 0.3]  # Example vector embedding
})

print(f"Inserted image with ID: {image_id}")

# Run a vector search
cursor = my_collection.find(
    {},
    sort={"$vector": [0.1, 0.2, 0.3]},
    limit=1,
    include_similarity=True,
)

for result in cursor:
    print(f"Found image with ID {result['id']}: similarity {result['$similarity']}")

# Resource cleanup
# my_collection.drop()  # Uncomment to drop the collection after testing