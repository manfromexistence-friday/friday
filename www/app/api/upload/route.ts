import { NextRequest, NextResponse } from "next/server";
import { Storage, File as MegaFile } from "megajs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as globalThis.File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    });

    // Wait for login
    await new Promise((resolve) => storage.once("ready", resolve));

    // Find the Cloud Drive folder by name
    let cloudDrive = Object.values(storage.root.children || {}).find(
      (item) => item.name === "Cloud Drive" && (item as any).children !== undefined
    );

    // If not found, use the handle
    if (!cloudDrive) {
      console.log("Cloud Drive not found by name, using handle '5iVnHDRL'");
      cloudDrive = storage.files["5iVnHDRL"];
    }

    if (!cloudDrive) {
      throw new Error("Could not locate Cloud Drive folder by name or handle '5iVnHDRL'");
    }

    // Upload file to the Cloud Drive folder
    const upload = storage.upload({
      name: file.name,
      size: buffer.length,
      folder: cloudDrive, // Specify the Cloud Drive as the target
    } as any, buffer);

    await new Promise((resolve, reject) => {
      upload.on("complete", resolve);
      upload.on("error", reject);
    });

    // Close the storage connection
    storage.close();

    return NextResponse.json({ success: true, message: "File uploaded to MEGA Cloud Drive" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};