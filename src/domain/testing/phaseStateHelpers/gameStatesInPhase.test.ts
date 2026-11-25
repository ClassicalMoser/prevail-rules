import {
  findCurrentCommandResolutionState,
  findMeleeResolutionState,
  getCurrentInitiative,
} from '@queries';

import {
  createMeleeResolutionState,
  createMovementResolutionState,
} from './commandResolutionStates';
import { createFrontEngagementState } from './engagementStates';
import {
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createGameStateResolvingMelee,
} from './gameStatesInPhase';
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

describe('createGameStateResolvingMelee function', () => {
  it('puts the melee a spec built under way in Phase 4, White holding the initiative', () => {
    // A melee, with nothing said of who holds the initiative.
    const melee = createMeleeResolutionState(createEmptyGameState('standard'));

    const state = createGameStateResolvingMelee(melee);

    // That melee is being fought, and White holds the initiative as a new
    // game starts.
    expect(findMeleeResolutionState(state)).toBe(melee);
    expect(getCurrentInitiative(state)).toBe('white');
  });

  it('gives the initiative to the side a spec names', () => {
    // Black holds the initiative in this melee.
    const melee = createMeleeResolutionState(createEmptyGameState('standard'));

    const state = createGameStateResolvingMelee(melee, 'black');

    expect(getCurrentInitiative(state)).toBe('black');
  });
});

describe('createGameStateMovingInto function', () => {
  it('carries out a move whose unit has walked into this engagement', () => {
    // The moving unit met its enemy head on.
    const engagement = createFrontEngagementState();

    const state = createGameStateMovingInto(engagement);

    // The order under way is a move holding that engagement.
    expect(findCurrentCommandResolutionState(state)).toMatchObject({
      engagementState: engagement,
    });
  });
});
