import type { PlayerSide, UnitCount, UnitInstance } from '@entities';
import { createUnitInstance } from './createUnitInstance';

/**
 * Every unit an army brings, each its own piece: the army lists unit types
 * with a count of each, and each copy of a type is numbered from 1 within
 * it. A new game puts these in reserve; a check of a game record looks for
 * each of them.
 *
 * @param playerSide - The side the army fights for
 * @param unitCounts - The unit types it brings, with how many of each
 * @returns One instance per piece, in the order the army lists its types
 */
export function createArmyUnits(
  playerSide: PlayerSide,
  unitCounts: Iterable<UnitCount>,
): UnitInstance[] {
  const pieces: UnitInstance[] = [];

  // Each entry is one unit type, with how many of it the army brings.
  for (const { count, unitType } of unitCounts) {
    // Every one of those is its own piece on the table, numbered from 1
    // within its type.
    for (let instanceNumber = 1; instanceNumber <= count; instanceNumber++) {
      pieces.push(createUnitInstance(playerSide, unitType, instanceNumber));
    }
  }

  // Every piece the army brought.
  return pieces;
}
