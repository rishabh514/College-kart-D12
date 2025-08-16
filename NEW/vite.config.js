import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer'; // <-- 1. IMPORT THE PLUGIN

// https://vitejs.dev/config/
export default defineConfig({
    root: '.',
    plugins: [
        react(),
        // --- 2. ADD THE VISUALIZER PLUGIN HERE ---
        // This will generate a report file called stats.html in your 'dist' folder
        visualizer({
            filename: './dist/stats.html',
            open: true, // Automatically open the report in your browser after building
            gzipSize: true, // Show the size of the bundle after gzip compression
            brotliSize: true, // Show the size after brotli compression (most realistic)
        }),
    ],
    server: {
        port: 3000,
    },
    build: {
        outDir: './dist',
    },
    // The base path for your application.
    base: "/",
}); // Note: I removed the extra ']' from your original file for correct syntax.