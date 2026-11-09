import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { createMoveContext } from './createMoveContext';
import { isWithinMoveBounds } from './isWithinMoveBounds';

/**
 * An advance may use any ground; a retreat stays strictly behind the rank it
 * started on (§9.1.2).
 */
describe('isWithinMoveBounds function', () => {
  // A lone black unit on E-5 facing north: its own rank is E, and behind it
  // are the F-and-below rows. One unit is enough, since only the unit's
  // starting rank and facing decide the bounds.
  const gameState = createGameState([['E-5', 'black', 'north']]);
  const unit = getSingleUnitWithPlacementAtCoordinate(
    gameState.boardState,
    'E-5',
  );

  it('an advance may use a space in front of its starting rank', () => {
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');

    // Ask about D-5, one rank in front of the start.
    const within = isWithinMoveBounds(context, 'D-5');

    expect(within).toBe(true);
  });

  it('an advance may use a space behind its starting rank', () => {
    // Build the context of an advance begun on E-5.
    const context = createMoveContext(gameState, unit, 'advance');

    // Ask about F-5, one rank behind the start.
    const within = isWithinMoveBounds(context, 'F-5');

    expect(within).toBe(true);
  });

  it('a retreat may use a space behind its starting rank', () => {
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');

    // Ask about F-5, one rank behind the start.
    const within = isWithinMoveBounds(context, 'F-5');

    expect(within).toBe(true);
  });

  it('a retreat may not use a space in front of its starting rank', () => {
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');

    // Ask about D-5, one rank in front of the start.
    const within = isWithinMoveBounds(context, 'D-5');

    expect(within).toBe(false);
  });

  it('a retreat may not use its own starting space', () => {
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');

    // Ask about E-5 itself: a retreat must fall back, not stay.
    const within = isWithinMoveBounds(context, 'E-5');

    expect(within).toBe(false);
  });

  it('a retreat may not use a space on its starting rank', () => {
    // Build the context of a retreat begun on E-5.
    const context = createMoveContext(gameState, unit, 'retreat');

    // Ask about E-4, beside the start on the same rank.
    const within = isWithinMoveBounds(context, 'E-4');

    expect(within).toBe(false);
  });
});
