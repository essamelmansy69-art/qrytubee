import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: false, // keep original images/etc.
  },
  server: {
    port: 3000,
    strictPort: true,
    hmr: false, // Disabled as per instruction
  },
});
