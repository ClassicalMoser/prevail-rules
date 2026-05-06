import type { Board } from "@entities";
import type { CompleteCleanupPhaseEvent } from "@events";
import type { GameStateForBoard, PlayCardsPhaseState } from "@game";
import { PLAY_CARDS_PHASE } from "@game";

import { updateCurrentRoundNumber, updateRoundState } from "@transforms/pureTransforms";

/**
 * Applies a CompleteCleanupPhaseEvent to the game state.
 * Increments round number and resets to playCards phase (new round).
 *
 * Cleanup phase step is not re-validated here; the event is trusted from the procedure /
 * machine-generated log.
 *
 * @param _event - Present for `applyGameEffectEvent` dispatch; this effect has no payload fields.
 * @param state - The current game state
 * @returns A new game state with the round advanced
 */
export function applyCompleteCleanupPhaseEvent<TBoard extends Board>(
  _event: CompleteCleanupPhaseEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  // Increment round number
  const newRoundNumber = state.currentRoundState.roundNumber + 1;

  // Create the new play cards phase state for the next round
  const newPhaseState: PlayCardsPhaseState = {
    phase: PLAY_CARDS_PHASE,
    step: "chooseCards",
  };

  // Update the round state
  const stateWithRound: GameStateForBoard<TBoard> = updateRoundState(state, {
    roundNumber: newRoundNumber,
    boardType: state.boardState.boardType,
    completedPhases: new Set(),
    currentPhaseState: newPhaseState,
    commandedUnits: new Set(),
    events: [],
  });

  // Update the game state with the new round number
  const finalState = updateCurrentRoundNumber(stateWithRound, newRoundNumber);

  // Return the final state
  return finalState;
}
