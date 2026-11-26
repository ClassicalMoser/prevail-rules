import type { EngagementState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRetreatState,
  createUnitWithPlacement,
  legalRetreatsOf,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getFrontEngagementRetreatState } from './getFrontEngagementRetreatState';

/**
 * A movement command mid-resolution, having engaged what this test placed in
 * its path. This getter reads only that path, so the shape stays here.
 */
function stateEngaging(
  engagementState: EngagementState | 'pending',
): GameState {
  const empty = createEmptyGameState('standard');
  const movement = createMovementResolutionState(empty, { engagementState });
  const phaseState = createIssueCommandsPhaseState({
    currentCommandResolutionState: movement,
  });
  const engaging = updatePhaseState(empty, phaseState);
  return engaging;
}

describe('getFrontEngagementRetreatState function', () => {
  it('returns the retreat opened when the defender gave ground', () => {
    // White's unit stands in the space the moving unit advances into.
    const defendingUnit = createUnitWithPlacement({ playerSide: 'white' });
    // A front engagement the defender yields to opens a retreat for that unit.
    const retreat = createRetreatState(
      defendingUnit.unit,
      legalRetreatsOf(defendingUnit),
    );
    // The engagement is reached through the movement that caused it.
    const state = stateEngaging(
      createFrontEngagementState({ retreatState: retreat }),
    );

    expect(getFrontEngagementRetreatState(state)).toBe(retreat);
  });

  it('throws when the defender has not yet been offered the retreat', () => {
    // The default front engagement is still waiting on the defender's choice,
    // so its retreat slot holds 'pending'.
    const state = stateEngaging(createFrontEngagementState());

    expect(() => getFrontEngagementRetreatState(state)).toThrow(
      'No retreat state found in front engagement',
    );
  });

  it('throws when the defender stood', () => {
    // The defender chose not to give ground, so the engagement opened no
    // retreat and the two will fight in Phase 4 (§6.3.2).
    const state = stateEngaging(
      createFrontEngagementState({
        defendingUnitRetreats: false,
        retreatState: 'bypassed',
      }),
    );

    expect(() => getFrontEngagementRetreatState(state)).toThrow(
      'The defender stood; no retreat in front engagement',
    );
  });

  it('throws when the engagement came from the rear', () => {
    // A rear engagement routs the defender instead of letting it retreat, so
    // this getter has nothing to answer about.
    const state = stateEngaging(createRearEngagementState());

    expect(() => getFrontEngagementRetreatState(state)).toThrow(
      'Engagement type is not front',
    );
  });

  it('throws when the movement has engaged nobody', () => {
    // A move into an empty space never opens an engagement.
    const state = stateEngaging('pending');

    expect(() => getFrontEngagementRetreatState(state)).toThrow(
      'No engagement state found in movement resolution',
    );
  });
});
