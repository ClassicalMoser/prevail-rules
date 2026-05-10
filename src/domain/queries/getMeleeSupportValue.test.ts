import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';

import { getMeleeSupportValue } from './getMeleeSupportValue';
import { getPlayerUnitWithPosition } from './unitPresence';

/**
 * GetMeleeSupportValue: melee support total from eligible adjacent unengaged friendlies (strong vs weak facing,
 * diagonal line-of-sight blockers, engaged units excluded).
 *
 * Board coordinates: `Letter-Number` = row-column (e.g. E-5 = row E, column 5).
 * North moves toward lower row letters (toward A); south toward higher letters.
 * East increases column number; west decreases it.
 * A unit “behind” another is in the rear arc: opposite its facing (e.g. south of a unit facing north).
 */
describe(getMeleeSupportValue, () => {
  describe('no support', () => {
    it('given no adjacent friendlies, returns 0', () => {
      const unit = createTestUnit('black', { attack: 3 });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });

    it('given only adjacent friendly is in rear arc, returns 0', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      // Primary at E-5 facing north: south is row F. F-5 is orthogonally adjacent and in the rear arc,
      // So it is excluded before support is evaluated (even though facing north from F-5 would “see” E-5).
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'F-5', facing: 'north', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });

    it('given adjacent units are enemies, returns 0', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const enemyUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      // Enemy unit is adjacent (east of) primary unit
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'D-5', facing: 'south', unit: enemyUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });
  });

  describe('strong support', () => {
    it('given friendly faces toward primary, returns 2', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      // Support unit at E-6 facing west (toward primary unit at E-5)
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'west', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(2);
    });

    it('given diagonal adjacent friendly faces toward primary, returns 2', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });

      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'D-6', facing: 'southWest', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(2);
    });
  });

  describe('weak support', () => {
    it('given friendly flanks primary, returns 1', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      // Support unit at E-6 facing north (flanking primary unit at E-5)
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'north', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(1);
    });

    it('given friendly adjacent but facing away, returns 0', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'east', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });

    it('given diagonal support blocked by enemies on intervening orthogonals, returns 0', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const blockingEnemy1 = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      const blockingEnemy2 = createTestUnit('white', {
        attack: 3,
        instanceNumber: 2,
      });
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'D-6', facing: 'southWest', unit: supportUnit },
        { coordinate: 'D-5', facing: 'south', unit: blockingEnemy1 },
        { coordinate: 'E-6', facing: 'south', unit: blockingEnemy2 },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });
  });

  describe('engaged units', () => {
    it('given support candidate is engaged, does not count', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const enemyUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      // Support unit is engaged with enemy unit at E-5
      const board = createBoardWithEngagedUnits(
        primaryUnit,
        enemyUnit,
        'E-5',
        'west',
      );
      // Add support unit at E-6
      board.board['E-6'] = {
        ...board.board['E-6'],
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit: supportUnit,
        },
      };

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(0);
    });

    it('given other adjacent friendlies engaged, still counts unengaged strong support', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const engagedUnit1 = createTestUnit('black', {
        attack: 3,
        instanceNumber: 3,
      });
      const enemyUnit = createTestUnit('white', {
        attack: 3,
        instanceNumber: 1,
      });
      // Engaged units at F-5
      const board = createBoardWithEngagedUnits(
        engagedUnit1,
        enemyUnit,
        'F-5',
        'west',
      );
      // Add primary unit at E-5 and unengaged support unit at E-6
      board.board['E-5'] = {
        ...board.board['E-5'],
        unitPresence: {
          facing: 'north',
          presenceType: 'single',
          unit: primaryUnit,
        },
      };
      board.board['E-6'] = {
        ...board.board['E-6'],
        unitPresence: {
          facing: 'west',
          presenceType: 'single',
          unit: supportUnit,
        },
      };

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      // Should get support from unengaged unit at E-6, not from engaged unit at F-5
      expect(supportValue).toBe(2);
    });
  });

  describe('multiple support units', () => {
    it('given strong and weak support, returns strong value only', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const strongSupportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const weakSupportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 3,
      });
      // Strong support at E-6 facing west, weak support at F-5 facing north
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'west', unit: strongSupportUnit },
        { coordinate: 'F-5', facing: 'north', unit: weakSupportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      // Strong support (2) should be returned, weak support (1) is ignored
      expect(supportValue).toBe(2);
    });

    it('given only weak supports, sums weak values', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const weakSupportUnit1 = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      const weakSupportUnit2 = createTestUnit('black', {
        attack: 3,
        instanceNumber: 3,
      });
      // Both support units are flanking
      // Unit at E-6 facing north: flanking spaces are E-5 (west) and E-7 (east) - E-5 is flanking
      // Unit at F-5 facing north: flanking spaces are F-4 (west) and F-6 (east) - E-5 is not flanking
      // Need to position units so both provide flanking support
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'north', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'north', unit: weakSupportUnit1 }, // Flanking from east
        { coordinate: 'D-5', facing: 'east', unit: weakSupportUnit2 }, // Flanking from west (facing east, so flanking is north/south)
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      // E-6 facing north flanks E-5 (weak 1); D-5 facing east has flanking spaces north/south including E-5 (weak 1)
      expect(supportValue).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('given corner board position, strong support still applies', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });

      // Primary unit at A-1 (corner), support unit at A-2
      const board = createBoardWithUnits([
        { coordinate: 'A-1', facing: 'north', unit: primaryUnit },
        { coordinate: 'A-2', facing: 'west', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'A-1',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(2);
    });

    it('given primary facing east, support facing west toward primary, returns 2', () => {
      const primaryUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 1,
      });
      const supportUnit = createTestUnit('black', {
        attack: 3,
        instanceNumber: 2,
      });
      // Primary unit facing east, support unit at E-6 facing west (toward primary)
      const board = createBoardWithUnits([
        { coordinate: 'E-5', facing: 'east', unit: primaryUnit },
        { coordinate: 'E-6', facing: 'west', unit: supportUnit },
      ]);

      const unitWithPlacement = getPlayerUnitWithPosition(
        board,
        'E-5',
        'black',
      )!;
      const supportValue = getMeleeSupportValue(board, unitWithPlacement);

      expect(supportValue).toBe(2);
    });
  });
});
