from connect import connect_to_database
from astrapy.data_types import DataAPIDate
import json
import base64
import uuid


# def insert_json_data(database):
#     table = database.get_table("quickstart_table")

#     data_file_path = "./db/data.json"

#     with open(data_file_path, "r", encoding="utf8") as file:
#         json_data = json.load(file)

#     rows = [
#         {
#             **data,
#             "dueDate": (
#                 DataAPIDate.from_string(data["dueDate"])
#                 if data.get("dueDate")
#                 else None
#             ),
#             "summaryGenresVector": (
#                 f"summary: {data['summary']} | genres: {', '.join(data['genres'])}"
#             ),
#         }
#         for data in json_data
#     ]

#     insert_result = table.insert_many(rows)

#     print(f"Inserted {len(insert_result.inserted_ids)} rows")


def insert_image_data(database):
    table = database.get_table("images")

    # Path to the image file
    image_path = "./db/image.png"

    # Generate a unique ID for the image
    image_id = str(uuid.uuid4())

    # Read the image as binary data
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()

    # Encode the image in base64
    base64_image = base64.b64encode(image_data).decode('utf-8')

    # Create a row with the image data
    row = {
        "id": image_id,  # Using ID as the title (part of primary key)
        "data": base64_image,  # Store the encoded image in the summary field
    }

    # Insert the row with the image
    insert_result = table.insert_one(row)

    if insert_result.inserted_id:
        print(f"Inserted image with ID: {image_id}")
    else:
        print("Failed to insert image")


def main() -> None:
    database = connect_to_database()

    # insert_json_data(database)
    insert_image_data(database)


if __name__ == "__main__":
    main()