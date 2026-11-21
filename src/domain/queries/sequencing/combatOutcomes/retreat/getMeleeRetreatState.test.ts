import type { UnitWithPlacement } from '@entities';
import type { GameState, MeleeResolutionState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createMeleeResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
  legalRetreatsOf,
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
    const retreat = createRetreatState(white.unit, legalRetreatsOf(white));
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: createAttackApplyStateWithRetreat(
        white.unit,
        legalRetreatsOf(white),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'white')).toBe(retreat);
  });

  it('returns the black retreat', () => {
    const empty = createEmptyGameState('standard');
    const black = placed('black', 'south');
    const retreat = createRetreatState(black.unit, legalRetreatsOf(black));
    const melee = createMeleeResolutionState(empty, {
      attackOnSecondPlayerApplyState: createAttackApplyStateWithRetreat(
        black.unit,
        legalRetreatsOf(black),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee);

    expect(getMeleeRetreatState(state, 'black')).toBe(retreat);
  });

  it('throws when the white attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(empty, {
      attackOnFirstPlayerApplyState: 'pending',
    });
    const state = resolveMelee(melee);

    expect(() => getMeleeRetreatState(state, 'white')).toThrow(
      'No attack apply on white found in melee resolution',
    );
  });
});
