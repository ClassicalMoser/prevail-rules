import { generateCompleteRangedAttackEvent } from './generateCompleteRangedAttackEvent';

/**
 * One shot of a Shoot order is done (§4.3.11); the event says so and carries
 * nothing else.
 */
describe('generateCompleteRangedAttackEvent function', () => {
  it('names the effect that ends one shot', () => {
    expect(generateCompleteRangedAttackEvent()).toStrictEqual({
      effectType: 'completeRangedAttack',
      eventType: 'gameEffect',
    });
  });
});
