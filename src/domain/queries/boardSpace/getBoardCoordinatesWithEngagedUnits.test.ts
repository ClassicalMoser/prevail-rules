import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';

describe('getBoardCoordinatesWithEngagedUnits', () => {
  it('returns empty set when no engagements', () => {
    const state = createEmptyGameState();
    expect(getBoardCoordinatesWithEngagedUnits(state.boardState).size).toBe(0);
  });

  it('returns coordinates for each engaged space', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5');

    const coords = getBoardCoordinatesWithEngagedUnits(state.boardState);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });
});
