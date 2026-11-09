import type { GameState } from '@game';
import {
  GAME_EFFECT_EVENT_TYPE,
  RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
} from '@events';
import type { ResolveRangedAttackEvent } from '@events';
import { throwIfPending } from '@utils';
import {
  applyAttackValue,
  getCurrentUnitStat,
  getPositionOfUnit,
  getRangedAttackResolutionState,
  modifiersFromCompletedCommitment,
} from '@queries';
/**
 * Generates a ResolveRangedAttackEvent by calculating the attack value
 * and determining the results (routed, reversed, retreated).
 *
 * Attack value calculation:
 * - Base attack stat
 * - + Support bonuses (from supportingUnits in state)
 * - + CommandCard modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 *
 * @param state - The current game state
 * @returns A complete ResolveRangedAttackEvent with the defending unit and results
 * @throws Error if not in a valid state for ranged attack resolution
 */
export function generateResolveRangedAttackEvent(
  state: GameState,
  eventNumber: number,
): ResolveRangedAttackEvent {
  const rangedAttackState = getRangedAttackResolutionState(state);

  // Both commitments must be resolved before calculating attack
  if (rangedAttackState.attackingCommitment.commitmentType === 'pending') {
    throw new Error('Attacking commitment is still pending');
  }

  if (rangedAttackState.defendingCommitment.commitmentType === 'pending') {
    throw new Error('Defending commitment is still pending');
  }

  // Attack apply state should not exist yet (this procedure creates it)
  if (rangedAttackState.attackApplyState !== 'pending') {
    throw new Error('Attack apply state already exists');
  }

  const { attackingUnit } = rangedAttackState;
  // The target and supporters are named before the target's owner commits
  // (§4.3.11 steps 3–5), and that commitment is complete, so they are
  // written by now.
  const defendingUnit = throwIfPending(
    rangedAttackState.defendingUnit,
    'The target of the shot has not been named',
  );
  const supportingUnits = throwIfPending(
    rangedAttackState.supportingUnits,
    'The supporters of the shot have not been named',
  );

  const attackingCommitmentModifiers = modifiersFromCompletedCommitment(
    rangedAttackState.attackingCommitment,
  );

  // Get the base attack value of the attacking unit
  const baseAttackValue = getCurrentUnitStat(
    attackingUnit,
    'attack',
    state,
    attackingCommitmentModifiers,
  );

  // Each supporting unit provides 1 support value. Simple as that.
  const supportValue = supportingUnits.length;

  // Add the base attack value and the support value to get the total attack value
  const totalAttackValue = baseAttackValue + supportValue;

  const defendingCommitmentModifiers = modifiersFromCompletedCommitment(
    rangedAttackState.defendingCommitment,
  );

  // Apply attack value to determine results.
  // Defensive commitment modifiers are applied to the defending unit.
  const attackResult = applyAttackValue(
    state,
    totalAttackValue,
    defendingUnit,
    defendingCommitmentModifiers,
  );

  const placement = getPositionOfUnit(state.boardState, defendingUnit);
  const defenderWithPlacement = {
    placement,
    unit: defendingUnit,
  };

  // Legal retreat hexes are computed when the retreat opens, not on this event.
  return {
    defenderWithPlacement,
    effectType: RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
    eventNumber,
    eventType: GAME_EFFECT_EVENT_TYPE,
    retreated: attackResult.unitRetreated,
    reversed: attackResult.unitReversed,
    routed: attackResult.unitRouted,
  };
}
