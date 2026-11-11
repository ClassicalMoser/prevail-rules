import type { PerformRangedAttackEvent } from '@events';
import type { GameState, RangedAttackResolutionState } from '@game';

import {
  getRangedAttackResolutionState,
  getUnitWithPlacementOnBoard,
  getRemainingUnitsForPlayer,
  hasUnitInArray,
} from '@queries';
import {
  updateCommandResolutionState,
  updateRemainingUnitsForPlayer,
} from '@transforms/pureTransforms';

/**
 * Applies a PerformRangedAttackEvent: the target and supporters are written
 * into the shot its `chooseShooter` opened (§4.3.11 steps 3–4). The
 * supporters leave the attacker's remaining units, since naming one spends
 * its shot (§7.3.4); the shooter already left when it was named. The
 * target's side is untouched: being shot at costs a unit nothing but the
 * shot's result.
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
  const shot = getRangedAttackResolutionState(state);
  const attackingPlayer = event.player;
  // The event names the target and the supporters by who they are; the units
  // that are shot at and that support the shot, with the stats they carry, are
  // the ones the board holds.
  const defendingUnit = getUnitWithPlacementOnBoard(
    state.boardState,
    event.targetUnit.unit,
  ).unit;
  const supportingUnits = event.supportingUnits.map(
    (named) => getUnitWithPlacementOnBoard(state.boardState, named.unit).unit,
  );

  // The shooter's side is the one acting on this order.
  const remainingAttacker = getRemainingUnitsForPlayer(state, attackingPlayer);

  // Each supporter has spent its own shot on this one (§7.3.4).
  const newRemainingAttacker = remainingAttacker.filter(
    (unit) => !hasUnitInArray(supportingUnits, unit),
  );

  // The shot now knows what it is aimed at; the target's commitment is next.
  const aimed: RangedAttackResolutionState = {
    ...shot,
    defendingUnit,
    supportingUnits,
  };

  const newGameState = updateCommandResolutionState(
    updateRemainingUnitsForPlayer(state, attackingPlayer, newRemainingAttacker),
    aimed,
  );
  return newGameState;
}
