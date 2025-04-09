import { Storage, File as MegaFile } from "megajs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    // Get files from the Cloud Drive folder
    const files = Object.values(cloudDrive.children || {})
      .filter((item): item is MegaFile => item instanceof MegaFile)
      .map(file => ({
        id: file.nodeId,
        name: file.name,
        size: file.size,
        type: (file.name ?? '').split('.').pop() || 'file',
        isImage: /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name ?? ''),
        timestamp: file.timestamp
      }));

    // Close the storage connection
    storage.close();

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Error fetching MEGA files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files from MEGA" },
      { status: 500 }
    );
  }
}
