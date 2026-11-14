import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/QML/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: 'index.html',
        learn: 'learn.html',
        library: 'library.html',
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
