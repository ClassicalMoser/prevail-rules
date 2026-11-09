import type { PerformRangedAttackEvent } from '@events';
import type {
  GameState,
  IssueCommandsPhaseState,
  RangedAttackResolutionState,
} from '@game';

import {
  getIssueCommandsPhaseState,
  getRangedAttackResolutionState,
  isSameUnitInstance,
} from '@queries';
import { updatePhaseState } from '@transforms/pureTransforms';

/**
 * Applies a PerformRangedAttackEvent: the target and supporters are written
 * into the shot its `chooseFiringUnit` opened (§4.3.11 steps 3–4). The
 * supporters leave the attacker's remaining units, since naming one spends
 * its shot (§7.3.4); the shooter already left when it was named. The target
 * leaves its own side's remaining units.
 *
 * Event is assumed pre-validated (a legal target for the shooter, and
 * supporters that could each make the shot).
 *
 * @param event - The perform ranged attack event to apply
 * @param state - The current game state
 * @returns A new game state with the shot aimed
 */
export function applyPerformRangedAttackEvent<S extends GameState>(
  event: PerformRangedAttackEvent,
  state: S,
): S {
  const currentPhaseState = getIssueCommandsPhaseState(state);
  const shot = getRangedAttackResolutionState(state);
  const attackingPlayer = event.player;
  const defendingUnit = event.targetUnit.unit;
  const supportingUnits = event.supportingUnits.map((uwp) => uwp.unit);

  const isFirstPlayer = attackingPlayer === state.currentInitiative;
  const remainingAttacker = isFirstPlayer
    ? currentPhaseState.remainingUnitsFirstPlayer
    : currentPhaseState.remainingUnitsSecondPlayer;
  const remainingDefender = isFirstPlayer
    ? currentPhaseState.remainingUnitsSecondPlayer
    : currentPhaseState.remainingUnitsFirstPlayer;

  // Each supporter has spent its own shot on this one (§7.3.4).
  const newRemainingAttacker = remainingAttacker.filter(
    (unit) =>
      !supportingUnits.some(
        (supporter) => isSameUnitInstance(unit, supporter).result,
      ),
  );

  // Remove defending unit from defender's remaining
  const newRemainingDefender = remainingDefender.filter(
    (unit) => !isSameUnitInstance(unit, defendingUnit).result,
  );

  // The shot now knows what it is aimed at; the target's commitment is next.
  const aimed: RangedAttackResolutionState = {
    ...shot,
    defendingUnit,
    supportingUnits,
  };

  const newPhaseState: IssueCommandsPhaseState = {
    ...currentPhaseState,
    currentCommandResolutionState: aimed,
    remainingUnitsFirstPlayer: isFirstPlayer
      ? newRemainingAttacker
      : newRemainingDefender,
    remainingUnitsSecondPlayer: isFirstPlayer
      ? newRemainingDefender
      : newRemainingAttacker,
  };

  const newGameState = updatePhaseState(state, newPhaseState);
  return newGameState;
}
