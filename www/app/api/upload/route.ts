// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024 * 1024) { // 10 GB limit
      return NextResponse.json({ error: "File exceeds 10 GB limit" }, { status: 400 });
    }

    const fileName = file.name || "uploaded_file";
    const uploadResponse = await fetch(`https://transfer.sh/${encodeURIComponent(fileName)}`, {
      method: "PUT",
      body: file,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const responseText = await uploadResponse.text();
    console.log("Raw response from Transfer.sh:", responseText);

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: `Upload failed: ${responseText || uploadResponse.statusText}` }, { status: uploadResponse.status });
    }

    const url = responseText.trim();
    const headResponse = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    });

    const size = headResponse.ok ? headResponse.headers.get("Content-Length") : null;

    return NextResponse.json({
      url: url,
      size: size ? parseInt(size, 10) : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}