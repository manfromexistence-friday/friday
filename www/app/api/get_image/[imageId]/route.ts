import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = "mongodb+srv://manfromexistence01:nud6dyn49opHNd3M@cluster0.porylsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
let client: MongoClient;

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
  }
  return client;
}

export async function GET(
  request: NextRequest,
  context: { params: { imageId: string } }
) {
  try {
    // Properly await and destructure the imageId parameter
    const { imageId } = context.params;
    
    const mongoClient = await connectToMongo();
    const db = mongoClient.db("image_db");
    const imagesCollection = db.collection("images");

    const imageDoc = await imagesCollection.findOne({ _id: new ObjectId(imageId) });
    if (!imageDoc) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      image: imageDoc.image_data,
      mime_type: imageDoc.mime_type,
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}