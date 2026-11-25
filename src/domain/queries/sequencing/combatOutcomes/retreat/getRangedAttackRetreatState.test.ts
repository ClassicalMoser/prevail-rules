import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithNothingDue,
  createAttackApplyStateWithRetreat,
  createIssueCommandsPhaseState,
  createRangedAttackResolutionState,
  createRetreatState,
  createTestUnit,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRangedAttackRetreatState } from './getRangedAttackRetreatState';

/** Issue-commands phase resolving the command this test built. */
function issueCommands(resolution: CommandResolutionState): GameState {
  const empty = createEmptyGameState('standard');
  return updatePhaseState(
    empty,
    createIssueCommandsPhaseState(empty, {
      currentCommandResolutionState: resolution,
    }),
  );
}

describe('getRangedAttackRetreatState function', () => {
  it('returns the retreat on the ranged attack apply', () => {
    // The shot drove White's unit back.
    const empty = createEmptyGameState('standard');
    const defender = createUnitWithPlacement({ playerSide: 'white' });
    const retreat = createRetreatState(
      defender.unit,
      legalRetreatsOf(defender),
    );
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRetreat(
        defender.unit,
        legalRetreatsOf(defender),
        {
          retreatState: retreat,
        },
      ),
      defendingUnit: defender.unit,
    });
    const state = issueCommands(resolution);

    expect(getRangedAttackRetreatState(state)).toBe(retreat);
  });

  it('throws when the ranged attack apply is still pending', () => {
    // The shot is aimed but not yet measured.
    const empty = createEmptyGameState('standard');
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: 'pending',
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackRetreatState(state)).toThrow(
      'No attack apply state found in ranged attack resolution',
    );
  });

  it('throws when the retreat is due and has not been opened', () => {
    // The shot reached the Retreat, and nothing has opened the step yet.
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender, {
        retreatState: 'pending',
      }),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackRetreatState(state)).toThrow(
      'The retreat on this attack apply has not been opened yet',
    );
  });

  it('throws when the ranged attack applied no retreat', () => {
    const empty = createEmptyGameState('standard');
    // This getter names a route to a retreat. An attack that applied none has
    // no retreat to route to, so the route is the thing that fails.
    const defender = createTestUnit('white', { attack: 2 });
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithNothingDue(defender),
      defendingUnit: defender,
    });
    const state = issueCommands(resolution);

    expect(() => getRangedAttackRetreatState(state)).toThrow(
      'The ranged attack applied no retreat',
    );
  });
});
