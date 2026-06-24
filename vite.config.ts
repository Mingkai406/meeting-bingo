import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Don't ship source maps to production (review issue #16).
    sourcemap: false,
  },
});
