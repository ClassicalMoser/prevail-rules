import type { ExpectedEventInfo } from '@events';
import type { GameState } from '@game';
import { throwIfUndefined } from '@utils';
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
  // The find answers `undefined` only once the battle is won; a caller of this
  // twin has said the game goes on, so a finished game is its mistake.
  const found = findExpectedEvent(state);
  const expected = throwIfUndefined(found, 'Game is already over');

  // The choice or effect the game is waiting for.
  return expected;
}
