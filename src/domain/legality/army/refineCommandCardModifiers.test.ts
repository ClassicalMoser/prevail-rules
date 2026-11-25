import type { CommandCard } from '@entities';
import { commandCardSchema } from '@entities';
import { createTestCard } from '@testing';

import { refineCommandCardModifiers } from './refineCommandCardModifiers';

/**
 * A card raises each stat it names once per list, so no list on a card may
 * name a stat twice: not the stats it is committed for, nor its command's
 * modifiers, nor its round effect's.
 */
describe('refineCommandCardModifiers function', () => {
  // The card rules alone, run over a card that already has its shape.
  const cardRules = commandCardSchema.superRefine((card: CommandCard, ctx) => {
    refineCommandCardModifiers(card, ctx, []);
  });

  it('accepts a card whose lists each name a stat once', () => {
    // Committed for Attack or Speed; its command and round effect each raise
    // one stat.
    const card = createTestCard({
      commandModifiers: [{ type: 'attack', value: 1 }],
      modifiers: ['attack', 'speed'],
      roundEffectModifiers: [{ type: 'flexibility', value: 1 }],
    });

    expect(cardRules.safeParse(card).success).toBe(true);
  });

  it('refuses a card committed for the same stat twice', () => {
    // Attack listed twice among the stats the card may be committed for.
    const card = createTestCard({ modifiers: ['attack', 'attack'] });

    expect(cardRules.safeParse(card).error?.issues).toMatchObject([
      {
        message: 'A card cannot name a stat twice in one list.',
        path: ['modifiers', 1],
      },
    ]);
  });

  it('refuses a command that raises the same stat twice', () => {
    // The command's own modifiers name Speed twice.
    const card = createTestCard({
      commandModifiers: [
        { type: 'speed', value: 1 },
        { type: 'speed', value: 1 },
      ],
    });

    expect(cardRules.safeParse(card).error?.issues).toMatchObject([
      {
        message: 'A card cannot name a stat twice in one list.',
        path: ['command', 'modifiers', 1],
      },
    ]);
  });

  it('refuses a round effect that raises the same stat twice', () => {
    // The round effect names Defence twice.
    const card = createTestCard({
      roundEffectModifiers: [
        { type: 'defense', value: 1 },
        { type: 'defense', value: -1 },
      ],
    });

    expect(cardRules.safeParse(card).error?.issues).toMatchObject([
      {
        message: 'A card cannot name a stat twice in one list.',
        path: ['roundEffect', 'modifiers', 1],
      },
    ]);
  });

  it('lets two lists each raise the same stat', () => {
    // The command and the round effect are separate sources, so each may
    // raise Attack once.
    const card = createTestCard({
      commandModifiers: [{ type: 'attack', value: 1 }],
      roundEffectModifiers: [{ type: 'attack', value: 1 }],
    });

    expect(cardRules.safeParse(card).success).toBe(true);
  });
});
