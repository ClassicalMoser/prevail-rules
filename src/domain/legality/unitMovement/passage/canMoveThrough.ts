import type { PlayerSide } from '@entities';
import type { Coordinate } from '@ruleValues';
import type { GameState } from '@game';
import {
  getBoardSpace,
  getCurrentUnitStat,
  hasEngagedUnits,
  hasNoUnit,
  isFriendlyUnit,
} from '@queries';
import { MIN_FLEXIBILITY_THRESHOLD } from '@ruleValues';

/**
 * Determines whether a unit can move through (pass over) a specific coordinate.
 * Requires combined flexibility >= MIN_FLEXIBILITY_THRESHOLD for friendly units.
 *
 * @param unitSide - The side of the unit attempting to move through
 * @param currentUnitFlexibility - The flexibility of the unit attempting to move through
 * @param coordinate - The coordinate to check
 * @param gameState - The current game state
 * @returns True if the unit can pass through this coordinate, false otherwise
 * @throws Error when the coordinate is not on the board: the caller names a
 * space it has already found, so an absent one is a fault, not a refusal
 */
export function canMoveThrough(
  unitSide: PlayerSide,
  currentUnitFlexibility: number,
  coordinate: Coordinate,
  gameState: GameState,
): boolean {
  // Get the board state
  const board = gameState.boardState;
  // Find the board space at the given coordinate.
  const space = getBoardSpace(board, coordinate);
  const spaceUnitPresence = space.unitPresence;

  // If the space has no unit presence, any unit can move through it.
  // Empty spaces are crossed freely (§5.4.1). Terrain will cost something
  // here once it is read; for now it does not (RULEBOOK appendix A3).
  if (hasNoUnit(spaceUnitPresence)) {
    return true;
  }

  // If the space has two units engaged in combat, no unit can move through it.
  // Nothing crosses an engaged space until its fight is settled (§2.2.3,
  // §5.4.4).
  if (hasEngagedUnits(spaceUnitPresence)) {
    return false;
  }

  // An enemy occupant cannot be passed through.
  // Never, whatever either unit's Flexibility (§5.4.3).
  if (!isFriendlyUnit(spaceUnitPresence.unit, unitSide)) {
    return false;
  }
  // A player can only move through their own unit if the combined
  // Flexibility value of the two units equals or exceeds
  // The legal threshold.
  // Both are current values, modifiers included (§5.4.2): the mover's is
  // the one its move was sampled with, passed in; the friend's is read
  // where it stands.
  const currentSpaceUnitFlexibility = getCurrentUnitStat(
    spaceUnitPresence.unit,
    'flexibility',
    gameState,
  );
  const combinedFlexibility =
    currentUnitFlexibility + currentSpaceUnitFlexibility;
  // Two stiff formations cannot interpenetrate.
  if (combinedFlexibility < MIN_FLEXIBILITY_THRESHOLD) {
    return false;
  }

  // Nimble enough between them: the mover filters through its friend.
  return true;
}
