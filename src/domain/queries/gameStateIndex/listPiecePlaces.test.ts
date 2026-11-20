import { createEmptyGameState, createUnitIndexKey } from '@factories';
import { createBoardWithSingleUnit, createTestUnit } from '@testing';
import { addCommanderToBoard } from '@transforms';

import { listPiecePlaces } from './listPiecePlaces';

/**
 * Every place the record puts a piece, a piece held twice listed twice, so
 * that the index can be derived from it and a state's wholeness checked.
 */
describe('listPiecePlaces function', () => {
  it('lists nothing for a game not yet mustered', () => {
    // No units anywhere, and commanders not yet placed are not listed.
    expect(listPiecePlaces(createEmptyGameState('standard'))).toStrictEqual([]);
  });

  it('lists a unit and a commander standing on the board', () => {
    // A white unit at E-5, and white's commander there with it.
    // The board is set directly: the index is derived from this walk, and
    // the walk reads only the record.
    const state = {
      ...createEmptyGameState('standard'),
      boardState: addCommanderToBoard(
        createBoardWithSingleUnit('E-5', 'white'),
        'white',
        'E-5',
      ),
    };
    const unit = createTestUnit('white', {});

    // The unit is filed by its key, the commander by its side.
    expect(listPiecePlaces(state)).toStrictEqual([
      { entry: 'E-5', key: createUnitIndexKey(unit), piece: 'unit' },
      { entry: 'E-5', piece: 'commander', side: 'white' },
    ]);
  });

  it('lists a unit held in two places twice, reserve before board', () => {
    // A white unit on the board at E-5 and still in reserve.
    const unit = createTestUnit('white', {});
    const state = {
      ...createEmptyGameState('standard'),
      boardState: createBoardWithSingleUnit('E-5', 'white'),
      reservedUnits: [unit],
    };

    // Both places, so the check on a whole state can see the second.
    expect(listPiecePlaces(state)).toStrictEqual([
      { entry: 'reserved', key: createUnitIndexKey(unit), piece: 'unit' },
      { entry: 'E-5', key: createUnitIndexKey(unit), piece: 'unit' },
    ]);
  });
});
