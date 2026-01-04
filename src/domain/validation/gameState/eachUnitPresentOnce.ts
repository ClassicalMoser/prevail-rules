import type { Board, UnitCount, UnitInstance } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';
import { createUnitInstance } from '@transforms';
import { isSameUnitInstance } from '@validation/unitEquivalence';
import { hasEngagedUnits, hasSingleUnit } from '@validation/unitPresence';

export function eachUnitPresentOnce(
  whiteArmy: Set<UnitCount>,
  blackArmy: Set<UnitCount>,
  board: Board,
  routedUnits: Set<UnitInstance>,
): boolean {
  // Build expected units set (we'll use isSameUnitInstance for equality checks)
  const expectedUnits = new Set<UnitInstance>();
  // Unit Instances are 1-indexed for UI purposes
  for (const unitCount of whiteArmy) {
    for (let i = 1; i <= unitCount.count; i++) {
      expectedUnits.add(createUnitInstance('white', unitCount.unitType, i));
    }
  }
  for (const unitCount of blackArmy) {
    for (let i = 1; i <= unitCount.count; i++) {
      expectedUnits.add(createUnitInstance('black', unitCount.unitType, i));
    }
  }

  const seenInGame: UnitInstance[] = [];

  // Helper to find and remove expected unit by value equality
  // Since Sets use referential equality, we need to find the matching unit first
  const removeExpectedUnit = (unit: UnitInstance): boolean => {
    for (const expected of expectedUnits) {
      if (isSameUnitInstance(expected, unit)) {
        expectedUnits.delete(expected);
        return true;
      }
    }
    return false;
  };

  // Helper to check if unit was already seen
  const hasSeenUnit = (unit: UnitInstance): boolean => {
    return seenInGame.some((seen) => isSameUnitInstance(seen, unit));
  };

  // Single pass through board: check duplicates and validate against expected
  const boardCoordinates = getBoardCoordinates(board);
  for (const coordinate of boardCoordinates) {
    const space = getBoardSpace(board, coordinate);
    if (hasSingleUnit(space.unitPresence)) {
      const unit = space.unitPresence.unit;
      if (hasSeenUnit(unit)) {
        // Unit is present more than once
        return false;
      }
      if (!removeExpectedUnit(unit)) {
        // Unexpected unit on board
        return false;
      }
      seenInGame.push(unit);
    } else if (hasEngagedUnits(space.unitPresence)) {
      const primaryUnit = space.unitPresence.primaryUnit;
      const secondaryUnit = space.unitPresence.secondaryUnit;
      if (hasSeenUnit(primaryUnit) || hasSeenUnit(secondaryUnit)) {
        // Unit is present more than once
        return false;
      }
      if (
        !removeExpectedUnit(primaryUnit) ||
        !removeExpectedUnit(secondaryUnit)
      ) {
        // Unexpected unit on board
        return false;
      }
      seenInGame.push(primaryUnit);
      seenInGame.push(secondaryUnit);
    }
  }

  // Check for routed units
  for (const unit of routedUnits) {
    if (!removeExpectedUnit(unit)) {
      // Unexpected routed unit
      return false;
    }
    seenInGame.push(unit);
  }

  // If expectedUnits is empty, all expected units were found and no routed units were unexpected
  return expectedUnits.size === 0;
}
