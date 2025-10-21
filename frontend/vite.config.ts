/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  server: {
    host: true, // これは Dockerfile の --host 0.0.0.0 と同じ意味であります
    port: 5173, // これも Dockerfile の --port 5173 と同じ意味であります

    // ★★★ これが今回のキモであります！ ★★★
    // 「このホスト名からのアクセスは許可する！」
    allowedHosts: ['archive.totototo0526.site']
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
});
