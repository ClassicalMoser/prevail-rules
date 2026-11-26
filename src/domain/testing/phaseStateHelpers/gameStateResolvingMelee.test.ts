import { findMeleeResolutionState, getCurrentInitiative } from '@queries';
import { createMeleeResolutionState } from './meleeResolutionState';
import { createGameStateResolvingMelee } from './gameStateResolvingMelee';
import { createEmptyGameState } from '@factories';

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
