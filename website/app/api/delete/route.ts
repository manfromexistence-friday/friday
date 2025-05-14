import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_ID = "f0ead0e8-aa8b-4df6-98cd-96b67f70f471";
const ACCOUNT_TOKEN = "L8i5S6dbkfKkwpOip6omaExfCuVKY27b";

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  const response = await fetch(`https://api.gofile.io/contents/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${ACCOUNT_TOKEN}`,
    },
  });
  const data = await response.json();

  if (data.status !== "ok") {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}