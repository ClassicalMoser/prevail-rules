import { hasMove } from './hasMove';

/**
 * HasMove: whether any legal move ends on a coordinate (and optionally a
 * facing).
 */
describe('hasMove function', () => {
  it('given coordinate and facing match, returns true', () => {
    const legalMoves = new Set([
      { placement: { coordinate: 'E-5' as const, facing: 'north' as const } },
      { placement: { coordinate: 'E-6' as const, facing: 'south' as const } },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'north')).toBe(true);
    expect(hasMove(legalMoves, 'E-6', 'south')).toBe(true);
  });

  it('given coordinate matches and facing not specified, returns true', () => {
    const legalMoves = new Set([
      { placement: { coordinate: 'E-5' as const, facing: 'north' as const } },
    ]);
    expect(hasMove(legalMoves, 'E-5')).toBe(true);
  });

  it('given coordinate not in moves, returns false', () => {
    const legalMoves = new Set([
      { placement: { coordinate: 'E-5' as const, facing: 'north' as const } },
    ]);
    expect(hasMove(legalMoves, 'E-6')).toBe(false);
  });

  it('given facing does not match, returns false', () => {
    const legalMoves = new Set([
      { placement: { coordinate: 'E-5' as const, facing: 'north' as const } },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'south')).toBe(false);
  });
});
