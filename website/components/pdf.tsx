"use client";
import { Viewer } from '@react-pdf-viewer/core';
// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Fix for PDF.js worker in Codespaces/CodeSandbox/Next.js
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer() {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    return (
        <div style={{ height: '100vh' }}>
            <Viewer
                fileUrl="/cv.pdf"
                plugins={[defaultLayoutPluginInstance]}
            />
        </div>
    );
}