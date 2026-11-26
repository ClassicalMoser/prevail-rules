import type { RoundEndEvent } from '@events';
import { createOpenedPlayCardsPhaseState } from '@factories';
import type { GameState } from '@game';

import { updateRoundState } from '@transforms/pureTransforms';

/**
 * Applies a RoundEndEvent to the game state.
 * Increments round number and resets to playCards phase (new round). It ends
 * round 0 (setup) into round 1 the same way it ends any round after cleanup.
 *
 * The step it ends from is not re-validated here; the event is trusted from the procedure /
 * machine-generated log.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the round advanced
 */
export function applyRoundEndEvent<S extends GameState>(
  _event: RoundEndEvent,
  state: S,
): S {
  // Increment round number
  // TODO(composition): no `@queries` reader gives the round number, so the
  // round is read here by hand. Settle by a query, or by saying a top-level
  // field read needs none.
  const newRoundNumber = state.currentRoundState.roundNumber + 1;

  // Create the new play cards phase state for the next round
  // Every round opens with both players choosing a card in secret (§4.1.1).
  const newPhaseState = createOpenedPlayCardsPhaseState();

  // Update the round state
  // Nothing carries over from the round that ended but what is on the table
  // (§1.5): no unit has been ordered yet, since a unit is ordered once a
  // round (§4.3.6), and no phase is finished. The initiative, the board and
  // the cards stay as they are.
  // TODO(composition): the same empty round is written out by
  // `createEmptyGameState` for round 0. Settle by one factory for a round as
  // it opens, which both call.
  const advanced = updateRoundState(state, {
    commandedUnits: [],
    completedPhases: [],
    currentPhaseState: newPhaseState,
    roundNumber: newRoundNumber,
  });

  // The next round, at its first step.
  return advanced;
}
