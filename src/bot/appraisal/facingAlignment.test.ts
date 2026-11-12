import { createGameState } from '@testing';
import { boardDistance, facingAlignment } from './boardDistance';

/**
 * The bot's sense of how far apart two spaces are, and which way a unit is
 * looking.
 */
describe('boardDistance function', () => {
  const { boardState } = createGameState([]);

  it('counts a diagonal step as one, like any other', () => {
    // E-5 to C-7 is two rows and two columns: two diagonal steps.
    expect(boardDistance(boardState, 'E-5', 'C-7')).toBe(2);
  });

  it('counts the longer of the two gaps', () => {
    expect(boardDistance(boardState, 'E-5', 'B-6')).toBe(3);
  });

  it('is zero from a space to itself', () => {
    expect(boardDistance(boardState, 'E-5', 'E-5')).toBe(0);
  });
});

describe('facingAlignment function', () => {
  const { boardState } = createGameState([]);

  it('is 1 for a target straight ahead', () => {
    // On E-5 looking at D-5 (north), with C-5 further north.
    expect(facingAlignment(boardState, 'E-5', 'D-5', 'C-5')).toBeCloseTo(1);
  });

  it('is -1 for a target straight behind', () => {
    expect(facingAlignment(boardState, 'E-5', 'D-5', 'G-5')).toBeCloseTo(-1);
  });

  it('is 0 for a target square to the side', () => {
    expect(facingAlignment(boardState, 'E-5', 'D-5', 'E-8')).toBeCloseTo(0);
  });
});
