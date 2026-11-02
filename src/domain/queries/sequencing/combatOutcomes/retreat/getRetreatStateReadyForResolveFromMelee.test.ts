import type { UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getRetreatStateReadyForResolveFromMelee } from './getRetreatStateReadyForResolveFromMelee';

function resolveMelee(
  melee: MeleeResolutionState,
  initiative: 'white' | 'black' = 'white',
): GameState {
  const empty = updateCurrentInitiative(
    createEmptyGameState('standard'),
    initiative,
  );
  return updatePhaseState(
    empty,
    createResolveMeleePhaseState(empty, {
      currentMeleeResolutionState: melee,
    }),
  );
}
function placed(
  player: 'white' | 'black',
  facing: UnitWithPlacement['placement']['facing'],
): UnitWithPlacement {
  return {
    placement: { coordinate: 'E-5', facing },
    unit: createTestUnit(player, { attack: 2 }),
  };
}

describe('getRetreatStateReadyForResolveFromMelee function', () => {
  const finalPlacement = {
    coordinate: 'E-6',
    facing: 'south',
  } satisfies UnitWithPlacement['placement'];

  it('returns the first player retreat whose final placement is set', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'white');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });

  it('returns the second player retreat when the first final placement is still pending', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white),
    });
    const state = resolveMelee(melee, 'white');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });

  it('throws when neither retreat has a final placement', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const black = placed('black', 'south');
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black),
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white),
    });
    const state = resolveMelee(melee, 'white');

    expect(() => getRetreatStateReadyForResolveFromMelee(state)).toThrow(
      'No retreat state with finalPosition found in melee resolution',
    );
  });

  it('returns the black retreat when black has initiative and that final placement is set', () => {
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black, {
      finalPosition: finalPlacement,
    });
    const melee = createMeleeResolutionState(empty, {
      blackAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee, 'black');

    expect(getRetreatStateReadyForResolveFromMelee(state)).toBe(retreat);
  });
});
