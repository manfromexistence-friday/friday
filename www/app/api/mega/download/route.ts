import { Storage, File as MegaFile } from "megajs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("id");
  
  if (!fileId) {
    return NextResponse.json({ error: "No file ID provided" }, { status: 400 });
  }

  try {
    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    });

    // Wait for login
    await new Promise((resolve) => storage.once("ready", resolve));

    // Get the file from MEGA
    const file = storage.files[fileId] as MegaFile | undefined;
    
    if (!file) {
      throw new Error("File not found");
    }

    // Download file stream
    const downloadStream = await file.download({ maxConnections: 4 });
    
    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    const buffer = Buffer.concat(chunks);
    
    // Close the storage connection
    storage.close();

    // Create response with file content
    const response = new NextResponse(buffer);
    
    // Set content disposition header for download
    response.headers.set(
      "Content-Disposition", 
      `attachment; filename="${encodeURIComponent(file.name || 'unknown')}"` 
    );
    
    // Set content type based on file extension
    const contentType = getContentType(file.name || 'unknown');
    response.headers.set("Content-Type", contentType);
    
    return response;
  } catch (error) {
    console.error("Error downloading file from MEGA:", error);
    return NextResponse.json(
      { error: "Failed to download file from MEGA" },
      { status: 500 }
    );
  }
}

// Helper function to determine content type
function getContentType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',
    json: 'application/json',
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    zip: 'application/zip'
  };
  
  return extension && mimeTypes[extension] 
    ? mimeTypes[extension] 
    : 'application/octet-stream';
}
