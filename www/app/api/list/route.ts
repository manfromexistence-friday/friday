import { NextResponse } from "next/server";

const ACCOUNT_ID = "f0ead0e8-aa8b-4df6-98cd-96b67f70f471";
const ACCOUNT_TOKEN = "L8i5S6dbkfKkwpOip6omaExfCuVKY27b";

interface GoFileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  link?: string;
}

export async function GET() {
  const response = await fetch(
    `https://api.gofile.io/contents?accountId=${ACCOUNT_ID}&token=${ACCOUNT_TOKEN}`
  );
  const data = await response.json();

  if (data.status !== "ok") {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }

  const rootContents = data.data.rootFolder.children;
  const items: GoFileItem[] = Object.values(rootContents).map((item: any) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    size: item.size,
    link: item.type === "file" ? item.link : undefined,
  }));

  return NextResponse.json({ items });
}