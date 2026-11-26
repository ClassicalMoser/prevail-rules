import { generateOpenReverseFromAttackApplyEvent } from './generateOpenReverseFromAttackApplyEvent';

/**
 * An attack that reached a reverse leaves it waiting on its apply until
 * this effect opens it. Which apply is the state's to name, so the effect
 * carries nothing.
 */
describe('generateOpenReverseFromAttackApplyEvent function', () => {
  it('opens the reverse with an effect that carries nothing', () => {
    expect(generateOpenReverseFromAttackApplyEvent()).toStrictEqual({
      effectType: 'openReverseFromAttackApply',
      eventType: 'gameEffect',
    });
  });
});
