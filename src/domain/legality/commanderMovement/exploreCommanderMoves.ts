import type { Coordinate, PlayerSide } from '@entities';
import type { GameState } from '@game';
import { unitFacings } from '@entities';
import {
  diagonalIsClear,
  getBoardSpace,
  findForwardSpace,
  hasEnemyUnit,
  isDiagonalFacing,
} from '@queries';

/**
 * Every space a commander can reach from where it stands, its own included
 * (it may stay put, §4.2.6).
 *
 * A commander moves up to its distance in any direction, a diagonal step
 * counting as one (§4.2.2, §4.2.3). It may pass over and stop on its own
 * units, but never enter a space holding an enemy, engaged spaces included
 * (§4.2.4), and never cross a diagonal enemies block (§4.2.5).
 *
 * The walk goes out a ring at a time: every space one step away, then two,
 * and so on. Each step costs one, and a commander spends nothing else, so the
 * first time the walk reaches a space is by its shortest way there, with the
 * most distance left over. A longer way there could reach nowhere the
 * shorter one cannot, so each space is explored once.
 *
 * @param playerSide - The commander's side, whose enemies bar the way
 * @param startingCoordinate - Where the commander stands
 * @param gameState - The game, for the board
 * @param maxDistance - How many steps it may take
 * @returns Every space it may end on
 */
export function exploreCommanderMoves(
  playerSide: PlayerSide,
  startingCoordinate: Coordinate,
  gameState: GameState,
  maxDistance: number,
): Set<Coordinate> {
  // The field the commander crosses.
  const board = gameState.boardState;

  // Where the commander stands is a legal ending: it may stay put (§4.2.6).
  const legalMoves = new Set<Coordinate>([startingCoordinate]);

  // The spaces first reached on the last step, from which the next step goes
  // out. The walk begins at the commander's own space.
  let ring: Coordinate[] = [startingCoordinate];

  // One ring per step, until the distance is spent or nowhere new is left.
  // Stopping on an empty ring only saves work: a step out from nowhere
  // reaches nothing, so the answer is the same either way.
  for (let step = 0; step < maxDistance && ring.length > 0; step++) {
    const nextRing: Coordinate[] = [];

    for (const from of ring) {
      // A commander has no facing and may go any of the eight ways (§4.2.3).
      for (const direction of unitFacings) {
        // A step off the board leads nowhere.
        const to = findForwardSpace(board, from, direction);
        if (to === undefined) {
          continue;
        }

        // A space already reached was reached by a way no longer than this
        // one, so this way adds nothing.
        // Skipping it changes no answer, only how much is walked: going on
        // from it again would reach only what the shorter way reaches.
        if (legalMoves.has(to)) {
          continue;
        }

        // Enemies standing on both corners of a diagonal block it (§4.2.5).
        if (
          isDiagonalFacing(direction) &&
          !diagonalIsClear(playerSide, board, from, to)
        ) {
          continue;
        }

        // A space holding an enemy, engaged spaces included, is closed to
        // the commander (§4.2.4).
        if (hasEnemyUnit(playerSide, getBoardSpace(board, to))) {
          continue;
        }

        // The commander may end here, and go on from here on the next step.
        legalMoves.add(to);
        nextRing.push(to);
      }
    }

    // The next step goes out from the spaces this one reached.
    ring = nextRing;
  }

  // Every space within reach, the commander's own among them.
  return legalMoves;
}
