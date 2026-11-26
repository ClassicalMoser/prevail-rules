import { generateResolveFlankEngagementEvent } from './generateResolveFlankEngagementEvent';

/**
 * A defender engaged from the flank is turned to face its attacker
 * (§6.3.4). The movement and the board hold the attacker and the defender,
 * so the effect carries nothing.
 */
describe('generateResolveFlankEngagementEvent function', () => {
  it('turns the defender with an effect that carries nothing', () => {
    expect(generateResolveFlankEngagementEvent()).toStrictEqual({
      effectType: 'resolveFlankEngagement',
      eventType: 'gameEffect',
    });
  });
});
