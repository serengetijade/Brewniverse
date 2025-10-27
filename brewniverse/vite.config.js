import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 65083,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild',
    }
})