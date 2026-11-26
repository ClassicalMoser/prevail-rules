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

  it('gives its round effect the bonus and reach a spec asks for', () => {
    const card = createTestCard({
      roundEffectModifiers: [{ type: 'attack', value: 2 }],
      roundEffectRestrictions: { inspirationRangeRestriction: 1 },
    });

    expect(card.roundEffect).toStrictEqual({
      modifiers: [{ type: 'attack', value: 2 }],
      restrictions: { inspirationRangeRestriction: 1, restrictionType: 'none' },
    });
  });

  it('gives its command the bonus a spec asks for', () => {
    const card = createTestCard({
      commandModifiers: [{ type: 'speed', value: 1 }],
    });

    expect(card.command.modifiers).toStrictEqual([{ type: 'speed', value: 1 }]);
  });

  it('filters its command to units with every trait a spec lists', () => {
    const card = createTestCard({
      commandRestrictions: { traitRestrictions: ['formation'] },
    });

    expect(card.command.restrictions).toMatchObject({
      restrictionType: 'trait',
      traitRestrictions: ['formation'],
    });
  });

  it('filters its command to the unit types a spec lists', () => {
    const card = createTestCard({
      commandRestrictions: { unitRestrictions: ['some-unit-type'] },
    });

    expect(card.command.restrictions).toMatchObject({
      restrictionType: 'unitType',
      unitRestrictions: ['some-unit-type'],
    });
  });

  it('treats an empty trait list as no filter', () => {
    const card = createTestCard({
      commandRestrictions: { traitRestrictions: [] },
    });

    expect(card.command.restrictions.restrictionType).toBe('none');
  });
});
