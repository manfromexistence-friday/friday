// app/components/FileIoManager.tsx
"use client";

import { useState } from "react";

interface FileIoItem {
  name: string;
  url: string;
  size?: number;
}

export default function FileIoManager() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<FileIoItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedFile(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await uploadResponse.json();
      setUploadedFile({
        name: file.name,
        url: data.url,
        size: data.size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>File.io Manager</h2>
      <form onSubmit={handleUpload} style={{ marginBottom: "20px" }}>
        <input
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <button
          type="submit"
          disabled={!file || isUploading}
          style={{
            padding: "10px 20px",
            backgroundColor: isUploading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: isUploading || !file ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {uploadedFile && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Uploaded File</h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <span>
              📄 {uploadedFile.name}
              {uploadedFile.size && ` (${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)`}
              <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "10px" }}>
                [Download]
              </a>
            </span>
          </div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}