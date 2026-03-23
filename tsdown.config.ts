import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['esm'],
  bundle: true,
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
