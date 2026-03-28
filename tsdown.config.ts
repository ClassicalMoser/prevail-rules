import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/domain/index.ts', 'src/application/index.ts'],
  format: ['esm'],
  unbundle: false,
  sourcemap: false,
  clean: true,
  outDir: 'dist',
  outExtensions: () => ({
    js: '.js',
    dts: '.d.ts',
  }),
  alias: {
    '@entities': './src/entities',
    '@queries': './src/functions',
    '@commands': './src/commands',
    '@testing': './src/testing',
    '@utils': './src/utils',
    '@validation': './src/validation',
    '@sampleValues': './src/sampleValues',
  },
});
