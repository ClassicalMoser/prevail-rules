import type {
  Board,
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
} from '@entities';
import type { PerformRangedAttackEvent } from '@events';
import { getIssueCommandsPhaseState } from '@queries';
import { isSameUnitInstance } from '@validation';

/**
 * Applies a PerformRangedAttackEvent to the game state.
 * Creates the initial ranged attack resolution state with pending commitments.
 *
 * @param event - The perform ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the ranged attack resolution state created
 */
export function applyPerformRangedAttackEvent<TBoard extends Board>(
  event: PerformRangedAttackEvent<TBoard>,
  state: GameState<TBoard>,
): GameState<TBoard> {
  const currentPhaseState = getIssueCommandsPhaseState(state);

  const attackingPlayer = event.player;
  const attackingUnit = event.unit.unit;
  const defendingUnit = event.targetUnit.unit;
  const supportingUnits = new Set(
    Array.from(event.supportingUnits).map((uwp) => uwp.unit),
  );

  // Determine which step we're in and which remaining units set to use
  const isFirstPlayer = attackingPlayer === state.currentInitiative;
  const isResolveStep =
    currentPhaseState.step === 'firstPlayerResolveCommands' ||
    currentPhaseState.step === 'secondPlayerResolveCommands';

  if (!isResolveStep) {
    throw new Error(`Wrong player for step ${currentPhaseState.step}`);
  }

  // Create the ranged attack resolution state
  // attackApplyState will be created by resolveRangedAttack after commitments are resolved
  const rangedAttackResolutionState: RangedAttackResolutionState<TBoard> = {
    substepType: 'commandResolution',
    commandResolutionType: 'rangedAttack',
    attackingUnit,
    defendingUnit,
    supportingUnits,
    attackingCommitment: {
      commitmentType: 'pending',
    },
    defendingCommitment: {
      commitmentType: 'pending',
    },
    attackApplyState: undefined,
    completed: false,
  };

  // Get the remaining units set
  const remainingUnits = isFirstPlayer
    ? currentPhaseState.remainingUnitsFirstPlayer
    : currentPhaseState.remainingUnitsSecondPlayer;

  // Remove the participating units from remaining units
  // Use isSameUnitInstance for value equality, not reference equality
  const newRemainingUnits = new Set(
    Array.from(remainingUnits).filter((unit) => {
      // Keep units that are not the attacking unit
      if (isSameUnitInstance(unit, attackingUnit).result) {
        return false;
      }
      // Keep units that are not supporting units
      for (const supportingUnit of supportingUnits) {
        if (isSameUnitInstance(unit, supportingUnit).result) {
          return false;
        }
      }
      return true;
    }),
  );

  // Update the phase state
  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...currentPhaseState,
    currentCommandResolutionState: rangedAttackResolutionState,
    ...(isFirstPlayer
      ? { remainingUnitsFirstPlayer: newRemainingUnits }
      : { remainingUnitsSecondPlayer: newRemainingUnits }),
  };

  return {
    ...state,
    currentRoundState: {
      ...state.currentRoundState,
      currentPhaseState: newPhaseState,
    },
  };
}
