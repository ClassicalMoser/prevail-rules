import type { UnitWithPlacement } from '@entities';
import type { EngagementState, GameState } from '@game';
import { createEmptyGameState, createUnitPlacement } from '@factories';
import {
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createRearEngagementState,
  createRetreatState,
  createTestUnit,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { getRetreatStateFromFrontEngagement } from './getRetreatStateFromFrontEngagement';

/**
 * A movement command mid-resolution, having engaged what this test placed in
 * its path. This getter reads only that path, so the shape stays here.
 */
function stateEngaging(
  engagementState: EngagementState | 'pending',
): GameState {
  const empty = createEmptyGameState('standard');
  const movement = createMovementResolutionState(empty, { engagementState });
  const phaseState = createIssueCommandsPhaseState(empty, {
    currentCommandResolutionState: movement,
  });
  const engaging = updatePhaseState(empty, phaseState);
  return engaging;
}

/** The defender standing in the space the moving unit advances into. */
function defender(): UnitWithPlacement {
  const unit = createTestUnit('white', { attack: 2 });
  const placement = createUnitPlacement('E-5', 'north');
  const standing = { placement, unit };
  return standing;
}

describe('getRetreatStateFromFrontEngagement function', () => {
  it('returns the retreat opened when the defender gave ground', () => {
    const defendingUnit = defender();
    // A front engagement the defender yields to opens a retreat for that unit.
    const retreat = createRetreatState(defendingUnit);
    // The engagement is reached through the movement that caused it.
    const state = stateEngaging(
      createFrontEngagementState({ retreatState: retreat }),
    );

    expect(getRetreatStateFromFrontEngagement(state)).toBe(retreat);
  });

  it('throws when the defender has not yet been offered the retreat', () => {
    // The default front engagement is still waiting on the defender's choice,
    // so its retreat slot holds 'pending'.
    const state = stateEngaging(createFrontEngagementState());

    expect(() => getRetreatStateFromFrontEngagement(state)).toThrow(
      'No retreat state found in front engagement',
    );
  });

  it('throws when the engagement came from the rear', () => {
    // A rear engagement routs the defender instead of letting it retreat, so
    // this getter has nothing to answer about.
    const state = stateEngaging(createRearEngagementState());

    expect(() => getRetreatStateFromFrontEngagement(state)).toThrow(
      'Engagement type is not front',
    );
  });

  it('throws when the movement has engaged nobody', () => {
    // A move into an empty space never opens an engagement.
    const state = stateEngaging('pending');

    expect(() => getRetreatStateFromFrontEngagement(state)).toThrow(
      'No engagement state found in movement resolution',
    );
  });
});
