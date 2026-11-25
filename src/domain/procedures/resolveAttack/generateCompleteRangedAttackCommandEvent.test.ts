import { generateCompleteRangedAttackCommandEvent } from './generateCompleteRangedAttackCommandEvent';

/**
 * Completes the ranged-attack command resolution sub-flow (after apply chain finishes).
 * Fixed `completeRangedAttackCommand` game effect; implementation does not read `state`.
 */
// TODO(misleading): it is owed when no shooter can be chosen, every unit of
// the order having shot or none left having a target (§4.3.11 step 1), not
// when an apply finishes; a finished shot is `completeRangedAttack`. Settle by
// saying so.
describe('generateCompleteRangedAttackCommandEvent function', () => {
  it('names the effect that ends a Shoot order, and carries nothing', () => {
    // The units the order skips are the ones the phase still lists, so the
    // event records none of them.
    expect(generateCompleteRangedAttackCommandEvent()).toStrictEqual({
      effectType: 'completeRangedAttackCommand',
      eventType: 'gameEffect',
    });
  });
});
