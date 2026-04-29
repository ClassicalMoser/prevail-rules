import type { Board, UnitPlacement } from "@entities";
import type { ResolveRangedAttackEvent } from "@events";
import type { GameStateWithBoard } from "@game";
import { GAME_EFFECT_EVENT_TYPE, RESOLVE_RANGED_ATTACK_EFFECT_TYPE } from "@events";
import {
  applyAttackValue,
  getCurrentUnitStat,
  getLegalRetreats,
  getPositionOfUnit,
  getRangedAttackResolutionState,
  modifiersFromCompletedCommitment,
} from "@queries";

/**
 * Generates a ResolveRangedAttackEvent by calculating the attack value
 * and determining the results (routed, reversed, retreated).
 *
 * Attack value calculation:
 * - Base attack stat
 * - + Support bonuses (from supportingUnits in state)
 * - + Card modifiers (from committed cards)
 * - + Active card modifiers (if unit was commanded)
 *
 * @param state - The current game state
 * @returns A complete ResolveRangedAttackEvent with the defending unit and results
 * @throws Error if not in a valid state for ranged attack resolution
 */
export function generateResolveRangedAttackEvent<TBoard extends Board>(
  state: GameStateWithBoard<TBoard>,
  eventNumber: number,
): ResolveRangedAttackEvent<TBoard, "resolveRangedAttack"> {
  const rangedAttackState = getRangedAttackResolutionState(state);

  // Both commitments must be resolved before calculating attack
  if (rangedAttackState.attackingCommitment.commitmentType === "pending") {
    throw new Error("Attacking commitment is still pending");
  }

  if (rangedAttackState.defendingCommitment.commitmentType === "pending") {
    throw new Error("Defending commitment is still pending");
  }

  // Attack apply state should not exist yet (this procedure creates it)
  if (rangedAttackState.attackApplyState) {
    throw new Error("Attack apply state already exists");
  }

  const attackingUnit = rangedAttackState.attackingUnit;
  const defendingUnit = rangedAttackState.defendingUnit;

  const attackingCommitmentModifiers = modifiersFromCompletedCommitment(
    rangedAttackState.attackingCommitment,
  );

  // Get the base attack value of the attacking unit
  const baseAttackValue = getCurrentUnitStat(
    attackingUnit,
    "attack",
    state,
    attackingCommitmentModifiers,
  );

  // Each supporting unit provides 1 support value. Simple as that.
  const supportValue = rangedAttackState.supportingUnits.size;

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
    boardType: state.boardState.boardType,
    unit: defendingUnit,
    placement,
  };

  let legalRetreatOptions: Set<UnitPlacement<TBoard>>;
  if (attackResult.unitRetreated) {
    legalRetreatOptions = getLegalRetreats(defenderWithPlacement, state);
  } else {
    legalRetreatOptions = new Set();
  }

  return {
    eventType: GAME_EFFECT_EVENT_TYPE,
    effectType: RESOLVE_RANGED_ATTACK_EFFECT_TYPE,
    eventNumber,
    boardType: rangedAttackState.boardType,
    defenderWithPlacement,
    legalRetreatOptions,
    routed: attackResult.unitRouted,
    reversed: attackResult.unitReversed,
    retreated: attackResult.unitRetreated,
  } as unknown as ResolveRangedAttackEvent<TBoard, "resolveRangedAttack">;
}
