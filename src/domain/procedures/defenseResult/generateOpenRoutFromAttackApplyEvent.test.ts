import { generateOpenRoutFromAttackApplyEvent } from './generateOpenRoutFromAttackApplyEvent';

/**
 * An attack that reached a rout leaves it waiting on its apply until this
 * effect opens it, in a shot or a melee alike. Which apply is the state's to
 * name, so the effect carries nothing.
 */
describe('generateOpenRoutFromAttackApplyEvent function', () => {
  it('opens the rout with an effect that carries nothing', () => {
    expect(generateOpenRoutFromAttackApplyEvent()).toStrictEqual({
      effectType: 'openRoutFromAttackApply',
      eventType: 'gameEffect',
    });
  });
});
