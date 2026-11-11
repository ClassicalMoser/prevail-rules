import type { PlayerSide, UnitInstance } from '@entities';
import type { RoutState } from '@game';

/**
 * A rout the moment it opens: units are leaving the battle, their owner owes
 * Morale for them, and how much is not yet worked out (§9.3).
 *
 * The discard count is filled in by `resolveRout`, so it starts `'pending'`,
 * and the owner has not yet chosen the cards.
 *
 * @param player - The player whose units rout, and who pays for them
 * @param unitsToRout - The units leaving the battle
 * @returns The rout substep, open and unpaid
 */
export function createOpenedRoutState(
  player: PlayerSide,
  unitsToRout: UnitInstance[],
): RoutState {
  const routState: RoutState = {
    cardsChosen: false,
    completed: false,
    numberToDiscard: 'pending',
    player,
    substepType: 'rout',
    unitsToRout,
  };
  return routState;
}
