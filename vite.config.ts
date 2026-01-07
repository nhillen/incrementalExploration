import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  
  // Base path for deployment to subdirectory
  // Change this if deploying to a different path
  base: '/incremental/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
