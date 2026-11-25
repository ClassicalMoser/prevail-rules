import type { PlayerSide } from '@entities';

import { getOtherPlayer } from './getOtherPlayer';

describe('getOtherPlayer function', () => {
  it('pairs each side with the side across the board', () => {
    // Black's opponent is White …
    expect(getOtherPlayer('black')).toBe('white');
    // … and White's is Black.
    expect(getOtherPlayer('white')).toBe('black');
  });

  it('throws for a value that is not a side', () => {
    // 'invalid' is not a side, so the cast is what reaches the rejection.
    expect(() => getOtherPlayer('invalid' as PlayerSide)).toThrow(
      'Invalid player side: invalid',
    );
  });
});
