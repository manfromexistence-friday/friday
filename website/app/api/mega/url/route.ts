import { Storage, File as MegaFile } from "megajs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Download the file from the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Get filename from URL or Content-Disposition header
    let filename = url.split('/').pop()?.split('?')[0] || 'downloaded_file';
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
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

    // Upload file to MEGA
    const uploadedFile = storage.upload({
      name: filename,
      size: buffer.length,
      folder: cloudDrive, // Specify the Cloud Drive as the target
    } as any, buffer);
    await new Promise((resolve, reject) => {
      uploadedFile.once('complete', resolve);
      uploadedFile.once('error', reject);
    });

    // Close the storage connection
    storage.close();

    return NextResponse.json({ 
      success: true, 
      message: "File downloaded and uploaded to MEGA",
      filename
    });
  } catch (error) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: "Failed to download and upload URL" },
      { status: 500 }
    );
  }
}
