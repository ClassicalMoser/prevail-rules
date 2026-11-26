import { generateTriggerRoutFromRetreatEvent } from './generateTriggerRoutFromRetreatEvent';

/**
 * A retreat with nowhere to go routs in its place (§9.1.6). Which retreat
 * is waiting for its rout is the state's to name (`getRetreatAwaitingRout`),
 * so the effect carries nothing.
 */
describe('generateTriggerRoutFromRetreatEvent function', () => {
  it('turns the retreat into a rout with an effect that carries nothing', () => {
    expect(generateTriggerRoutFromRetreatEvent()).toStrictEqual({
      effectType: 'triggerRoutFromRetreat',
      eventType: 'gameEffect',
    });
  });
});
