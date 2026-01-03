import type { Board, UnitCount, UnitInstance } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';
import { createUnitInstance } from '@transforms';
import { hasEngagedUnits } from './hasEngagedUnits';
import { hasSingleUnit } from './hasSingleUnit';
import { isSameUnitInstance } from './unitEquivalence';

export function eachUnitPresentOnce(
  whiteArmy: Set<UnitCount>,
  blackArmy: Set<UnitCount>,
  board: Board,
): boolean {
  // Build expected units array (we'll use isSameUnitInstance for equality checks)
  const expectedUnits: UnitInstance[] = [];
  // Unit Instances are 1-indexed for UI purposes
  for (const unitCount of whiteArmy) {
    for (let i = 1; i <= unitCount.count; i++) {
      expectedUnits.push(createUnitInstance('white', unitCount.unitType, i));
    }
  }
  for (const unitCount of blackArmy) {
    for (let i = 1; i <= unitCount.count; i++) {
      expectedUnits.push(createUnitInstance('black', unitCount.unitType, i));
    }
  }

  // Track which expected units we've seen (by index to avoid reference issues)
  const remainingExpectedIndices = new Set(
    expectedUnits.map((_, index) => index),
  );
  const seenOnBoard: UnitInstance[] = [];

  // Helper to find expected unit index by value equality
  const findExpectedUnitIndex = (unit: UnitInstance): number | undefined => {
    return expectedUnits.findIndex((expected) =>
      isSameUnitInstance(expected, unit),
    );
  };

  // Helper to check if unit was already seen
  const hasSeenUnit = (unit: UnitInstance): boolean => {
    return seenOnBoard.some((seen) => isSameUnitInstance(seen, unit));
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
      const expectedIndex = findExpectedUnitIndex(unit);
      if (expectedIndex === undefined || expectedIndex === -1) {
        // Unexpected unit on board
        return false;
      }
      seenOnBoard.push(unit);
      remainingExpectedIndices.delete(expectedIndex);
    } else if (hasEngagedUnits(space.unitPresence)) {
      const primaryUnit = space.unitPresence.primaryUnit;
      const secondaryUnit = space.unitPresence.secondaryUnit;
      if (hasSeenUnit(primaryUnit) || hasSeenUnit(secondaryUnit)) {
        // Unit is present more than once
        return false;
      }
      const primaryIndex = findExpectedUnitIndex(primaryUnit);
      const secondaryIndex = findExpectedUnitIndex(secondaryUnit);
      if (
        primaryIndex === undefined ||
        primaryIndex === -1 ||
        secondaryIndex === undefined ||
        secondaryIndex === -1
      ) {
        // Unexpected unit on board
        return false;
      }
      seenOnBoard.push(primaryUnit);
      seenOnBoard.push(secondaryUnit);
      remainingExpectedIndices.delete(primaryIndex);
      remainingExpectedIndices.delete(secondaryIndex);
    }
  }

  // If remainingExpectedIndices is empty, all expected units were found
  return remainingExpectedIndices.size === 0;
}
