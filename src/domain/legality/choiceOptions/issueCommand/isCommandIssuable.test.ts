import type { Command } from '@entities';
import { createEmptyGameState, createUnitWithPlacement } from '@testing';
import { addUnitToBoard, updateBoardState } from '@transforms';

import { isCommandIssuable } from './isCommandIssuable';

/**
 * IsCommandIssuable: remaining grant can be spent as a full issueCommand.
 */
describe(isCommandIssuable, () => {
  const unrestrictedUnits = (number: number): Command => ({
    modifiers: [],
    number,
    restrictions: {
      inspirationRangeRestriction: -1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'units',
    type: 'movement',
  });

  it('given units ×2 and two eligible units, returns true', () => {
    let state = createEmptyGameState();
    const a = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 1 },
    });
    const b = createUnitWithPlacement({
      coordinate: 'E-6',
      facing: 'north',
      playerSide: 'black',
      unitOptions: { instanceNumber: 2 },
    });
    state = updateBoardState(
      state,
      addUnitToBoard(addUnitToBoard(state.boardState, a), b),
    );

    expect(isCommandIssuable(unrestrictedUnits(2), 'black', state)).toBe(true);
  });

  it('given units ×2 and only one eligible unit, returns false', () => {
    let state = createEmptyGameState();
    const a = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, a));

    expect(isCommandIssuable(unrestrictedUnits(2), 'black', state)).toBe(false);
  });

  it('given lines ×1 and one eligible start, returns true', () => {
    let state = createEmptyGameState();
    const a = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'black',
    });
    state = updateBoardState(state, addUnitToBoard(state.boardState, a));
    const lineCommand: Command = {
      ...unrestrictedUnits(1),
      size: 'lines',
    };

    expect(isCommandIssuable(lineCommand, 'black', state)).toBe(true);
  });
});
