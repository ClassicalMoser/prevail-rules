import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
} from '@testing';
import { createEmptyGameState } from '@factories';
import { updateBoardState } from '@transforms';
import { throwIfUndefined } from '@utils';

import { getPlayerUnitsOnBoard } from './getPlayerUnitsOnBoard';
/**
 * GetPlayerUnitsOnBoard: set of unit instances for a player present on the board (including engaged).
 */
describe('getPlayerUnitsOnBoard function', () => {
  it('returns the white units on the board', () => {
    const unit1 = createTestUnit('white', { attack: 3 });
    const unit2 = createTestUnit('white', { attack: 3 });
    const unit3 = createTestUnit('black', { attack: 3 });

    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        { placement: { coordinate: 'E-5', facing: 'north' }, unit: unit1 },
        { placement: { coordinate: 'F-5', facing: 'south' }, unit: unit2 },
        { placement: { coordinate: 'G-5', facing: 'east' }, unit: unit3 },
      ]),
    );

    const whiteUnits = getPlayerUnitsOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(2);
    const whiteUnitsArray = [...whiteUnits];
    expect(whiteUnitsArray).toContain(unit1);
    expect(whiteUnitsArray).toContain(unit2);
    expect(whiteUnitsArray).not.toContain(unit3);
  });

  it('returns an empty set when the asked side has no unit on the board', () => {
    const unit = createTestUnit('white', { attack: 3 });

    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithUnits([
        { placement: { coordinate: 'E-5', facing: 'north' }, unit },
      ]),
    );

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(0);
  });

  it('returns the engaged primary and a single unit of the same side', () => {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const supportUnit = createTestUnit('black', { attack: 3 });
    const engaged = createBoardWithEngagedUnits(
      blackUnit,
      whiteUnit,
      'E-5',
      'north',
    );
    // F-5 is a single black unit beside the engagement.
    // No factory places an engagement and a single unit on one board.
    const spaceAtF5 = throwIfUndefined(
      engaged.board['F-5'],
      'expected board space at F-5',
    );
    const board = {
      ...engaged,
      board: {
        ...engaged.board,
        'F-5': {
          ...spaceAtF5,
          unitPresence: {
            facing: 'south' as const,
            presenceType: 'single' as const,
            unit: supportUnit,
          },
        },
      },
    };
    const state = updateBoardState(createEmptyGameState('standard'), board);

    const blackUnits = getPlayerUnitsOnBoard(state, 'black');

    expect(blackUnits.size).toBe(2);
    expect(blackUnits).toContain(blackUnit);
    expect(blackUnits).toContain(supportUnit);
    expect(blackUnits).not.toContain(whiteUnit);
  });

  it('returns the engaged secondary when that unit is the asked side', () => {
    const blackUnit = createTestUnit('black', { attack: 3 });
    const whiteUnit = createTestUnit('white', { attack: 3 });
    const state = updateBoardState(
      createEmptyGameState('standard'),
      createBoardWithEngagedUnits(blackUnit, whiteUnit, 'E-5', 'north'),
    );

    const whiteUnits = getPlayerUnitsOnBoard(state, 'white');

    expect(whiteUnits.size).toBe(1);
    expect(whiteUnits).toContain(whiteUnit);
    expect(whiteUnits).not.toContain(blackUnit);
  });
});
