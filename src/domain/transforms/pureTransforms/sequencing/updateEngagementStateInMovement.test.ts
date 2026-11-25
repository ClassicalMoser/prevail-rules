import { createEmptyGameState } from '@factories';
import { getEngagementStateFromMovement } from '@queries';
import {
  createFrontEngagementState,
  createGameStateMovingInto,
  createGameStateResolvingCommand,
  createPlayCardsPhaseState,
  createRangedAttackResolutionState,
} from '@testing';

import { updatePhaseState } from '../state/updatePhaseState';
import { updateEngagementStateInMovement } from './updateEngagementStateInMovement';

/**
 * Only a move walks into an enemy (§6.1.1), and the engagement it makes is
 * set up as the move resolves (§4.3.10), so the move under way carries it.
 */
describe('updateEngagementStateInMovement function', () => {
  it('writes the engagement as it now stands onto the move under way', () => {
    // A move has walked into an enemy head on.
    const moving = createGameStateMovingInto(createFrontEngagementState());

    // The defender has chosen to fall back.
    const fallingBack = createFrontEngagementState({
      defendingUnitRetreats: true,
    });
    const after = updateEngagementStateInMovement(moving, fallingBack);

    // The move holds the engagement with that choice made.
    expect(getEngagementStateFromMovement(after)).toBe(fallingBack);
  });

  it('throws outside Phase 3, where no unit is moving', () => {
    const playingCards = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() =>
      updateEngagementStateInMovement(
        playingCards,
        createFrontEngagementState(),
      ),
    ).toThrow('Not in issueCommands phase');
  });

  it('throws during a shot, which engages nobody', () => {
    const empty = createEmptyGameState('standard');
    const shooting = createGameStateResolvingCommand(
      createRangedAttackResolutionState(empty),
      empty,
    );

    expect(() =>
      updateEngagementStateInMovement(shooting, createFrontEngagementState()),
    ).toThrow('Current command resolution is not a movement');
  });
});
