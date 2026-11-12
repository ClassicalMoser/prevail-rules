import type { RandomSource } from '@utils';

/** The modulus of the generator: the prime 2^31 − 1. */
const MODULUS = 2_147_483_647;

/** The multiplier of the generator, a primitive root of the modulus. */
const MULTIPLIER = 48_271;

/**
 * A random source that gives the same draws for the same seed, so a bot game
 * can be played again exactly: the dice the procedures roll and the whims the
 * bots follow all come from seeded sources. It is the Park–Miller generator,
 * small and plain, good enough for games and not meant for anything secret.
 *
 * @param seed - Any whole number; the same seed gives the same draws
 * @returns A source whose draws lie in [0, 1)
 */
export function createSeededRandom(seed: number): RandomSource {
  // The state must be a whole number from 1 to the modulus less one.
  let state = ((Math.trunc(seed) % MODULUS) + MODULUS) % MODULUS || 1;
  const source: RandomSource = {
    nextFloat: () => {
      state = (state * MULTIPLIER) % MODULUS;
      // From 1 to the modulus less one, scaled into [0, 1).
      return (state - 1) / (MODULUS - 1);
    },
  };
  return source;
}
