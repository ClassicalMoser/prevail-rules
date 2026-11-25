import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithReverse,
  createGameStateResolvingMelee,
  createMeleeResolutionState,
  createReverseState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative } from '@transforms';

import { getMeleeReverseState } from './getMeleeReverseState';

describe('getMeleeReverseState function', () => {
  it('returns the reverse opened on that side of the melee', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defender = createTestUnit('black', { attack: 2 });
    // A melee holds one apply per side, so the player argument picks the side.
    const reverse = createReverseState(defender);
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithReverse(
        defender,
        {
          reverseState: reverse,
        },
      ),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(getMeleeReverseState(state, 'black')).toBe(reverse);
  });

  it('throws when that side has not opened its attack apply', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: 'pending',
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(() => getMeleeReverseState(state, 'black')).toThrow(
      'No attack apply on black found in melee resolution',
    );
  });

  it('throws when the attack on that side applied no reverse', () => {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      'black',
    );
    const defender = createTestUnit('black', { attack: 2 });
    // The attack reached nothing, so every outcome on it is bypassed.
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState:
        createAttackApplyStateWithNothingDue(defender),
    });
    const state = createGameStateResolvingMelee(melee, 'black');

    expect(() => getMeleeReverseState(state, 'black')).toThrow(
      'The melee attack on black applied no reverse',
    );
  });
});
