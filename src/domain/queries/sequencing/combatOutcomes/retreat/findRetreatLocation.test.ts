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
  legalRetreatsOf,
} from '@testing';
import { updateCurrentInitiative, updatePhaseState } from '@transforms';

import { findRetreatLocation } from './findRetreatLocation';

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

describe('findRetreatLocation function', () => {
  it('answers undefined before the round has a phase', () => {
    // Setup has no phase yet, and the endgame check asks on every state.
    const state = createEmptyGameState('standard');

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('returns the white retreat on a ranged attack, held by the attack', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender));
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender,
        legalRetreatsOf(defender),
        {
          retreatState: retreat,
        },
      ),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: retreat,
      source: 'rangedAttack',
    });
  });

  it('returns the white retreat on a melee, held by its side of the melee', () => {
    const empty = createEmptyGameState('standard');
    const white = placed('white', 'north');
    const retreat = createRetreatState(white, legalRetreatsOf(white));
    const melee = createMeleeResolutionState(empty, {
      firstPlayerAttackApplyState: createAttackApplyStateWithRetreat(
        white,
        legalRetreatsOf(white),
        {
          retreatState: retreat,
        },
      ),
    });
    const state = resolveMelee(melee);

    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: retreat,
      source: 'melee',
    });
  });

  it('answers undefined when a movement has engaged nobody', () => {
    const empty = createEmptyGameState('standard');
    // A move that opened no engagement forces no retreat, which is ordinary.
    const state = issueCommands(createMovementResolutionState(empty));

    expect(findRetreatLocation(state, 'white')).toBeUndefined();
  });

  it('returns the retreat nested on a front engagement, held by the engagement', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender));
    const resolution = createMovementResolutionState(empty, {
      engagementState: createFrontEngagementState({
        defendingUnitRetreats: true,
        retreatState: retreat,
      }),
    });
    const state = issueCommands(resolution);

    expect(findRetreatLocation(state, 'white')).toStrictEqual({
      retreatState: retreat,
      source: 'frontEngagement',
    });
  });

  it('answers undefined when the retreat belongs to the other player', () => {
    const empty = createEmptyGameState('standard');
    const defender = placed('white', 'north');
    const retreat = createRetreatState(defender, legalRetreatsOf(defender));
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender,
        legalRetreatsOf(defender),
        {
          retreatState: retreat,
        },
      ),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    // The defender of a ranged attack may be either side's unit, so black is
    // entitled to ask and entitled to a no.
    expect(findRetreatLocation(state, 'black')).toBeUndefined();
  });
});
