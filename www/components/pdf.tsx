"use client";
import { Viewer } from '@react-pdf-viewer/core';

// Plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

export default function PDFViewer() {
    // Create the plugin instance inside the component
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
