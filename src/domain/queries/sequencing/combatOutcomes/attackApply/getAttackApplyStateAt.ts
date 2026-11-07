import type { PlayerSide } from '@entities';
import type { AttackApplyState, GameState } from '@game';
import type { MELEE_ATTACK_RESOLUTION_CONTEXT } from '@events';
import { RANGED_ATTACK_RESOLUTION_CONTEXT } from '@events';
import { getMeleeAttackApplyState } from './getMeleeAttackApplyState';
import { getRangedAttackApplyState } from './getRangedAttackApplyState';

/**
 * Where an attack apply sits. A ranged attack has one; a melee has one per side,
 * so that branch names the side.
 *
 * The events that open and resolve an outcome carry this on themselves, which is
 * how a transform says which apply it means without reading the phase.
 */
export type AttackApplyLocation =
  | { attackResolutionContext: typeof RANGED_ATTACK_RESOLUTION_CONTEXT }
  | {
      attackResolutionContext: typeof MELEE_ATTACK_RESOLUTION_CONTEXT;
      defendingPlayer: PlayerSide;
    };

/**
 * The attack apply a resolution context names.
 *
 * An event that acts on an outcome carries the context it belongs to, so the
 * descent follows from the event rather than from the phase. Naming it here
 * keeps that mapping in one place.
 *
 * @param state - The game state
 * @param location - The context the event names, and the side when it is a melee
 * @returns The attack apply at that location
 * @throws Error when that resolution has not opened its apply
 */
export function getAttackApplyStateAt(
  state: GameState,
  location: AttackApplyLocation,
): AttackApplyState {
  if (location.attackResolutionContext === RANGED_ATTACK_RESOLUTION_CONTEXT) {
    const rangedApply = getRangedAttackApplyState(state);
    return rangedApply;
  }
  const meleeApply = getMeleeAttackApplyState(state, location.defendingPlayer);
  return meleeApply;
}
