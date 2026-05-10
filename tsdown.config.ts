import { defineConfig } from 'tsdown';

export default defineConfig({
  alias: {
    '@commands': './src/commands',
    '@entities': './src/entities',
    '@game': './src/game',
    '@queries': './src/functions',
    '@sampleValues': './src/sampleValues',
    '@testing': './src/testing',
    '@utils': './src/utils',
    '@validation': './src/validation',
  },
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
