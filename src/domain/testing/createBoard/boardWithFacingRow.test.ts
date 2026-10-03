import { createBoardWithFacingRow } from './boardWithFacingRow';

/**
 * A facing row places one unit per coordinate, all on one side, all facing
 * the same way. `unitAt` returns the placement this helper wrote.
 */
describe(createBoardWithFacingRow, () => {
  it('places black units facing north along the coordinates', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6'],
    });

    expect(unitAt('E-5').placement).toStrictEqual({
      coordinate: 'E-5',
      facing: 'north',
    });
    expect(unitAt('E-6').unit.playerSide).toBe('black');
    expect(board.boardType).toBe('standard');
  });

  it('uses the facing and side this case wrote', () => {
    const { unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5'],
      facing: 'east',
      playerSide: 'white',
    });

    expect(unitAt('E-5').placement.facing).toBe('east');
    expect(unitAt('E-5').unit.playerSide).toBe('white');
  });
});
