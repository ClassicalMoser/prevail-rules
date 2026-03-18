import type {
  Board,
  GameState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { getResolveMeleePhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/** Applies the choose melee resolution event to the game state.
 * Active player chooses a space with engaged units to resolve the melee.
 *
 * @param event - The choose melee resolution event to apply
 * @param state - The current game state
 * @returns A new game state with the melee resolution updated
 */
export function applyChooseMeleeEvent<TBoard extends Board>(
  event: ChooseMeleeResolutionEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { space } = event;
  const currentPhaseState = getResolveMeleePhaseState(state);

  // Update the remaining engagements with the space removed
  const newRemainingEngagements = new Set(
    [...currentPhaseState.remainingEngagements].filter((s) => s !== space),
  );

  // Create a new melee resolution state for the space chosen
  const newMeleeResolutionState: MeleeResolutionState<TBoard> = {
    substepType: 'meleeResolution',
    location: space,
    whiteCommitment: { commitmentType: 'pending' },
    blackCommitment: { commitmentType: 'pending' },
    whiteAttackApplyState: undefined,
    blackAttackApplyState: undefined,
    completed: false,
  };

  // Update the phase state with the two new values
  const newPhaseState: ResolveMeleePhaseState<TBoard> = {
    ...currentPhaseState,
    remainingEngagements: newRemainingEngagements,
    currentMeleeResolutionState: newMeleeResolutionState,
  };

  // Return the new game state
  const newGameState = updatePhaseState(state, newPhaseState);
  return newGameState;
}
