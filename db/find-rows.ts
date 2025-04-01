import { connectToDatabase } from "./connect";

(async function () {
  const database = connectToDatabase();
  const table = database.table("images");

  // Image ID to search for
  const imageId = "ff3ddac3-b9bd-4e5f-9c17-c1969ba0c7cc";

  console.log(`\nSearching for image with ID: ${imageId}`);

  // Find the image by its ID
  const imageData = await table.findOne(
    { id: imageId }
  );

  if (imageData) {
    console.log(`Image found with ID: ${imageData.id}`);
    console.log(`Image data size: ${imageData.data.length} characters (base64)`);

    // Save the retrieved image to a file
    try {
      const decodedImage = Buffer.from(imageData.data, 'base64');
      const outputPath = `./retrieved_image_${imageId}.png`;
      
      // Using Bun.write instead of fs.writeFileSync
      await Bun.write(outputPath, decodedImage);
      console.log(`Image saved to ${outputPath}`);
    } catch (e) {
      console.log(`Error saving image: ${e}`);
    }
  } else {
    console.log(`No image found with ID: ${imageId}`);
  }
})();