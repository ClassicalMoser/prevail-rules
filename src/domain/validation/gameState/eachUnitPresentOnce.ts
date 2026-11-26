import type { Board, UnitCount, UnitInstance } from '@entities';
import type { ValidationResult } from '@utils';
import { failFromFault } from '@utils';
import { createArmyUnits } from '@factories';
import {
  getBoardCoordinates,
  getBoardSpace,
  hasEngagedUnits,
  hasSingleUnit,
  hasUnitInArray,
  isSameUnitInstance,
} from '@queries';

// TODO(composition): not run where a game is loaded. Meant for an integrity
// check not yet built; settled by wiring it there, or saying why not.
// TODO(composition): this checks a whole game record against its armies.
// `refineGameStateIndex` in `@legality` already refuses a unit held in two
// places (board, reserve, routed) inside `legalGameSchema`, so what this adds
// is the army half: no unit missing, none the army never brought. Settle
// whether that half belongs beside it as a refine in `@legality`, reading
// `game.whiteArmy` and `game.blackArmy`, rather than here.
// TODO(wrong): there is no place for the reserve. A state's units waiting to
// be placed at setup are in `reservedUnits`, on neither the board nor the
// routed list, so a game still in round 0 is refused as missing units. Settle
// by taking the reserve as well (or the whole state), and counting it as a
// place a unit may be.
/**
 * Whether every unit each army brought is in exactly one place in the record,
 * and no other unit is there.
 *
 * An army is a list of unit types with a count of each, and every one of
 * those is its own piece, numbered from 1 within its type. Once fielded, a
 * piece stands on one space of the board, alone or locked with an enemy in an
 * engaged space (§2.2.1), until it routs and leaves the battle for good
 * (§9.3.1). A piece the record holds twice, a piece it has lost, or a piece
 * no army brought, means the record is not a battle that could have been
 * fought.
 *
 * It is an entry point: it never throws, and a fault beneath it becomes a
 * refusal through `failFromFault`.
 *
 * @param whiteArmy - The unit types White's army brought, with their counts
 * @param blackArmy - The unit types Black's army brought, with their counts
 * @param board - The board, read space by space
 * @param routedUnits - The units that have routed
 * @returns A pass when every unit of both armies is on the board or routed,
 * each once, and no other unit is; otherwise the first fault found
 */
export function eachUnitPresentOnce(
  whiteArmy: Set<UnitCount>,
  blackArmy: Set<UnitCount>,
  board: Board,
  routedUnits: Set<UnitInstance>,
): ValidationResult {
  try {
    // Build expected units set (we'll use isSameUnitInstance for equality checks)
    // Every piece either army brought, still to be found. A piece is struck
    // off as it is found, so whatever is left at the end is lost from the
    // record.
    const expectedUnits = new Set<UnitInstance>([
      ...createArmyUnits('white', whiteArmy),
      ...createArmyUnits('black', blackArmy),
    ]);

    // The pieces already met on the board, so a piece met a second time is
    // one piece recorded on two spaces.
    const seenInGame: UnitInstance[] = [];

    // Helper to find and remove expected unit by value equality
    // Since Sets use referential equality, we need to find the matching unit first
    // TODO(composition): `hasUnitInSet` and `setWithoutUnit` in `@queries`
    // were written for this search. They are not swapped in: `setWithoutUnit`
    // drops every member that matches, where this drops only the first, and
    // the two differ when an army lists one unit type twice.
    /**
     * Strikes a piece off the armies' list; refused when no army brought it,
     * or it was already struck off.
     */
    const removeExpectedUnit = (unit: UnitInstance): ValidationResult => {
      for (const expected of expectedUnits) {
        // A piece is its side, its type and its number, wherever it stands.
        if (isSameUnitInstance(expected, unit)) {
          expectedUnits.delete(expected);
          // Found among the pieces the armies brought.
          const found: ValidationResult = {
            result: true,
          };
          return found;
        }
      }
      // No army brought this piece, or it has been counted already.
      // TODO(misleading): the same reason is given for a routed unit no army
      // brought, or one also counted on the board, though it was not found on
      // the board. Settle by a reason naming where the unit was found.
      const unexpected: ValidationResult = {
        errorReason: 'Unexpected unit on board',
        result: false,
      };
      return unexpected;
    };

    // Helper to check if unit was already seen
    /** Refuses a piece already met on another space of the board. */
    const hasSeenUnit = (unit: UnitInstance): ValidationResult => {
      // Matched on who the piece is, not on the object the board holds.
      const found = hasUnitInArray(seenInGame, unit);
      // A piece stands on one space at a time, so a piece met on a second
      // space is one piece recorded twice.
      if (found) {
        const duplicate: ValidationResult = {
          errorReason: 'Duplicate unit on board',
          result: false,
        };
        return duplicate;
      }
      // Not met before.
      const unseen: ValidationResult = {
        result: true,
      };
      return unseen;
    };

    // Single pass through board: check duplicates and validate against expected
    const boardCoordinates = getBoardCoordinates(board);
    for (const coordinate of boardCoordinates) {
      // Every space of the board's size; a record missing one throws here,
      // and the catch below turns that into a refusal.
      const space = getBoardSpace(board, coordinate);
      if (hasSingleUnit(space.unitPresence)) {
        // A piece standing alone.
        const { unit } = space.unitPresence;
        // Checked before the armies' list, so a piece on two spaces is named
        // as that rather than as a piece no army brought, which its second
        // sighting would also be once the first struck it off.
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
        // Two enemies locked in one space (§6.1.1): both are on the board,
        // and each is accounted for like a piece standing alone.
        const { primaryUnit } = space.unitPresence;
        const { secondaryUnit } = space.unitPresence;
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
        seenInGame.push(primaryUnit, secondaryUnit);
      }
      // An empty space holds no piece to account for.
    }

    // Check for routed units
    // A routed piece has left the battle for good (§9.3.1), but it was one of
    // its army's pieces and the record still names it. A routed piece also
    // on the board was struck off there, so it is refused here.
    for (const unit of routedUnits) {
      const removeExpectedUnitResult = removeExpectedUnit(unit);
      if (!removeExpectedUnitResult.result) {
        // Unexpected routed unit
        return removeExpectedUnitResult;
      }
      // Nothing reads the list after the board, so this changes no answer.
      seenInGame.push(unit);
    }

    // If expectedUnits is empty, all expected units were found and no routed units were unexpected
    // A piece still on the list is neither on the board nor routed: the
    // record has lost it.
    if (expectedUnits.size > 0) {
      const missing: ValidationResult = {
        errorReason: 'One or more units missing from game state',
        result: false,
      };
      return missing;
    }

    // Every piece both armies brought, each in one place.
    const consistent: ValidationResult = {
      result: true,
    };
    return consistent;
  } catch (error) {
    // Any fault means the game state cannot be judged consistent.
    const fault = failFromFault(error, 'checking each unit is present once');
    return fault;
  }
}
