import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const BUILD_ID = String(Date.now());

function generateVersionFilePlugin() {
  return {
    name: 'generate-version-json',
    writeBundle(options) {
      const outDir = options.dir || 'dist';
      const versionFile = path.resolve(outDir, 'version.json');
      fs.writeFileSync(
        versionFile,
        JSON.stringify(
          {
            buildId: BUILD_ID,
            builtAt: new Date().toISOString(),
          },
          null,
          2
        )
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), generateVersionFilePlugin()],
  define: {
    __APP_BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/eventos': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});