import { createBoardWithFacingRow } from './boardWithFacingRow';

/**
 * A facing row places one unit per coordinate, all on one side, all facing
 * the same way. `unitAt` returns the placement this helper wrote.
 */
describe('createBoardWithFacingRow function', () => {
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

  it('numbers the row’s units 1, 2 along it, so no two share an identity', () => {
    const { unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6'],
    });

    expect(unitAt('E-5').unit.instanceNumber).toBe(1);
    expect(unitAt('E-6').unit.instanceNumber).toBe(2);
  });

  it('refuses to name a unit on a space the row does not hold', () => {
    const { unitAt } = createBoardWithFacingRow({ coordinates: ['E-5'] });

    expect(() => unitAt('E-6')).toThrow('Expected a unit at E-6');
  });
});
