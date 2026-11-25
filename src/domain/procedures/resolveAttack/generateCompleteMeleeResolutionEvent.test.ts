import { generateCompleteMeleeResolutionEvent } from './generateCompleteMeleeResolutionEvent';

/**
 * Marks one melee engagement resolution as finished so the phase can advance to the next
 * engagement or complete the resolve-melee phase. Emits only `completeMeleeResolution`;
 * no inputs from `state` in the procedure body.
 */
describe('generateCompleteMeleeResolutionEvent function', () => {
  it('names the effect that ends one melee, and carries nothing', () => {
    // Whether the two units still stand locked is on the board (§7.2.3), so
    // the event records nothing of the fight.
    expect(generateCompleteMeleeResolutionEvent()).toStrictEqual({
      effectType: 'completeMeleeResolution',
      eventType: 'gameEffect',
    });
  });
});
