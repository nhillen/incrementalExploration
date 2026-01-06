import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/incremental/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
