import type { UnitWithPlacement } from '@entities';
import type {
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
} from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyStateWithRetreat,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMeleeResolutionState,
  createMovementResolutionState,
  createRangedAttackResolutionState,
  createResolveMeleePhaseState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatState } from './findRetreatState';

function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    }),
  );
}
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

describe('findRetreatState function', () => {
  it('answers undefined before the round has a phase', () => {
    // Setup has no phase yet, and the endgame check asks on every state.
    const state = createEmptyGameState('standard');

    expect(findRetreatState(state, 'white')).toBeUndefined();
  });

  it('returns the white retreat on a ranged attack', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(defender, {
        retreatState: retreat,
      }),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('returns the white retreat on a melee', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white);
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('answers undefined when a movement has engaged nobody', () => {
    const empty = createEmptyGameState('standard');
    // A move that opened no engagement forces no retreat, which is ordinary.
    const state = issueCommands(createMovementResolutionState(empty));

    expect(findRetreatState(state, 'white')).toBeUndefined();
  });

  it('returns the retreat nested on a front engagement', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: retreat,
      }),
    });
    const state = issueCommands(resolution);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('answers undefined when the retreat belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(defender, {
        retreatState: retreat,
      }),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    // The defender of a ranged attack may be either side's unit, so black is
    // entitled to ask and entitled to a no.
    expect(findRetreatState(state, 'black')).toBeUndefined();
  });
});
