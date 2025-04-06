// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

const ACCOUNT_ID = "f0ead0e8-aa8b-4df6-98cd-96b67f70f471";
const ACCOUNT_TOKEN = "L8i5S6dbkfKkwpOip6omaExfCuVKY27b";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const serverResponse = await fetch(
    `https://api.gofile.io/servers?accountId=${ACCOUNT_ID}&token=${ACCOUNT_TOKEN}`
  );
  const serverData = await serverResponse.json();
  const server = serverData.data.servers[0].name;

  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("token", ACCOUNT_TOKEN);

  const uploadResponse = await fetch(`https://${server}.gofile.io/uploadFile`, {
    method: "POST",
    body: uploadFormData,
  });
  const uploadData = await uploadResponse.json();

  if (uploadData.status !== "ok") {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ url: uploadData.data.downloadPage });
}