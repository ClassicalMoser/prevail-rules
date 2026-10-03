import { joinCoordinate } from './boardCoordinates';

/**
 * joinCoordinate: row + column strings become a Coordinate when known.
 */
describe(joinCoordinate, () => {
  it('joins a known row and column into a coordinate', () => {
    const coordinate = joinCoordinate('E', '5');

    expect(coordinate).toBe('E-5');
  });

  it('rejects an unknown row/column pair', () => {
    expect(() => joinCoordinate('Z', '99')).toThrow('Invalid coordinate: Z-99');
  });
});
