import type { UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { getMeleeRetreatState } from './getMeleeRetreatState';

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
  const unit = createTestUnit(player, { attack: 2 });
  const placement = createUnitPlacement('E-5', facing);
  const standing = { placement, unit };
  return standing;
}

describe('getMeleeRetreatState function', () => {
  it('returns the white retreat', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'white')).toBe(retreat);
  });

  it('returns the black retreat', () => {
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black);
    const melee = createMeleeResolutionState(empty, {
      secondPlayerAttackApplyState: createAttackApplyStateWithRetreat(black, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'black')).toBe(retreat);
  });

  it('throws when the white attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRetreatState(state, 'white')).toThrow(
      'No white attack apply state found in melee resolution',
    );
  });
});
