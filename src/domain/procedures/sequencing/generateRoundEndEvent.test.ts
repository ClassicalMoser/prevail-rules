import { createEmptyGameState } from '@factories';
import { createCleanupPhaseState } from '@testing';
import { updatePhaseState } from '@transforms';

import { generateRoundEndEvent } from './generateRoundEndEvent';

/**
 * End of cleanup: advance round and return to play-cards phase. Emitted event is a fixed
 * `roundEnd` tag only — round/phase mutation happens in apply. Deliberately
 * does not branch on current `state` in the generator.
 */
describe('generateRoundEndEvent function', () => {
  it('ends the round with an effect that carries nothing', () => {
    // Both players have rallied or declined; Cleanup is complete.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createCleanupPhaseState({ step: 'complete' }),
    );

    // Nothing carries into the next round but what is on the table (§1.5);
    // the effect names only itself.
    expect(generateRoundEndEvent(state)).toStrictEqual({
      effectType: 'roundEnd',
      eventType: 'gameEffect',
    });
  });
});
