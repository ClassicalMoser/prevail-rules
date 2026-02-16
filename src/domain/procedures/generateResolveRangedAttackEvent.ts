import type {
  Board,
  CompletedCommitment,
  GameState,
  Modifier,
  UnitPlacement,
} from '@entities';
import type { ResolveRangedAttackEvent } from '@events';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
} from '@events';
import {
  applyAttackValue,
  getCurrentUnitStat,
  getLegalRetreats,
  getPositionOfUnit,
  getRangedAttackResolutionState,
} from '@queries';

/**
 * Generates a ResolveRangedAttackEvent by calculating the attack value
 * and determining the results (routed, reversed, retreated).
 * Also includes unit placement and legal retreat options in the event.
 *
 * Attack value calculation:
 * - Base attack stat
 * - + Support bonuses (from supportingUnits in state)
 * - + Card modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 *
 * @param state - The current game state
 * @returns A complete ResolveRangedAttackEvent with the defending unit, position, results, and retreat options
 * @throws Error if not in a valid state for ranged attack resolution
 */
export function generateResolveRangedAttackEvent<TBoard extends Board>(
  state: GameState<TBoard>,
): ResolveRangedAttackEvent<TBoard, 'resolveRangedAttack'> {
  const rangedAttackState = getRangedAttackResolutionState(state);

  // Both commitments must be resolved before calculating attack
  if (rangedAttackState.attackingCommitment.commitmentType === 'pending') {
    throw new Error('Attacking commitment is still pending');
  }

  if (rangedAttackState.defendingCommitment.commitmentType === 'pending') {
    throw new Error('Defending commitment is still pending');
  }

  // Attack apply state should not exist yet (this procedure creates it)
  if (rangedAttackState.attackApplyState) {
    throw new Error('Attack apply state already exists');
  }

  const attackingUnit = rangedAttackState.attackingUnit;
  const defendingUnit = rangedAttackState.defendingUnit;

  const attackingCommitment: CompletedCommitment | undefined =
    rangedAttackState.attackingCommitment.commitmentType === 'completed'
      ? rangedAttackState.attackingCommitment
      : undefined;
  const attackingCommitmentModifiers: Modifier[] | undefined =
    attackingCommitment ? attackingCommitment.card.modifiers : undefined;

  // Get the base attack value of the attacking unit
  const baseAttackValue = getCurrentUnitStat(
    attackingUnit,
    'attack',
    state,
    attackingCommitmentModifiers,
  );

  // Each supporting unit provides 1 support value. Simple as that.
  const supportValue = rangedAttackState.supportingUnits.size;

  // Add the base attack value and the support value to get the total attack value
  const totalAttackValue = baseAttackValue + supportValue;

  // Get the defending commitment modifiers
  const defendingCommitment: CompletedCommitment | undefined =
    rangedAttackState.defendingCommitment.commitmentType === 'completed'
      ? rangedAttackState.defendingCommitment
      : undefined;
  const defendingCommitmentModifiers: Modifier[] | undefined =
    defendingCommitment ? defendingCommitment.card.modifiers : undefined;

  // Apply attack value to determine results.
  // Defensive commitment modifiers are applied to the defending unit.
  const attackResult = applyAttackValue(
    state,
    totalAttackValue,
    defendingUnit,
    defendingCommitmentModifiers,
  );

  // Get the unit's current position from the board
  const placement = getPositionOfUnit(state.boardState, defendingUnit);
  const unitWithPlacement = { unit: defendingUnit, placement };

  // Compute legal retreats if retreating
  const legalRetreats: Set<UnitPlacement<Board>> = attackResult.unitRetreated
    ? (getLegalRetreats(unitWithPlacement, state) as Set<UnitPlacement<Board>>)
    : new Set();

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
    unitInstance: defendingUnit,
    unitPlacement: placement,
    routed: attackResult.unitRouted,
    reversed: attackResult.unitReversed,
    retreated: attackResult.unitRetreated,
    legalRetreats,
  };
}
