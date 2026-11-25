import { createTestUnit, placed } from '@testing';
import { createEmptyStandardBoard } from '@factories';

import { addEngagingUnitToBoard } from './addEngagingUnitToBoard';
import { addUnitToBoard } from './addUnitToBoard';

/**
 * AddUnitToBoard: Adds a unit to a board (pure function, returns new board).
 * A space holds one unit, or two enemies engaged facing each other (§2.2.1),
 * and nothing enters an engaged space (§2.2.3).
 *
 * The board fixtures in `@testing` are built with this function, so the
 * setup here places units by calling it directly.
 */
describe('addUnitToBoard function', () => {
  // Black's unit, and the enemy and the friend it may meet.
  const unit = createTestUnit('black', { attack: 3 });
  const enemy = createTestUnit('white', { attack: 3 });
  const friend = createTestUnit('black', { attack: 3, instanceNumber: 2 });

  it('stands a unit alone on an empty space, facing the way it is set down, and leaves the board it was given as it was', () => {
    const board = createEmptyStandardBoard();

    const newBoard = addUnitToBoard(board, placed(unit, 'E-5', 'north'));

    // The unit stands alone on E-5, facing north.
    expect(newBoard.board['E-5']?.unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit,
    });
    // The board it was given still has E-5 empty.
    expect(board.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'none',
    });
  });

  it('leaves every other space as it was', () => {
    // White's unit already stands on D-4, facing south.
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(enemy, 'D-4', 'south'),
    );

    const newBoard = addUnitToBoard(board, placed(unit, 'E-5', 'north'));

    // D-4 still holds White's unit, facing south.
    expect(newBoard.board['D-4']?.unitPresence).toStrictEqual({
      facing: 'south',
      presenceType: 'single',
      unit: enemy,
    });
  });

  it('sets a unit down engaged with a lone enemy it faces, the enemy first of the pair with its facing', () => {
    // White's unit stands on E-5 facing north; Black's is set down facing
    // south, into it.
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(enemy, 'E-5', 'north'),
    );

    const newBoard = addUnitToBoard(board, placed(unit, 'E-5', 'south'));

    // The two stand engaged; the pair keeps White's facing, and Black faces
    // opposite it.
    expect(newBoard.board['E-5']?.unitPresence).toStrictEqual({
      presenceType: 'engaged',
      primaryFacing: 'north',
      primaryUnit: enemy,
      secondaryUnit: unit,
    });
    // The board it was given still has White alone on E-5.
    expect(board.board['E-5']?.unitPresence).toStrictEqual({
      facing: 'north',
      presenceType: 'single',
      unit: enemy,
    });
  });

  it('refuses to set a unit down with an enemy it does not face', () => {
    // White's unit stands on E-5 facing north; Black's would face north too,
    // with its back to it.
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(enemy, 'E-5', 'north'),
    );

    expect(() => addUnitToBoard(board, placed(unit, 'E-5', 'north'))).toThrow(
      'Engaged unit must have opposite facing',
    );
  });

  it('refuses a space a friendly unit already holds', () => {
    // Another of Black's units stands on E-5.
    const board = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(friend, 'E-5', 'north'),
    );

    expect(() => addUnitToBoard(board, placed(unit, 'E-5', 'south'))).toThrow(
      'Cannot add unit to space with friendly unit',
    );
  });

  it('refuses a space where two units are engaged', () => {
    // White's unit on E-5, engaged by another of Black's units arriving
    // from the north, facing south.
    const standing = addUnitToBoard(
      createEmptyStandardBoard(),
      placed(enemy, 'E-5', 'north'),
    );
    const engaged = addEngagingUnitToBoard(
      standing,
      placed(friend, 'E-5', 'south'),
    );

    expect(() => addUnitToBoard(engaged, placed(unit, 'E-5', 'south'))).toThrow(
      'Cannot add unit to space with engaged units',
    );
  });
});
