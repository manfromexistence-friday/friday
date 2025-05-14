import { getRegistryItem } from "@/data/r/themes";
import { NextResponse } from "next/server";
import { registryItemSchema } from "shadcn/registry";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const res = await getRegistryItem(id);
    const parsedRegistryItem = registryItemSchema.safeParse(res.registryItem);

    if (!parsedRegistryItem.success) {
      console.error(
        "Could not parse the registry item from the database:",
        parsedRegistryItem.error.format(),
      );

      return new NextResponse("Unexpected registry item format.", {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const registryItem = parsedRegistryItem.data;

    return new NextResponse(JSON.stringify(registryItem), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error("Error fetching the theme registry item:", e);

    return new NextResponse("Failed to fetch the theme registry item.", {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
