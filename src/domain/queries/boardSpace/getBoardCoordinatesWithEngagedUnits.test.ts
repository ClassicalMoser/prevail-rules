import {
  createEmptyGameState,
  createGameStateWithEngagedUnits,
  createTestUnit,
} from '@testing';
import { describe, expect, it } from 'vitest';
import { getBoardCoordinatesWithEngagedUnits } from './getBoardCoordinatesWithEngagedUnits';

/**
 * getBoardCoordinatesWithEngagedUnits: set of coordinates where the space has an engagement (two units).
 */
describe('getBoardCoordinatesWithEngagedUnits', () => {
  it('given no engagements on board, returns empty set', () => {
    const state = createEmptyGameState();
    expect(getBoardCoordinatesWithEngagedUnits(state.boardState).size).toBe(0);
  });

  it('given one engaged space, set contains that coordinate', () => {
    const black = createTestUnit('black', { attack: 3 });
    const white = createTestUnit('white', { attack: 3 });
    const state = createGameStateWithEngagedUnits(black, white, 'E-5');

    const coords = getBoardCoordinatesWithEngagedUnits(state.boardState);

    expect(coords.size).toBe(1);
    expect(coords.has('E-5')).toBe(true);
  });
});
