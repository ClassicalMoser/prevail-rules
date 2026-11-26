import type { PlayerSide } from '@entities';
import type { GameState } from '@game';
import { defeatCommander, deployCommander } from '@transforms';

/**
 * A game state with one side's commander defeated, for a spec that needs a
 * fallen commander and nothing more. In play a commander is defeated only
 * where it stands, so one not yet placed is placed first, on a corner space
 * away from anything a spec builds, and falls from there.
 *
 * @param state - The game whose commander falls
 * @param side - The side whose commander is lost
 * @returns The state with that commander off the board and lost
 */
export function withLostCommander<S extends GameState>(
  state: S,
  side: PlayerSide,
): S {
  // A commander not yet placed stands somewhere first, so it can fall.
  const standing =
    state.index.commanders[side] === 'reserved'
      ? deployCommander(state, side, 'A-1')
      : state;

  // Defeated: off the board, among the lost, and filed as lost.
  const lost = defeatCommander(standing, side);

  // The game, that side's inspiration ranges now reaching nobody (§4.2.8).
  return lost;
}
