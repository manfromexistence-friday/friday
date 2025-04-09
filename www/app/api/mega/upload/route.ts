import { Storage, File as MegaFile } from "megajs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    });

    // Wait for login
    await new Promise((resolve) => storage.once("ready", resolve));

    // Try to find the Cloud Drive by name
    const rootChildren = Object.values(storage.root.children || {});
    let cloudDrive = rootChildren.find(
      (item) => item.name === "Cloud Drive" && item instanceof MegaFile
    ) as MegaFile | undefined;

    // If not found by name, use the handle directly
    if (!cloudDrive) {
      cloudDrive = storage.files["5iVnHDRL"] as MegaFile | undefined;
    }

    if (!cloudDrive) {
      throw new Error("Could not locate Cloud Drive folder");
    }

    // Convert the file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload file to MEGA
    const uploadedFile = await storage.upload({
      name: file.name,
      size: buffer.length
    }, buffer);

    await new Promise((resolve) => uploadedFile.once("complete", resolve));

    // Close the storage connection
    storage.close();

    return NextResponse.json({ 
      success: true,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading to MEGA:", error);
    return NextResponse.json(
      { error: "Failed to upload file to MEGA" },
      { status: 500 }
    );
  }
}
