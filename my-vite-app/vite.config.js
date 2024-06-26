import { defineConfig } from 'vite';
import copy from 'rollup-plugin-copy';
import fs from 'fs';
import path from 'path';

// Custom plugin to set the correct content type for .wasm files
const wasmContentTypePlugin = {
  name: 'wasm-content-type-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
        const newPath = req.url.replace('deps', 'dist');
        const targetPath = path.join(__dirname, newPath);
        const wasmContent = fs.readFileSync(targetPath);
        return res.end(wasmContent);
      }
      next();
    });
  },
};

export default defineConfig(({ command }) => {
  const commonConfig = {
    build: {
      target: 'esnext',
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  };

  if (command === 'serve') {
    return {
      ...commonConfig,
      plugins: [
        copy({
          targets: [{ src: 'node_modules/**/*.wasm', dest: 'node_modules/.vite/dist' }],
          copySync: true,
          hook: 'buildStart',
        }),
        wasmContentTypePlugin,
      ],
    };
  }

  return commonConfig;
});