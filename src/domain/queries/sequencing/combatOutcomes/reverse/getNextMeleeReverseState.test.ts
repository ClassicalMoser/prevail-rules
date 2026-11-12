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
   * the colour.
   */
  function meleeWithReverses(
    firstPlayer: 'white' | 'black',
    finals: {
      first?: ReverseState['finalPosition'];
      second?: ReverseState['finalPosition'];
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
      finalPosition: finals.first ?? 'pending',
    });
    const second = createReverseState(secondPlacement.unit, {
      finalPosition: finals.second ?? 'pending',
    });
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithReverse(
        firstPlacement.unit,
        {
          reverseState: first,
        },
      ),
      secondPlayerAttackApplyState: createAttackApplyStateWithReverse(
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
    // §7.5.6: both reverses are due and neither has its facing yet.
    const { second, state } = meleeWithReverses('white', {});

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it("returns the second player's reverse first when white is not the first player", () => {
    const { second, state } = meleeWithReverses('black', {});

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it("returns the first player's reverse once the second player's has its facing", () => {
    const secondFacing = {
      coordinate: 'E-6',
      facing: 'west',
    } satisfies ReverseState['finalPosition'];
    const { first, state } = meleeWithReverses('white', {
      second: secondFacing,
    });

    expect(getNextMeleeReverseState(state)).toBe(first);
  });

  it('passes over a first player reverse that already has its facing', () => {
    const firstFacing = {
      coordinate: 'E-4',
      facing: 'east',
    } satisfies ReverseState['finalPosition'];
    const { second, state } = meleeWithReverses('white', {
      first: firstFacing,
    });

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it('passes over a first player reverse that already has its facing when black is first', () => {
    const firstFacing = {
      coordinate: 'E-4',
      facing: 'west',
    } satisfies ReverseState['finalPosition'];
    const { second, state } = meleeWithReverses('black', {
      first: firstFacing,
    });

    expect(getNextMeleeReverseState(state)).toBe(second);
  });

  it('throws when both reverses already have a facing', () => {
    const { state } = meleeWithReverses('white', {
      first: { coordinate: 'E-4', facing: 'east' },
      second: { coordinate: 'E-6', facing: 'west' },
    });

    expect(() => getNextMeleeReverseState(state)).toThrow(
      'No reverse state found in melee resolution',
    );
  });
});
