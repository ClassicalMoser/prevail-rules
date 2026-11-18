import type { CommandResolutionState, GameState } from '@game';
import { createEmptyGameState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createIssueCommandsPhaseState,
  createMovementResolutionState,
  createTestCard,
} from '@testing';
import { updatePhaseState } from '@transforms';

import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';

/** Phase 3, carrying out the Move order this test built. */
function issueCommands(state: GameState, movement: CommandResolutionState) {
  const issuing = updatePhaseState(
    state,
    createIssueCommandsPhaseState(state, {
      currentCommandResolutionState: movement,
    }),
  );
  return issuing;
}

/** A defender engaged from the flank is turned to face its attacker (§6.3.4). */
describe('generateResolveFlankEngagementEvent function', () => {
  it('carries nothing, since the movement and the board hold the attacker and the defender', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const flank = createFlankEngagementState();
    const movement = createMovementResolutionState(state, {
      engagementState: flank,
      targetPlacement: flank.targetPlacement,
    });

    expect(
      generateResolveFlankEngagementEvent(issueCommands(state, movement)),
    ).toStrictEqual({
      effectType: 'resolveFlankEngagement',
      eventType: 'gameEffect',
    });
  });

  it('refuses a front engagement, whose defender is not turned', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const front = createFrontEngagementState();
    const movement = createMovementResolutionState(state, {
      engagementState: front,
      targetPlacement: front.targetPlacement,
    });

    expect(() =>
      generateResolveFlankEngagementEvent(issueCommands(state, movement)),
    ).toThrow('Engagement type is not flank');
  });
});
