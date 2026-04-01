import { describe, expect, it } from 'vitest';
import { gameTypes, getBoardSizeForGameType } from './gameTypes';

describe('getBoardSizeForGameType', () => {
  it('matches each entry in gameTypes', () => {
    for (const { type, boardSize } of gameTypes) {
      expect(getBoardSizeForGameType(type)).toBe(boardSize);
    }
  });
});
