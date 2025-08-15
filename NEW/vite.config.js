import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The 'proxy' configuration has been removed as it is not needed for this solution.
export default defineConfig({
    root: '.',
    plugins: [react()],
    server: {
        port: 3000,
    },
    build: {
        outDir: './dist',
    },
    // The base path for your application.
    base: "/",
})