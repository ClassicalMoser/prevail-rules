import type { PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import { getBoardSpace } from '@queries';
import { COMMANDER_MOVE_DISTANCE } from '@ruleValues';
import { exploreCommanderMoves } from './exploreCommanderMoves';

/**
 * Every space a side's commander may end its Phase 2 move on (§4.2): up to
 * four spaces, diagonals counting as one, never into a space holding an
 * enemy or across a diagonal two enemies block, and staying put among them.
 * The move commander offer (`getLegalPlayerChoiceOptions`) lists these, and
 * `isValidMoveCommanderEvent` checks a chosen destination against them.
 *
 * TODO(composition): both callers read `startingPosition` from
 * `getCommanderSpace` just before asking, so the parameter and the guard
 * below only re-check what the caller read, and the guard reads the board
 * where `getCommanderSpace` reads the index. Settle whether this should read
 * the commander's space itself and drop the parameter.
 *
 * @param playerSide - The side whose commander moves
 * @param gameState - The game, for the board
 * @param startingPosition - Where that commander stands
 * @returns Every space it may end on, its own included
 * @throws When that side's commander does not stand at `startingPosition`
 */
export function getLegalCommanderMoves(
  playerSide: PlayerSide,
  gameState: GameState,
  startingPosition: Coordinate,
): Set<Coordinate> {
  // Get the maximum distance a commander can move
  // A commander moves up to four spaces (§4.2.2).
  const maxDistance = COMMANDER_MOVE_DISTANCE;

  // Before exploring, ensure the starting position contains the player's commander
  // Get the board state
  const board = gameState.boardState;
  // Get the space at the starting position
  const space = getBoardSpace(board, startingPosition);
  // Get the commander
  // A move starts where the side's own commander stands; asked from anywhere
  // else, the caller has the wrong space, and there is no move to offer.
  const containsCommander = space.commanders.includes(playerSide);
  if (!containsCommander) {
    throw new Error('Starting position does not contain specified commander');
  }

  // Get the legal moves by exploring reachable spaces
  const legalMoves = exploreCommanderMoves(
    playerSide,
    startingPosition,
    gameState,
    maxDistance,
  );

  // Get the set of final legal positions
  // Every space the commander may end on; the caller lists or checks them.
  return legalMoves;
}
