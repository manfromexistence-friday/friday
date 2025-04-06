from connect import connect_to_database

def main() -> None:
    database = connect_to_database()
    table = database.get_table("images")

    print("\nListing all images in the database...")

    # Get all images from the table
    all_images = table.find()  # No filter to get all records
    
    # Count and display information about each image
    image_count = 0
    
    for image in all_images:
        image_count += 1
        print(f"\nImage {image_count}:")
        print(f"  ID: {image['id']}")
        print(f"  Data size: {len(image['data'])} characters (base64)")
        
        # Uncomment the following code to save all images to files
        # Note: This will save ALL images in the database - could be many files
        """
        try:
            decoded_image = base64.b64decode(image['data'])
            output_path = f"./retrieved_image_{image['id']}.png"
            
            with open(output_path, "wb") as image_file:
                image_file.write(decoded_image)
                
            print(f"  Saved to {output_path}")
        except Exception as e:
            print(f"  Error saving image: {e}")
        """
    
    print(f"\nTotal images found: {image_count}")
    
    if image_count == 0:
        print("No images found in the database.")


if __name__ == "__main__":
    main()