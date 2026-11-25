import { createEmptyGameState } from '@factories';
import {
  createFlankEngagementState,
  createFrontEngagementState,
  createGameStateResolvingCommand,
  createMovementResolutionState,
  createTestCard,
} from '@testing';

import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';

/** A defender engaged from the flank is turned to face its attacker (§6.3.4). */
describe('generateResolveFlankEngagementEvent function', () => {
  it('carries nothing, since the movement and the board hold the attacker and the defender', () => {
    const state = createEmptyGameState('standard');
    state.cardState.black.inPlay = createTestCard();
    const flank = createFlankEngagementState();
    const movement = createMovementResolutionState(state, {
      engagementState: flank,
      targetPlacement: { coordinate: 'E-5', facing: 'north' },
    });

    expect(
      generateResolveFlankEngagementEvent(
        createGameStateResolvingCommand(movement, state),
      ),
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
      targetPlacement: { coordinate: 'E-5', facing: 'north' },
    });

    expect(() =>
      generateResolveFlankEngagementEvent(
        createGameStateResolvingCommand(movement, state),
      ),
    ).toThrow('Engagement type is not flank');
  });
});
