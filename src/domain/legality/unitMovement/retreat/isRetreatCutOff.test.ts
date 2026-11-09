import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import { isRetreatCutOff } from './isRetreatCutOff';

/**
 * A lone enemy in a back space, facing the unit, cuts its retreat (§9.1.5).
 * The black unit in every case stands on E-5 facing north, so its back
 * spaces are F-4, F-5 and F-6.
 */
describe('isRetreatCutOff function', () => {
  it('an enemy behind, facing the unit, cuts its retreat', () => {
    // A white unit on F-5 facing north looks straight at the black unit.
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['F-5', 'white', 'north'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    expect(isRetreatCutOff(gameState.boardState, unit)).toBe(true);
  });

  it('an enemy behind, looking away, has not closed the road', () => {
    // The same enemy, turned to face south, away from the black unit.
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['F-5', 'white', 'south'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    expect(isRetreatCutOff(gameState.boardState, unit)).toBe(false);
  });

  it('a friend behind is no obstacle to falling back', () => {
    // A black unit on F-5 facing the black unit on E-5.
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['F-5', 'black', 'north'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    expect(isRetreatCutOff(gameState.boardState, unit)).toBe(false);
  });

  it('an enemy on the flank, facing the unit, does not cut its retreat', () => {
    // E-6 is at the black unit's shoulder, on its rank: not a back space.
    const gameState = createGameState([
      ['E-5', 'black', 'north'],
      ['E-6', 'white', 'west'],
    ]);
    const unit = getSingleUnitWithPlacementAtCoordinate(
      gameState.boardState,
      'E-5',
    );

    expect(isRetreatCutOff(gameState.boardState, unit)).toBe(false);
  });
});
