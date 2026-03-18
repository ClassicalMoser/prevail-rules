import { describe, expect, it } from 'vitest';
import { hasMove } from './hasMove';

describe('hasMove', () => {
  it('should return true when coordinate and facing match', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
      { coordinate: 'E-6', facing: 'south' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'north')).toBe(true);
    expect(hasMove(legalMoves, 'E-6', 'south')).toBe(true);
  });

  it('should return true when coordinate matches and facing not specified', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5')).toBe(true);
  });

  it('should return false when coordinate not in moves', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-6')).toBe(false);
  });

  it('should return false when facing does not match', () => {
    const legalMoves = new Set([
      { coordinate: 'E-5', facing: 'north' as const },
    ]);
    expect(hasMove(legalMoves, 'E-5', 'south')).toBe(false);
  });
});
