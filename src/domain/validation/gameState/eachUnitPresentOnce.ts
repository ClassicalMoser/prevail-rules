import type {
  Board,
  UnitCount,
  UnitInstance,
  ValidationResult,
} from '@entities';
import { hasEngagedUnits, hasSingleUnit } from '@entities';
import { getBoardCoordinates, getBoardSpace } from '@queries';
import { createUnitInstance } from '@transforms';
import { isSameUnitInstance } from '@validation/unitEquivalence';

export function eachUnitPresentOnce(
  whiteArmy: Set<UnitCount>,
  blackArmy: Set<UnitCount>,
  board: Board,
  routedUnits: Set<UnitInstance>,
): ValidationResult {
  try {
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
    const removeExpectedUnit = (unit: UnitInstance): ValidationResult => {
      for (const expected of expectedUnits) {
        if (isSameUnitInstance(expected, unit).result) {
          expectedUnits.delete(expected);
          return {
            result: true,
          };
        }
      }
      return {
        result: false,
        errorReason: 'Unexpected unit on board',
      };
    };

    // Helper to check if unit was already seen
    const hasSeenUnit = (unit: UnitInstance): ValidationResult => {
      const found = seenInGame.some(
        (seen) => isSameUnitInstance(seen, unit).result,
      );
      if (found) {
        return {
          result: false,
          errorReason: 'Duplicate unit on board',
        };
      }
      return {
        result: true,
      };
    };

    // Single pass through board: check duplicates and validate against expected
    const boardCoordinates = getBoardCoordinates(board);
    for (const coordinate of boardCoordinates) {
      const space = getBoardSpace(board, coordinate);
      if (hasSingleUnit(space.unitPresence)) {
        const unit = space.unitPresence.unit;
        const hasSeenUnitResult = hasSeenUnit(unit);
        if (!hasSeenUnitResult.result) {
          // Unit is present more than once
          return hasSeenUnitResult;
        }
        const removeExpectedUnitResult = removeExpectedUnit(unit);
        if (!removeExpectedUnitResult.result) {
          // Unexpected unit on board
          return removeExpectedUnitResult;
        }
        seenInGame.push(unit);
      } else if (hasEngagedUnits(space.unitPresence)) {
        const primaryUnit = space.unitPresence.primaryUnit;
        const secondaryUnit = space.unitPresence.secondaryUnit;
        const hasSeenPrimaryUnitResult = hasSeenUnit(primaryUnit);
        if (!hasSeenPrimaryUnitResult.result) {
          // Unit is present more than once
          return hasSeenPrimaryUnitResult;
        }
        const hasSeenSecondaryUnitResult = hasSeenUnit(secondaryUnit);
        if (!hasSeenSecondaryUnitResult.result) {
          // Unit is present more than once
          return hasSeenSecondaryUnitResult;
        }
        const removeExpectedPrimaryUnitResult = removeExpectedUnit(primaryUnit);
        if (!removeExpectedPrimaryUnitResult.result) {
          // Unexpected unit on board
          return removeExpectedPrimaryUnitResult;
        }
        const removeExpectedSecondaryUnitResult =
          removeExpectedUnit(secondaryUnit);
        if (!removeExpectedSecondaryUnitResult.result) {
          // Unexpected unit on board
          return removeExpectedSecondaryUnitResult;
        }
        seenInGame.push(primaryUnit);
        seenInGame.push(secondaryUnit);
      }
    }

    // Check for routed units
    for (const unit of routedUnits) {
      const removeExpectedUnitResult = removeExpectedUnit(unit);
      if (!removeExpectedUnitResult.result) {
        // Unexpected routed unit
        return removeExpectedUnitResult;
      }
      seenInGame.push(unit);
    }

    // If expectedUnits is empty, all expected units were found and no routed units were unexpected
    if (expectedUnits.size !== 0) {
      return {
        result: false,
        errorReason: 'One or more units missing from game state',
      };
    }
    return {
      result: true,
    };
  } catch (error) {
    // Any error means the game state is invalid
    return {
      result: false,
      errorReason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
