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

import { getReverseStateFromMeleeResolutionByInitiative } from './getReverseStateFromMeleeResolutionByInitiative';

describe('getReverseStateFromMeleeResolutionByInitiative function', () => {
  function meleeWithReverses(
    initiative: 'white' | 'black',
    finals: {
      white?: ReverseState['finalPosition'];
      black?: ReverseState['finalPosition'];
    },
  ): { state: GameState; white: ReverseState; black: ReverseState } {
    const empty = updateCurrentInitiative(
      createEmptyGameState('standard'),
      initiative,
    );
    const whiteUnit = createTestUnit('white', { attack: 2 });
    const blackUnit = createTestUnit('black', { attack: 2 });
    const whitePlacement = placed(whiteUnit, 'E-5', 'east');
    const blackPlacement = placed(blackUnit, 'E-5', 'west');
    const white = createReverseState(whitePlacement, {
      finalPosition: finals.white ?? 'pending',
    });
    const black = createReverseState(blackPlacement, {
      finalPosition: finals.black ?? 'pending',
    });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithReverse(blackPlacement, {
        reverseState: black,
      }),
      whiteAttackApplyState: createAttackApplyStateWithReverse(whitePlacement, {
        reverseState: white,
      }),
    });
    const phase = createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    });
    return { black, state: updatePhaseState(empty, phase), white };
  }

  it('returns the first player reverse while its facing is unset', () => {
    const { state, white } = meleeWithReverses('white', {});

    expect(getReverseStateFromMeleeResolutionByInitiative(state)).toBe(white);
  });

  it('returns the first player reverse when that player is black', () => {
    const { black, state } = meleeWithReverses('black', {});

    expect(getReverseStateFromMeleeResolutionByInitiative(state)).toBe(black);
  });

  it('returns the second player reverse when the first facing is set', () => {
    const whiteFacing = {
      coordinate: 'E-4',
      facing: 'east',
    } satisfies ReverseState['finalPosition'];
    const { black, state } = meleeWithReverses('white', {
      white: whiteFacing,
    });

    expect(getReverseStateFromMeleeResolutionByInitiative(state)).toBe(black);
  });

  it('returns the second player reverse when the first player is black and that facing is set', () => {
    const blackFacing = {
      coordinate: 'E-4',
      facing: 'west',
    } satisfies ReverseState['finalPosition'];
    const { state, white } = meleeWithReverses('black', {
      black: blackFacing,
    });

    expect(getReverseStateFromMeleeResolutionByInitiative(state)).toBe(white);
  });

  it('throws when both reverses already have a facing', () => {
    const { state } = meleeWithReverses('white', {
      black: { coordinate: 'E-6', facing: 'west' },
      white: { coordinate: 'E-4', facing: 'east' },
    });

    expect(() => getReverseStateFromMeleeResolutionByInitiative(state)).toThrow(
      'No reverse state found in melee resolution',
    );
  });
});
