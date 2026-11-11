import type { GameState, RoutState } from '@game';
import { getOtherPlayer } from '@queries/player';
import { findRoutState } from './findRoutState';
import { isAwaitingRoutDiscard } from './isAwaitingRoutDiscard';

/**
 * The rout waiting on its owner's discard, whichever player owes it.
 *
 * A rout belongs to one player, and a melee holds one per side, so both sides
 * are asked after, the initiative player's first. That order decides nothing:
 * the sequencer owns the order of routs (the second player's unit first,
 * §7.5.6) and opens them one at a time, so at most one is ever owed.
 *
 * The question is asked together with the walk rather than after it: a side
 * whose rout is already paid for still has that rout on its apply, so a walk
 * that answered with the first rout it found would answer about the wrong
 * player while the other side still owed cards.
 *
 * @param state - The game state
 * @returns The rout owing a discard, or `undefined` when none is
 */
export function findRoutOwingDiscard(state: GameState): RoutState | undefined {
  const firstPlayer = state.currentInitiative;
  for (const player of [firstPlayer, getOtherPlayer(firstPlayer)]) {
    const routState = findRoutState(state, player);
    if (routState !== undefined && isAwaitingRoutDiscard(routState)) {
      return routState;
    }
  }
  return undefined;
}
