import type {
  Command,
  CommandCard,
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
export function getCards(...indices: number[]): CommandCard[] {
  if (indices.length === 0) {
    return [];
  }
  const cards: CommandCard[] = [];
  for (const index of indices) {
    if (index < 0 || index >= tempCommandCards.length) {
      throw new Error(
        `Command card index ${index} is out of bounds. Available cards: 0-${tempCommandCards.length - 1}`,
      );
    }
    cards.push(tempCommandCards[index]);
  }
  return cards;
}

/**
 * Gets a specified number of cards from the tempCommandCards array, starting from the beginning.
 */
export function getCardsByCount(count: number = 1): CommandCard[] {
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

/**
 * Input for a test restriction. Trait and unit-type filters are separate
 * variants, matching {@link Restrictions}.
 */
export type TestRestrictionsInput =
  | {
      inspirationRangeRestriction?: number;
    }
  | {
      inspirationRangeRestriction?: number;
      traitRestrictions: Trait[];
    }
  | {
      inspirationRangeRestriction?: number;
      unitRestrictions: string[];
    };

export interface CreateTestCardOptions {
  id?: string;
  name?: string;
  version?: string;
  /** Army-building cost. Defaults to 10. */
  cost?: number;
  initiative?: number;
  modifiers?: StatModifier[];
  roundEffectModifiers?: Modifier[];
  roundEffectRestrictions?: TestRestrictionsInput;
  commandModifiers?: Modifier[];
  commandRestrictions?: TestRestrictionsInput;
  unitSupport?: UnitSupport;
}

/**
 * Builds a restriction from test input. An empty filter list is no filter.
 */
function createRestrictions(
  restrictions: TestRestrictionsInput | undefined,
): Restrictions {
  const inspirationRangeRestriction =
    restrictions?.inspirationRangeRestriction ?? -1;
  if (
    restrictions !== undefined &&
    'traitRestrictions' in restrictions &&
    restrictions.traitRestrictions.length > 0
  ) {
    const traitRestrictions = restrictions.traitRestrictions;
    const traitResult: Restrictions = {
      inspirationRangeRestriction,
      restrictionType: 'trait',
      traitRestrictions,
    };
    return traitResult;
  }
  if (
    restrictions !== undefined &&
    'unitRestrictions' in restrictions &&
    restrictions.unitRestrictions.length > 0
  ) {
    const unitRestrictions = restrictions.unitRestrictions;
    const unitResult: Restrictions = {
      inspirationRangeRestriction,
      restrictionType: 'unitType',
      unitRestrictions,
    };
    return unitResult;
  }
  const noneResult: Restrictions = {
    inspirationRangeRestriction,
    restrictionType: 'none',
  };
  return noneResult;
}

/**
 * A command with empty modifiers and restrictions, so a test can build a command without a card.
 */
export function createTestCommand(overrides: Partial<Command> = {}): Command {
  const restrictions: Restrictions = {
    inspirationRangeRestriction: -1,
    restrictionType: 'none',
  };
  return {
    modifiers: [],
    number: 1,
    restrictions,
    size: 'units',
    type: 'movement',
    ...overrides,
  };
}

/**
 * Creates a test card with sensible defaults.
 */
export function createTestCard(
  options: CreateTestCardOptions = {},
): CommandCard {
  const {
    id = 'test-card',
    name = 'Test CommandCard',
    version = '1.0.0',
    cost = 10,
    initiative = 1,
    modifiers = [],
    roundEffectModifiers = [],
    roundEffectRestrictions = {},
    commandModifiers = [],
    commandRestrictions = {},
    unitSupport = { count: 0, supportType: 'generic' },
  } = options;

  const command = createTestCommand({
    modifiers: commandModifiers,
    restrictions: createRestrictions(commandRestrictions),
  });
  const hasTraitFilter =
    'traitRestrictions' in roundEffectRestrictions &&
    roundEffectRestrictions.traitRestrictions.length > 0;
  const hasUnitFilter =
    'unitRestrictions' in roundEffectRestrictions &&
    roundEffectRestrictions.unitRestrictions.length > 0;
  const roundEffectIsSpecified =
    roundEffectModifiers.length > 0 ||
    roundEffectRestrictions.inspirationRangeRestriction !== -1 ||
    hasTraitFilter ||
    hasUnitFilter;
  const emptyRoundEffectRestrictions: Restrictions = {
    inspirationRangeRestriction: -1,
    restrictionType: 'none',
  };
  const roundEffect = roundEffectIsSpecified
    ? {
        modifiers: roundEffectModifiers,
        restrictions: createRestrictions(roundEffectRestrictions),
      }
    : {
        modifiers: [],
        restrictions: emptyRoundEffectRestrictions,
      };

  return {
    command,
    id,
    initiative,
    modifiers,
    name,
    cost,
    roundEffect,
    unitSupport,
    version,
  };
}
