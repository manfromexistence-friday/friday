import { Storage, File as MegaFile } from "megajs";
import UploadForm from "@/components/mega";

export default async function Home() {
  let files: MegaFile[] = [];
  let errorMessage = "";

  try {
    // Initialize MEGA storage
    const storage = new Storage({
      email: process.env.MEGA_EMAIL!,
      password: process.env.MEGA_PASSWORD!,
    });

    // Wait for login
    await new Promise((resolve) => storage.once("ready", resolve));

    // Log root children for debugging
    const rootChildren = Object.values(storage.root.children || {});

    // Try to find the Cloud Drive by name
    let cloudDrive = rootChildren.find(
      (item) => item.name === "Cloud Drive" && item instanceof MegaFile
    ) as MegaFile | undefined;

    // If not found by name, use the handle directly
    if (!cloudDrive) {
    //   console.log("Cloud Drive not found by name, trying handle '5iVnHDRL'");
      cloudDrive = storage.files["5iVnHDRL"] as MegaFile | undefined;
    }

    if (!cloudDrive) {
      throw new Error("Could not locate Cloud Drive folder by name or handle '5iVnHDRL'");
    }

    // Get files from the Cloud Drive folder
    files = Object.values(cloudDrive.children || {}).filter(
      (item): item is MegaFile => item instanceof MegaFile
    );

    // Close the storage connection
    storage.close();
  } catch (error) {
    console.log("Error fetching MEGA files:", error);
    errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  }

  return (
    <main className="container mx-auto mt-12 space-y-6 py-10">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">MEGA Cloud Storage</h1>
        <div className="grid gap-4">
          <UploadForm />
          
          <div className="rounded-md border">
            {files.length > 0 ? (
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="border-b [&_tr]:border-b">
                    <tr className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Size</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {files.map((file) => (
                      <tr key={file.nodeId} className="hover:bg-muted/50 border-b transition-colors">
                        <td className="p-4 align-middle">{file.name}</td>
                        <td className="p-4 align-middle">{(file.size !== undefined ? (file.size / 1024).toFixed(2) : "0.00")} KB</td>
                        <td className="p-4 align-middle">
                          <form action={`/api/mega/download?id=${file.nodeId}`} method="post">
                            <button 
                              type="submit" 
                              className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            >
                              Download
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground flex items-center justify-center p-8">
                <p>No files found in your MEGA Cloud Drive.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}