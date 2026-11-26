import { commandCardSchema } from '@entities';
import { createTestCard } from './createTestCard';

describe('createTestCard function', () => {
  it('mints a distinct parseable card each call', () => {
    const first = createTestCard();
    const second = createTestCard();

    // Fresh uuid every call — membership compares cards by id.
    expect(first.id).not.toBe(second.id);
    expect(commandCardSchema.safeParse(first).success).toBe(true);
    expect(commandCardSchema.safeParse(second).success).toBe(true);
    expect(first.name).toBe('Test CommandCard');
    expect(first.cost).toBe(10);
    expect(first.initiative).toBe(1);
    expect(first.command.type).toBe('movement');
  });

  it('given apply round effect modifiers and restrictions', () => {
    const card = createTestCard({
      roundEffectModifiers: [{ type: 'attack', value: 2 }],
      roundEffectRestrictions: { inspirationRangeRestriction: 1 },
    });
    expect(card.roundEffect).toBeDefined();
    expect(card.roundEffect?.modifiers).toHaveLength(1);
    expect(card.roundEffect?.restrictions.inspirationRangeRestriction).toBe(1);
  });

  it('given apply command modifiers', () => {
    const card = createTestCard({
      commandModifiers: [{ type: 'speed', value: 1 }],
    });
    expect(card.command.modifiers).toHaveLength(1);
  });
});
