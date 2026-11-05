import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  entry: [
    'src/domain/index.ts',
    'src/application/index.ts',
    // Stand-in cards, units and armies. Its own entry so a consumer's tests can
    // reach it without the domain barrel carrying sample data into production.
    'src/domain/sampleValues/index.ts',
  ],
  format: ['esm'],
  outDir: 'dist',
  outExtensions: () => ({
    dts: '.d.ts',
    js: '.js',
  }),
  sourcemap: false,
  unbundle: false,
});
