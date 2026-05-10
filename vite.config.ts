import lintConfig from './oxlint.config.ts';
import fmtConfig from './oxfmt.config.ts';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  server: {},
  build: {},
  preview: {},
  lint: lintConfig,
  fmt: fmtConfig,
  run: {},
  pack: {},
  staged: {},
});
