import type { ExpectedGameEffect } from './expectedGameEffect';
import type { ExpectedPlayerInput } from './expectedPlayerInput';

/**
 * What the game waits on next: a player's choice, or a game effect.
 * `findExpectedEvent` and `getExpectedEvent` write it. `advanceEffects`
 * reads it to run the next
 * effect, and `validateExpectedChoice` reads it to check a choice is the
 * one asked for.
 */
export type ExpectedEventInfo = ExpectedPlayerInput | ExpectedGameEffect;
