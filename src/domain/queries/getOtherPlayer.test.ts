import type { PlayerSide } from '@entities';

import { getOtherPlayer } from './getOtherPlayer';

/**
 * GetOtherPlayer: maps black ↔ white for two-player sides; throws on unknown side.
 */
describe(getOtherPlayer, () => {
  it('given black, returns white', () => {
    expect(getOtherPlayer('black')).toBe('white');
  });

  it('given white, returns black', () => {
    expect(getOtherPlayer('white')).toBe('black');
  });

  it('given invalid player side, throws', () => {
    expect(() => getOtherPlayer('invalid' as PlayerSide)).toThrow(
      'Invalid player side: invalid',
    );
  });
});
