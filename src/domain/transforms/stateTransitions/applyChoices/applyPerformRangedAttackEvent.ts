import type { Board } from '@entities';
import type { PerformRangedAttackEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  PhaseState,
  RangedAttackResolutionState,
} from '@game';
import { getIssueCommandsPhaseState } from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';
import { isSameUnitInstance } from '@validation';

/**
 * Applies a PerformRangedAttackEvent to the game state.
 * Creates the ranged attack resolution state with pending commitments. Removes
 * attacking/supporting units from the attacker's remaining units and the defending
 * unit from the defender's remaining units.
 * Event is assumed pre-validated (issueCommands phase, resolve step, attacker matches step).
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
  // Convert the supporting units to an array for iteration
  const supportingUnitsArray = [...event.supportingUnits];
  const supportingUnits = new Set(supportingUnitsArray.map((uwp) => uwp.unit));

  const isFirstPlayer = attackingPlayer === state.currentInitiative;
  const remainingAttacker = isFirstPlayer
    ? currentPhaseState.remainingUnitsFirstPlayer
    : currentPhaseState.remainingUnitsSecondPlayer;
  const remainingDefender = isFirstPlayer
    ? currentPhaseState.remainingUnitsSecondPlayer
    : currentPhaseState.remainingUnitsFirstPlayer;

  // Remove attacking and supporting units from attacker's remaining (value equality via isSameUnitInstance)
  const newRemainingAttacker = new Set(
    [...remainingAttacker].filter((unit) => {
      if (isSameUnitInstance(unit, attackingUnit).result) return false;
      for (const supportingUnit of supportingUnits) {
        if (isSameUnitInstance(unit, supportingUnit).result) return false;
      }
      return true;
    }),
  );

  // Remove defending unit from defender's remaining
  const newRemainingDefender = new Set(
    [...remainingDefender].filter(
      (unit) => !isSameUnitInstance(unit, defendingUnit).result,
    ),
  );

  const rangedAttackResolutionState = {
    substepType: 'commandResolution' as const,
    commandResolutionType: 'rangedAttack' as const,
    boardType: state.boardState.boardType,
    attackingUnit,
    defendingUnit,
    supportingUnits,
    attackingCommitment: { commitmentType: 'pending' },
    defendingCommitment: { commitmentType: 'pending' },
    attackApplyState: undefined,
    completed: false,
  } as RangedAttackResolutionState;

  const newPhaseState: IssueCommandsPhaseState<TBoard> = {
    ...currentPhaseState,
    currentCommandResolutionState: rangedAttackResolutionState,
    remainingUnitsFirstPlayer: isFirstPlayer
      ? newRemainingAttacker
      : newRemainingDefender,
    remainingUnitsSecondPlayer: isFirstPlayer
      ? newRemainingDefender
      : newRemainingAttacker,
  };

  const newGameState = updatePhaseState(
    state,
    newPhaseState as PhaseState<TBoard>,
  );
  return newGameState;
}
