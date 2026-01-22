import type {
  Board,
  GameState,
  MeleeResolutionState,
  ResolveMeleePhaseState,
} from '@entities';
import type { ChooseMeleeResolutionEvent } from '@events';
import { hasEngagedUnits } from '@entities';
import { getBoardSpace } from '@queries';

/** Applies the choose melee resolution event to the game state. */
export function applyChooseMeleeEvent<TBoard extends Board>(
  event: ChooseMeleeResolutionEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const { space } = event;
  const currentPhaseState = state.currentRoundState.currentPhaseState;
  if (!currentPhaseState) {
    throw new Error('No current phase state found');
  }
  if (currentPhaseState.phase !== 'resolveMelee') {
    throw new Error('Not in resolve melee phase');
  }
  const remainingEngagements = currentPhaseState.remainingEngagements;
  if (!remainingEngagements.has(space)) {
    throw new Error('Space is not a remaining engagement');
  }
  const board = state.boardState;
  const spaceState = getBoardSpace(board, space);
  if (!hasEngagedUnits(spaceState.unitPresence)) {
    throw new Error('Space does not have engaged units');
  }

  // Update the remaining engagements with the space removed
  const newRemainingEngagementsArray = Array.from(remainingEngagements);
  const newRemainingEngagements = new Set(
    newRemainingEngagementsArray.filter((s) => s !== space),
  );

  // Create a new melee resolution state for the space chosen
  const newCurrentMeleeResolutionState: MeleeResolutionState<TBoard> = {
    substepType: 'meleeResolution',
    whiteUnit: spaceState.unitPresence.primaryUnit,
    blackUnit: spaceState.unitPresence.secondaryUnit,
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
    currentMeleeResolutionState: newCurrentMeleeResolutionState,
  };
  // Update the game state with the new phase state
  const newGameState: GameState<TBoard> = {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
  // Return the new game state
  return newGameState;
}
