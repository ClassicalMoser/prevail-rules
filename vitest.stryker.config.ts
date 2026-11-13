import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

// Mutation testing collects coverage for every test. With spec files sharing
// one loaded copy, that coverage piles up in one long-lived worker until the
// worker crashes passing it back, so each file runs on its own here.
export default mergeConfig(
  baseConfig,
  defineConfig({ test: { isolate: true } }),
);
