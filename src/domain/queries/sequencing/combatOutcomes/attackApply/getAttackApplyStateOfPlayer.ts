import type { PlayerSide } from '@entities';
import type { AttackApplyState, GameState } from '@game';
import { getCurrentPhaseState } from '@queries/sequencing/phases/getCurrentPhaseState';
import { getMeleeAttackApplyState } from './getMeleeAttackApplyState';
import { getRangedAttackApplyState } from './getRangedAttackApplyState';

/**
 * The attack apply holding this player's unit, in whichever attack is being
 * resolved: the one ranged attack's, or, in a melee, the one on that player's
 * side.
 *
 * This is the reading for a caller that knows the player and not the kind of
 * attack, as the writers of a retreat, a reverse and a rout do; an event that
 * names its context uses `getAttackApplyStateAt`.
 *
 * @param state - The game state, resolving an attack
 * @param player - The player whose unit the apply is about
 * @returns That player's attack apply
 * @throws Error outside the issue commands and resolve melee phases, or when
 * the attack has not opened its apply
 */
export function getAttackApplyStateOfPlayer(
  state: GameState,
  player: PlayerSide,
): AttackApplyState {
  const phaseState = getCurrentPhaseState(state);

  // A ranged attack has one apply, whoever its target is.
  if (phaseState.phase === 'issueCommands') {
    const rangedApply = getRangedAttackApplyState(state);
    return rangedApply;
  }

  // A melee has one on each side.
  if (phaseState.phase === 'resolveMelee') {
    const meleeApply = getMeleeAttackApplyState(state, player);
    return meleeApply;
  }

  throw new Error(
    `Attack apply state not available in phase: ${phaseState.phase}`,
  );
}
