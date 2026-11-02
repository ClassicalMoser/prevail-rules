import type { UnitWithPlacement } from '@entities';
import type {
  CommandResolutionState,
  GameState,
  MeleeResolutionState,
} from '@game';
import { createEmptyGameState } from '@factories';
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
  return {
    placement: { coordinate: 'E-5', facing },
    unit: createTestUnit(player, { attack: 2 }),
  };
}

describe('findRetreatState function', () => {
  it('throws when the round has no phase', () => {
    const state = createEmptyGameState('standard');

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No current phase state found',
    );
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
      whiteAttackApplyState: createAttackApplyStateWithRetreat(white, {
        retreatState: retreat,
      }),
    });
    const state = resolveMelee(melee);

    expect(findRetreatState(state, 'white')).toBe(retreat);
  });

  it('throws when the command resolution is movement without a retreat', () => {
    const empty = createEmptyGameState('standard');
    const state = issueCommands(createMovementResolutionState(empty));

    expect(() => findRetreatState(state, 'white')).toThrow(
      'No retreat state found for player white',
    );
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

  it('throws when the retreat belongs to the other player', () => {
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

    expect(() => findRetreatState(state, 'black')).toThrow(
      'No retreat state found for player black',
    );
  });
});
