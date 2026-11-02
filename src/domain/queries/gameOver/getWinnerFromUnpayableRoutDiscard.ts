import type { PlayerSide } from '@entities';
import type { GameState, RoutState } from '@game';

import { getAwaitingRoutDiscardState } from '../sequencing/combatOutcomes/rout/getAwaitingRoutDiscardState';

/**
 * Readers throw these when the slice they name is not open yet.
 * A movement engagement that is not rear uses the prefix below.
 * Anything else is a broken slice and must propagate.
 */
const ABSENT_ROUT_SLICE_MESSAGES = new Set([
  'No current phase state found',
  'No current command resolution state',
  'No current melee resolution state',
  'Movement resolution has no engagement state',
  'No attack apply state found in ranged attack resolution',
  'No rout state found in attack apply state',
  'No rout state found in melee resolution',
  'No rout state found in rally resolution',
]);

const OTHER_ENGAGEMENT_PREFIX =
  'Expected rear engagement for movement rout, got ';

/** True when `error` is one of the readers' "this slice is not open" messages. */
function isAbsentRoutSlice(error: unknown): boolean {
  if (!(error instanceof Error)) {
    const absent = false;
    return absent;
  }
  const message = error.message;
  const known = ABSENT_ROUT_SLICE_MESSAGES.has(message);
  const otherEngagement = message.startsWith(OTHER_ENGAGEMENT_PREFIX);
  const absent = known || otherEngagement;
  return absent;
}

/**
 * The rout that is awaiting a discard, or null when the slice is not open.
 * A throw that is not an absence message is rethrown.
 */
function routDiscardOrNone(state: GameState): RoutState | null {
  try {
    const routState = getAwaitingRoutDiscardState(state);
    return routState;
  } catch (error) {
    if (isAbsentRoutSlice(error)) {
      const absent = null;
      return absent;
    }
    throw error;
  }
}

/**
 * Forced rout-discard loss: when a player must discard at least as many cards
 * as they hold, the other player wins immediately.
 *
 * Optional commit discards are not checked here.
 *
 * Asked on states where no rout slice is open. The readers throw for that.
 * Those messages mean the discard is not pending. Any other error propagates.
 *
 * @param state - The current game state.
 * @returns Winning side, or `undefined` when no unpayable rout discard is pending.
 */
export function getWinnerFromUnpayableRoutDiscard(
  state: GameState,
): PlayerSide | undefined {
  const routState = routDiscardOrNone(state);
  if (routState === null || routState.numberToDiscard === 'pending') {
    return undefined;
  }

  const handSize = state.cardState[routState.player].inHand.length;
  if (routState.numberToDiscard < handSize) {
    return undefined;
  }

  const winner = routState.player === 'white' ? 'black' : 'white';
  return winner;
}
