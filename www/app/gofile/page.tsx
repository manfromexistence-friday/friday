// app/components/GoFileManager.tsx
"use client"; // Mark this as a Client Component

import { useState } from "react";

const ACCOUNT_TOKEN = "L8i5S6dbkfKkwpOip6omaExfCuVKY27b";
const ROOT_FOLDER_ID = "f20b7abc-a019-433b-86dc-3db3e7ff243b"; // Your specified root folder ID
const WEBSITE_TOKEN = "4fd6sg89d7s6"; // Replace with the actual wt from your network tab

interface GoFileItem {
  id: string;
  name: string;
  size?: number;
  link?: string;
}

interface GoFileUploadResponse {
  fileId: string;
  fileName: string;
  downloadPage: string;
}

export default function GoFileManager() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<GoFileItem | null>(null);
  const [downloadPage, setDownloadPage] = useState<string | null>(null); // Fallback URL
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadedFile(null);
      setDownloadPage(null);
    }
  };

  // Get upload server
  const getUploadServer = async (): Promise<string> => {
    const response = await fetch(`https://api.gofile.io/servers`);
    const data = await response.json();
    if (data.status !== "ok" || !data.data.servers.length) {
      throw new Error("Failed to fetch upload server");
    }
    return data.data.servers[0].name;
  };

  // Fetch file details using file ID
  const fetchFileDetails = async (fileId: string) => {
    try {
      const response = await fetch(
        `https://api.gofile.io/contents/${fileId}?token=${ACCOUNT_TOKEN}&wt=${WEBSITE_TOKEN}`
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`API error: ${text || response.statusText}`);
      }

      const data = await response.json();
      if (data.status !== "ok") {
        throw new Error("Failed to fetch file details: " + (data.error?.message || "Unknown error"));
      }

      const item: GoFileItem = {
        id: data.data.id,
        name: data.data.name,
        size: data.data.size,
        link: data.data.directLink,
      };
      setUploadedFile(item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setUploadedFile(null); // Clear file details if fetch fails
    }
  };

  // Handle file upload
  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const server = await getUploadServer();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", ACCOUNT_TOKEN);
      formData.append("folderId", ROOT_FOLDER_ID);

      const uploadResponse = await fetch(`https://${server}.gofile.io/uploadFile`, {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadData.status !== "ok") {
        throw new Error("Upload failed: " + (uploadData.error?.message || "Unknown error"));
      }

      const fileId = uploadData.data.fileId;
      setDownloadPage(uploadData.data.downloadPage); // Store download page as fallback
      await fetchFileDetails(fileId); // Try to fetch file details
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>GoFile Manager</h2>

      {/* Upload Section */}
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

      {/* Uploaded File Info */}
      {uploadedFile ? (
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
              {uploadedFile.link && (
                <a href={uploadedFile.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "10px" }}>
                  [Download]
                </a>
              )}
            </span>
          </div>
        </div>
      ) : downloadPage ? (
        <div style={{ marginBottom: "20px" }}>
          <h3>Uploaded File</h3>
          <p>File uploaded, but details unavailable (free account limitation).</p>
          <a href={downloadPage} target="_blank" rel="noopener noreferrer">
            Download Page: {downloadPage}
          </a>
        </div>
      ) : null}

      {/* Error Display */}
      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}