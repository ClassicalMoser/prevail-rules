import { hasMove } from './hasMove';

/**
 * HasMove: Checks if a coordinate (and optionally facing) is present in a set of legal moves.
 */
describe(hasMove, () => {
  it('given coordinate and facing match, returns true', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
      { coordinate: 'E-6', facing: 'south' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'north')).toBeTruthy();
    expect(hasMove(legalMoves, 'E-6', 'south')).toBeTruthy();
  });

  it('given coordinate matches and facing not specified, returns true', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5')).toBeTruthy();
  });

  it('given coordinate not in moves, returns false', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-6')).toBeFalsy();
  });

  it('given facing does not match, returns false', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'south')).toBeFalsy();
  });
});
