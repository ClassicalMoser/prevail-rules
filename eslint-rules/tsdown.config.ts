import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'tsdown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: {
    'boundaryAliasVsRelative': path.resolve(__dirname, 'boundaryAliasVsRelative/index.ts'),
  },
  format: ['esm'],
  dts: false,
  unbundle: false, // Bundle all modules into a single file
  sourcemap: false,
  clean: false,
  outDir: __dirname,
  outExtension: () => ({
    js: '.js',
  }),
});
