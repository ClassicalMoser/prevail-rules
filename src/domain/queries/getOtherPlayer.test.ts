import type { PlayerSide } from '@entities';
import { describe, expect, it } from 'vitest';
import { getOtherPlayer } from './getOtherPlayer';

describe('getOtherPlayer', () => {
  it('should return the other player', () => {
    expect(getOtherPlayer('black')).toBe('white');
    expect(getOtherPlayer('white')).toBe('black');
  });
});

it('should throw an error when an invalid player side is provided', () => {
  expect(() => getOtherPlayer('invalid' as PlayerSide)).toThrow(
    'Invalid player side: invalid',
  );
});
