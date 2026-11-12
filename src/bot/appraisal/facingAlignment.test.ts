import { createGameState } from '@testing';
import { facingAlignment } from './facingAlignment';

/** Which way a unit is looking, as the bot judges facing toward the enemy. */
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
