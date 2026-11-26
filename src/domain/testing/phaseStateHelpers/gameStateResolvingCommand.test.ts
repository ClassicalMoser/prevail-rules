import { findCurrentCommandResolutionState } from '@queries';
import { createMovementResolutionState } from './movementResolutionState';
import { createGameStateResolvingCommand } from './gameStateResolvingCommand';
import { createEmptyGameState } from '@factories';

/**
 * Specs about an order or a melee need the game around it in the right phase;
 * these build that game, so each spec builds only the order or melee it is
 * about.
 */
describe('createGameStateResolvingCommand function', () => {
  it('puts the order a spec built under way in Phase 3', () => {
    // A move, built on an empty game.
    const empty = createEmptyGameState('standard');
    const movement = createMovementResolutionState(empty);

    const state = createGameStateResolvingCommand(movement, empty);

    // The order being carried out is that move.
    expect(findCurrentCommandResolutionState(state)).toBe(movement);
  });
});
