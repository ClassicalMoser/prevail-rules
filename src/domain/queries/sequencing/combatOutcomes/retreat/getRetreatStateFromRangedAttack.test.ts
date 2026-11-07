import type { UnitWithPlacement } from '@entities';
import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createAttackApplyState,
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRetreatStateFromRangedAttack } from './getRetreatStateFromRangedAttack';

function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
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

describe('getRetreatStateFromRangedAttack function', () => {
  it('returns the retreat on the ranged attack apply', () => {
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

    expect(getRetreatStateFromRangedAttack(state)).toBe(retreat);
  });

  it('throws when the ranged attack apply is still pending', () => {
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = issueCommands(resolution);

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the retreat is due and has not been opened', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender, {
        retreatState: 'pending',
      }),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'The retreat on this attack apply has not been opened yet',
    );
  });

  it('throws when the ranged attack applied no retreat', () => {
    const empty = createEmptyGameState('standard');
    // This getter names a route to a retreat. An attack that applied none has
    // no retreat to route to, so the route is the thing that fails.
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyState(defender),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRetreatStateFromRangedAttack(state)).toThrow(
      'The ranged attack applied no retreat',
    );
  });
});
