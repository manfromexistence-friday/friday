import { NextRequest, NextResponse } from "next/server";
import { DataAPIClient } from "@datastax/astra-db-ts";

// Astra connection details
const endpoint = "https://86aa9693-ff4b-42d1-8a3d-a3e6d65b7d80-us-east-2.apps.astra.datastax.com";
const token = "AstraCS:wgxhHEEYccerYdqKsaTyQKox:4d0ac01c55062c11fc1e9478acedc77c525c0b278ebbd7220e1d873abd913119";

// Singleton client instance
let client: DataAPIClient | null = null;
let database: ReturnType<DataAPIClient["db"]> | null = null;

async function connectToAstra() {
  if (!client || !database) {
    if (!token || !endpoint) {
      throw new Error(
        "Environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN must be defined."
      );
    }
    client = new DataAPIClient(token);
    database = client.db(endpoint);
    console.log(`Connected to Astra database ${database.id}`);
  }
  return database;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { imageId } = resolvedParams;

    const db = await connectToAstra();
    const imagesTable = db.table("images");

    const imageData = await imagesTable.findOne({ id: imageId });
    if (!imageData) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      image: imageData.data, // Base64 string from Astra
    });
  } catch (error) {
    console.error("Error fetching image from Astra:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}