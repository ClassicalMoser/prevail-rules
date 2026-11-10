import { defineConfig } from 'tsdown';

export default defineConfig({
  clean: true,
  entry: [
    'src/domain/index.ts',
    'src/application/index.ts',
    // Fixtures and stand-in catalogs, for packages that test against these
    // rules. Separate entries keep them out of the production bundle.
    'src/domain/testing/index.ts',
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
