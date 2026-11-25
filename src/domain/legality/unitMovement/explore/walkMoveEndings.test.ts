import { getSingleUnitWithPlacementAtCoordinate } from '@queries';
import { createGameState } from '@testing';

import type { MoveResult } from './moveResult';
import { createMoveContext } from './createMoveContext';
import { getStartState } from './getStartState';
import { walkMoveEndings } from './walkMoveEndings';

/**
 * The one walk of a move: every place it may legally end, found from any
 * point, and stopped early when the caller has what it wanted.
 */
describe('walkMoveEndings function', () => {
  // A lone black unit on E-5 facing north, Speed 2 and Flexibility 2.
  const gameState = createGameState([
    {
      coord: 'E-5',
      facing: 'north',
      flexibility: 2,
      player: 'black',
      speed: 2,
    },
  ]);
  const unit = getSingleUnitWithPlacementAtCoordinate(
    gameState.boardState,
    'E-5',
  );
  const context = createMoveContext(gameState, unit, 'advance');

  it('reports the ending where the unit stands, and each one reached from it', () => {
    // Collect every ending, never asking the walk to stop.
    const endings: MoveResult[] = [];
    walkMoveEndings(context, getStartState(context), (ending) => {
      endings.push(ending);
      return false;
    });
    // Standing still is an ending, and so is stepping two spaces on to C-5.
    expect(endings.some((ending) => ending.path.length === 0)).toBe(true);
    expect(
      endings.some((ending) => ending.placement.coordinate === 'C-5'),
    ).toBe(true);
  });

  it('stops as soon as the caller says it has what it wanted', () => {
    // Collect endings, asking the walk to stop at the first.
    const endings: MoveResult[] = [];
    walkMoveEndings(context, getStartState(context), (ending) => {
      endings.push(ending);
      return true;
    });
    // The unit could stand, step or turn, but only one ending was reported.
    expect(endings).toHaveLength(1);
  });
});
