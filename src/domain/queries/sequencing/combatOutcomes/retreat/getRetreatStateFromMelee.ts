import type { GameState, RetreatState } from '@game';
import { throwIfBypassed } from '@utils';
import { getAttackApplyStateFromMelee } from '../attackApply/getAttackApplyStateFromMelee';
import { getRetreatStateFromAttackApply } from './getRetreatStateFromAttackApply';

/**
 * Gets the retreat state from melee resolution for a specific player.
 * Navigates: MeleeResolutionState -> AttackApplyState -> RetreatState
 *
 * @param state - The game state
 * @param player - The player ('white' or 'black')
 * @returns The retreat state
 * @throws Error when there is no melee apply for that player, or when the
 * attack applied no retreat to it
 */
export function getRetreatStateFromMelee(
  state: GameState,
  player: 'white' | 'black',
): RetreatState {
  const attackApplyState = getAttackApplyStateFromMelee(state, player);
  // An attack that applied no retreat answers `'bypassed'`. That is a fact
  // about the attack, not a retreat this getter can hand back.
  const retreatState = throwIfBypassed(
    getRetreatStateFromAttackApply(attackApplyState),
    `The melee attack on ${player} applied no retreat`,
  );
  return retreatState;
}
