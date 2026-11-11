import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { findExpectedEvent } from './findExpectedEvent';

/**
 * The event the game expects next, insisting there is one.
 *
 * The twin of {@link findExpectedEvent} for callers that have already
 * established the game is still being played; asked of a finished game, it
 * throws rather than answer.
 *
 * @param state - The game state, only argument required.
 * @returns Discriminator information to identify which event to expect next,
 * as well as which player(s) to expect input from.
 * @throws When the game is already over (`winner` set).
 */
export function getExpectedEvent(state: GameState): ExpectedEventInfo {
  const expected = findExpectedEvent(state);
  if (expected === undefined) {
    throw new Error('Game is already over');
  }
  return expected;
}
