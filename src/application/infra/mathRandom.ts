import type { RandomSource } from '@utils';

/**
 * The random source for live play: each draw is `Math.random`. A spec or a
 * recorded game passes a fixed source in its place, so the same choices give
 * the same game.
 */
export const mathRandom: RandomSource = {
  // A fresh draw in `[0, 1)` each time.
  nextFloat: () => Math.random(),
};
