import type {
  Card,
  Restrictions,
  UnitSupport,
  Modifier,
  StatModifier,
} from '@entities';
import type { Trait } from '@ruleValues';
import { tempCommandCards } from '@sampleValues';

/**
 * Gets cards from the tempCommandCards array by their indices.
 */
export function getCards(...indices: number[]): Card[] {
  if (indices.length === 0) {
    return [];
  }
  const cards: Card[] = [];
  for (const index of indices) {
    if (index < 0 || index >= tempCommandCards.length) {
      throw new Error(
        `Card index ${index} is out of bounds. Available cards: 0-${tempCommandCards.length - 1}`,
      );
    }
    cards.push(tempCommandCards[index]);
  }
  return cards;
}

/**
 * Gets a specified number of cards from the tempCommandCards array, starting from the beginning.
 */
export function getCardsByCount(count: number = 1): Card[] {
  if (count < 0) {
    throw new Error(`Count must be non-negative, got ${count}`);
  }
  if (count > tempCommandCards.length) {
    throw new Error(
      `Requested ${count} cards but only ${tempCommandCards.length} are available`,
    );
  }
  return tempCommandCards.slice(0, count);
}

export interface CreateTestCardOptions {
  id?: string;
  name?: string;
  version?: string;
  initiative?: number;
  modifiers?: StatModifier[];
  roundEffectModifiers?: Modifier[];
  roundEffectRestrictions?: {
    inspirationRangeRestriction?: number;
    traitRestrictions?: Trait[];
    unitRestrictions?: string[];
  };
  commandModifiers?: Modifier[];
  commandRestrictions?: {
    inspirationRangeRestriction?: number;
    traitRestrictions?: Trait[];
    unitRestrictions?: string[];
  };
  unitSupport?: UnitSupport;
}

/**
 * Creates a test card with sensible defaults.
 */
export function createTestCard(options: CreateTestCardOptions = {}): Card {
  const {
    id = 'test-card',
    name = 'Test Card',
    version = '1.0.0',
    initiative = 1,
    modifiers = [],
    roundEffectModifiers = [],
    roundEffectRestrictions = {},
    commandModifiers = [],
    commandRestrictions = {},
    unitSupport = { count: 0, supportType: 'generic' },
  } = options;

  const createRestrictions = (
    restrictions: CreateTestCardOptions['roundEffectRestrictions'],
  ): Restrictions => ({
    inspirationRangeRestriction:
      restrictions?.inspirationRangeRestriction ?? -1,
    traitRestrictions: restrictions?.traitRestrictions ?? [],
    unitRestrictions: restrictions?.unitRestrictions ?? [],
  });

  return {
    command: {
      modifiers: commandModifiers,
      number: 1,
      restrictions: createRestrictions(commandRestrictions),
      size: 'units',
      type: 'movement',
    },
    id,
    initiative,
    modifiers,
    name,
    roundEffect:
      roundEffectModifiers.length > 0 ||
      roundEffectRestrictions.inspirationRangeRestriction !== -1 ||
      (roundEffectRestrictions.traitRestrictions?.length ?? 0) > 0 ||
      (roundEffectRestrictions.unitRestrictions?.length ?? 0) > 0
        ? {
            modifiers: roundEffectModifiers,
            restrictions: createRestrictions(roundEffectRestrictions),
          }
        : {
            modifiers: [],
            restrictions: {
              inspirationRangeRestriction: -1,
              traitRestrictions: [],
              unitRestrictions: [],
            },
          },
    unitSupport,
    version,
  };
}
