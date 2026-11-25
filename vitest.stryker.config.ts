import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

// Mutation testing collects coverage for every test. With spec files sharing
// one loaded copy, that coverage piles up in one long-lived worker until the
// worker crashes passing it back, so each file runs on its own here.
//
// The bot's specs are left out: they play games through the engine, so a
// mutant only they notice is not one a spec of the rules has pinned.
export default mergeConfig(
  baseConfig,
  defineConfig({ test: { exclude: ['src/bot/**'], isolate: true } }),
);
