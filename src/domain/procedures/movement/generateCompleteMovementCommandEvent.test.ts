import { generateCompleteMovementCommandEvent } from './generateCompleteMovementCommandEvent';

/**
 * A Move order ends once none of the units it ordered is left to move, or
 * none left can (§4.3.9, §6.1.2). The units left over are the phase's to
 * say, so the effect records nothing.
 */
describe('generateCompleteMovementCommandEvent function', () => {
  it('ends the Move order with an effect that carries nothing', () => {
    // The effect names only itself.
    expect(generateCompleteMovementCommandEvent()).toStrictEqual({
      effectType: 'completeMovementCommand',
      eventType: 'gameEffect',
    });
  });
});
