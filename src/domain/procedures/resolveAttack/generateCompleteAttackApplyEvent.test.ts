import { generateCompleteAttackApplyEvent } from './generateCompleteAttackApplyEvent';

/**
 * An attack's apply closes once every result it reached has been carried
 * out. Which apply closes is the state's to name (`getAttackApplyToClose`):
 * a shot's only one, or in a melee the second player's unit's before the
 * first player's (§7.5.6). So the effect carries nothing.
 */
describe('generateCompleteAttackApplyEvent function', () => {
  it('closes the apply with an effect that carries nothing', () => {
    expect(generateCompleteAttackApplyEvent()).toStrictEqual({
      effectType: 'completeAttackApply',
      eventType: 'gameEffect',
    });
  });
});
