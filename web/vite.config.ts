/// <reference types="vitest" />

import analog from '@analogjs/platform';
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    cacheDir: `../node_modules/.vite`,
    build: {
      outDir: '../dist/./web/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    server: {
      fs: {
        allow: ['.'],
      },
    },
    ssr: {
      // firebase-admin uses CJS exports — keep it external so Vite SSR
      // doesn't try to transform it as ESM.
      external: ['firebase-admin', 'firebase-admin/app', 'firebase-admin/auth', 'firebase-admin/firestore'],
    },
    plugins: [
      analog({
        nitro: {
          // Use node-server preset in production so Cloud Run gets a proper
          // Node.js HTTP server. Local dev / test keep the default preset.
          preset: mode === 'production' ? 'node-server' : undefined,
          // firebase-admin and its sub-packages are CJS — keep them external
          // so Nitro/Vite doesn't try to bundle them as ESM.
          externals: {
            external: [
              'firebase-admin',
              'firebase-admin/app',
              'firebase-admin/auth',
              'firebase-admin/firestore',
            ],
          },
        },
      }),
      nxViteTsPaths(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
  };
});
