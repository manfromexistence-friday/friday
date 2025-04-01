from connect import connect_to_database
import base64


def main() -> None:
    database = connect_to_database()
    table = database.get_table("images")

    # Image ID to search for
    image_id = "a1d76a89-4cfa-4c28-8e9f-54a132c985db"

    print(f"\nSearching for image with ID: {image_id}")

    # Find the image by its ID
    image_data = table.find_one(
        {"id": image_id}
    )

    if image_data:
        print(f"Image found with ID: {image_data['id']}")
        print(f"Image data size: {len(image_data['data'])} characters (base64)")

        # Uncomment the following code to save the image to a file
        
        # Save the retrieved image to a file
        try:
            decoded_image = base64.b64decode(image_data['data'])
            output_path = f"./retrieved_image_{image_id}.png"

            with open(output_path, "wb") as image_file:
                image_file.write(decoded_image)

            print(f"Image saved to {output_path}")
        except Exception as e:
            print(f"Error saving image: {e}")
        
    else:
        print(f"No image found with ID: {image_id}")


if __name__ == "__main__":
    main()