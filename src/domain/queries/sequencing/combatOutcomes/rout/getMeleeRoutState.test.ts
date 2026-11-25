import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRout,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getMeleeRoutState } from './getMeleeRoutState';

describe('getMeleeRoutState function', () => {
  it('returns the rout opened on that side of the melee', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defender = createTestUnit('white', { attack: 2 });
    // A melee holds one apply per side, so the player argument picks the side.
    const rout = createRoutState('white', defender);
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(getMeleeRoutState(state, 'white')).toBe(rout);
  });

  it('throws when that side has not opened its attack apply', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: 'pending',
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(() => getMeleeRoutState(state, 'white')).toThrow(
      'No attack apply on white found in melee resolution',
    );
  });

  it('throws when the attack on that side applied no rout', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defender = createTestUnit('white', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState:
        createAttackApplyStateWithNothingDue(defender),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(() => getMeleeRoutState(state, 'white')).toThrow(
      'The melee attack on white applied no rout',
    );
  });
});
