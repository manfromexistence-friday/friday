"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress - replace with actual upload code
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 300);

      // Here would be your actual MEGA upload logic
      // For example: const response = await fetch('/api/mega/upload', {...})

      // After successful upload
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          setFile(null);
          // Refresh the page to show the updated file list
          window.location.reload();
        }, 500);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-md border p-6">
      <h2 className="text-xl font-semibold">Upload File to MEGA</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Select File
          </label>
          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        
        {error && <p className="text-sm text-red-500">{error}</p>}
        
        {file && !uploading && (
          <div className="text-sm">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Uploading...</span>
              <span className="text-sm">{uploadProgress}%</span>
            </div>
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div 
                className="bg-primary h-full transition-all duration-500" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="ring-offset-background focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload to MEGA"}
        </button>
      </form>
    </div>
  );
}