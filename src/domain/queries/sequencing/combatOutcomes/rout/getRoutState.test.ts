import { createEmptyGameState } from '@factories';
import {
  createAttackApplyStateWithRout,
  createIssueCommandsPhaseState,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
  createRoutState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRoutState } from './getRoutState';

describe('getRoutState function', () => {
  it('returns the rout in play', () => {
    const empty = createEmptyGameState('standard');
    const defender = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', defender);
    const resolution = createRangedAttackResolutionState(empty, {
      attackApplyState: createAttackApplyStateWithRout(defender, {
        routState: rout,
      }),
      defendingUnit: defender,
    });
    const state = updatePhaseState(
      empty,
      createIssueCommandsPhaseState(empty, {
        currentCommandResolutionState: resolution,
      }),
    );

    expect(getRoutState(state)).toBe(rout);
  });

  it('throws when nothing is routing', () => {
    const empty = createEmptyGameState('standard');
    // Every step that resolves a rout runs after one was opened, so a caller
    // reaching here without one is out of sequence.
    const state = updatePhaseState(empty, createPlayCardsPhaseState());

    expect(() => getRoutState(state)).toThrow('No rout is in play');
  });
});
