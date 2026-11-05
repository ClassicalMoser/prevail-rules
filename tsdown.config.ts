import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  entry: ['src/domain/index.ts', 'src/application/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  sourcemap: false,
  unbundle: false,
});
