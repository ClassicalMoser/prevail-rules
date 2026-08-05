import type { Board } from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import type {
  GameStateForBoard,
  MeleeResolutionState,
  ResolveMeleePhaseState,
} from '@game';
import { getResolveMeleePhaseStateForBoard } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/** Applies the choose melee resolution event to the game state.
 * Active player chooses a space with engaged units to resolve the melee.
 *
 * @param event - The choose melee resolution event to apply
 * @param state - The current game state
 * @returns A new game state with the melee resolution updated
 */
export function applyChooseMeleeEvent<TBoard extends Board>(
  event: ChooseMeleeResolutionEvent,
  state: GameStateForBoard<TBoard>,
): GameStateForBoard<TBoard> {
  const { space } = event;
  const currentPhaseState = getResolveMeleePhaseStateForBoard(state);

  // Update the remaining engagements with the space removed
  const newRemainingEngagements = new Set(
    [...currentPhaseState.remainingEngagements].filter((s) => s !== space),
  );

  // Create a new melee resolution state for the space chosen
  const newMeleeResolutionState: MeleeResolutionState = {
    blackAttackApplyState: 'pending',
    blackCommitment: { commitmentType: 'pending' as const },
    completed: false,
    location: space,
    substepType: 'meleeResolution' as const,
    whiteAttackApplyState: 'pending',
    whiteCommitment: { commitmentType: 'pending' as const },
  };

  // Update the phase state with the two new values
  const newPhaseState: ResolveMeleePhaseState = {
    ...currentPhaseState,
    currentMeleeResolutionState: newMeleeResolutionState,
    remainingEngagements: [...newRemainingEngagements],
  };

  // Return the new game state
  const newGameState = updatePhaseState(state, newPhaseState);
  return newGameState;
}
