import type {
  CommandCard,
  Restrictions,
  UnitSupport,
  Modifier,
} from '@entities';
import type { StatModifier, Trait } from '@ruleValues';
import { randomUUID } from 'node:crypto';
import { createTestCommand } from './createTestCommand';

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
  // No range given is no range at all: the card reaches every unit wherever
  // it stands.
  const inspirationRangeRestriction =
    restrictions?.inspirationRangeRestriction ?? -1;

  // A list of traits filters to units with every one of them (§4.3.4).
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

    // The trait filter.
    return traitResult;
  }

  // A list of unit types filters to units of one of those types.
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

    // The unit-type filter.
    return unitResult;
  }

  // Otherwise no filter, and an empty list is the same as none.
  const noneResult: Restrictions = {
    inspirationRangeRestriction,
    restrictionType: 'none',
  };

  // No filter but the range.
  return noneResult;
}

/**
 * Creates a test card that parses as a {@link CommandCard}.
 * Each call mints a fresh id so two bare createTestCard() results cannot
 * collide under membership-by-id. Pass `id` only when a case needs a known
 * value; hard-coding breaks as soon as the helper is called twice.
 */
export function createTestCard(
  options: CreateTestCardOptions = {},
): CommandCard {
  // Stand-in values satisfy commandCardSchema; override per case for the fact
  // under test. A new uuid every call keeps two defaults from sharing an id.
  const {
    id = randomUUID(),
    name = 'Test CommandCard',
    version = '1.0.0',
    cost = 10,
    initiative = 1,
    modifiers = ['attack'],
    // Round effect is schema-required. Range 0 limits it to the commander's
    // space — do not seat the commander on a unit you do not want affected.
    // Even a flexibility stand-in can change outcomes if that range is open.
    roundEffectModifiers = [{ type: 'flexibility', value: 1 }],
    roundEffectRestrictions = { inspirationRangeRestriction: 0 },
    commandModifiers = [],
    commandRestrictions = {},
    unitSupport = { count: 1, supportType: 'generic' },
  } = options;

  // The command, with the bonuses and filters the spec asked for.
  const command = createTestCommand({
    modifiers: commandModifiers,
    restrictions: createRestrictions(commandRestrictions),
  });

  // The round effect, which applies all round to every unit it reaches,
  // ordered or not (§4.3.7).
  const roundEffect = {
    modifiers: roundEffectModifiers,
    restrictions: createRestrictions(roundEffectRestrictions),
  };

  // Unit support of one place for any unit is the plainest card there is
  // (§10.4.2); the commit stat defaults to Attack.
  const card: CommandCard = {
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

  // The card, fresh and parseable.
  return card;
}
