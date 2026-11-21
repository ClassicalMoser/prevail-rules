import type { GameState, ReverseState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithReverse,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createReverseState,
  createTestUnit,
  placed,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getNextMeleeReverseState } from './getNextMeleeReverseState';

describe('getNextMeleeReverseState function', () => {
  /**
   * A melee where both sides are reversing. `firstPlayer` says which colour
   * holds the initiative, so the tests can show that the answer follows the
   * order the attacks take effect in (the second player's unit first, §7.5.6) and not
   * the colour. `turned` says which side's unit has already turned about.
   */
  function meleeWithReverses(
    firstPlayer: 'white' | 'black',
    turned: {
      first?: boolean;
      second?: boolean;
    },
  ): { state: GameState; first: ReverseState; second: ReverseState } {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      firstPlayer,
    );
    const secondPlayer = firstPlayer === 'white' ? 'black' : 'white';
    const firstUnit = createTestUnit(firstPlayer, { attack: 2 });
    const secondUnit = createTestUnit(secondPlayer, { attack: 2 });
    const firstPlacement = placed(firstUnit, 'E-5', 'east');
    const secondPlacement = placed(secondUnit, 'E-5', 'west');
    const first = createReverseState(firstPlacement.unit, {
      completed: turned.first ?? false,
    });
    const second = createReverseState(secondPlacement.unit, {
      completed: turned.second ?? false,
    });
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithReverse(
        firstPlacement.unit,
        {
          reverseState: first,
        },
      ),
      attackOnSecondPlayerApplyState: createAttackApplyStateWithReverse(
        secondPlacement.unit,
        {
          reverseState: second,
        },
      ),
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    return { first, second, state: updatePhaseState(empty, phase) };
  }

  it("returns the second player's reverse first, since the first player's attack takes effect first", () => {
    // §7.5.6: both reverses are due and neither unit has turned yet.
    const { second, state } = meleeWithReverses('white', {});

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it("returns the second player's reverse first when white is not the first player", () => {
    const { second, state } = meleeWithReverses('black', {});

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it("returns the first player's reverse once the second player's unit has turned", () => {
    // The second player's unit has already turned about.
    const { first, state } = meleeWithReverses('white', {
      second: true,
    });

    expect(getNextMeleeReverseState(state)).toBe(first);
  });

  it('passes over a first player reverse whose unit has already turned', () => {
    // The first player's unit has already turned about.
    const { second, state } = meleeWithReverses('white', {
      first: true,
    });

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it('passes over a first player reverse whose unit has already turned when black is first', () => {
    // The first player's unit has already turned about.
    const { second, state } = meleeWithReverses('black', {
      first: true,
    });

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it('throws when both units have already turned', () => {
    const { state } = meleeWithReverses('white', {
      first: true,
      second: true,
    });

    expect(() => getNextMeleeReverseState(state)).toThrow(
      'No reverse state found in melee resolution',
    );
  });
});
