import { describe, expect, it } from 'vitest';
import { chooseCardEventSchema } from './chooseCard';
import { playerChoiceEventSchema } from './playerChoice';

describe('playerChoiceEventSchema debug', () => {
  it('chooseCard branch exposes propValues for discriminated union', () => {
    const pv = chooseCardEventSchema._zod.propValues;
    expect(pv).toBeDefined();
    expect(Object.keys(pv ?? {})).not.toHaveLength(0);
    expect(pv?.choiceType).toBeDefined();
  });

  it('aggregate playerChoiceEventSchema does not throw on safeParse', () => {
    const r = playerChoiceEventSchema.safeParse({
      eventType: 'playerChoice',
      choiceType: 'chooseCard',
      eventNumber: 0,
      player: 'black',
      card: { id: '00000000-0000-4000-8000-000000000001' },
    });
    expect(r.success).toBe(true);
  });
});
