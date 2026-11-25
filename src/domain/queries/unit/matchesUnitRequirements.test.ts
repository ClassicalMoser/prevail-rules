import type { UnitType } from '@entities';
import { getUnitByTrait } from '@testing';

import { matchesUnitRequirements } from './matchesUnitRequirements';

/**
 * A command may order only a unit with every listed trait and, where unit
 * types are listed, of one of those types (§4.3.4).
 */
describe('matchesUnitRequirements function', () => {
  // A phalanx of formation troops, as Punic Citizen Spearmen are (§15). Its
  // traits are written out so each case can name one it lacks.
  const spearmen: UnitType = {
    ...getUnitByTrait('formation'),
    traits: ['formation', 'phalanx', 'melee'],
  };
  // Another type from the catalog, never the spearmen's.
  const otherType = getUnitByTrait('cavalry');

  it('meets a command that lists neither traits nor types', () => {
    // Nothing to fail.
    expect(matchesUnitRequirements(spearmen, [], [])).toBe(true);
  });

  it('meets a trait list only when it has every trait, in whatever order', () => {
    // Both of the listed traits, printed either way round.
    expect(
      matchesUnitRequirements(spearmen, ['formation', 'phalanx'], []),
    ).toBe(true);
    expect(
      matchesUnitRequirements(spearmen, ['phalanx', 'formation'], []),
    ).toBe(true);

    // One of the two is not enough: the unit has no missile trait.
    expect(
      matchesUnitRequirements(spearmen, ['formation', 'missile'], []),
    ).toBe(false);
    // Nor is none of them.
    expect(matchesUnitRequirements(spearmen, ['skirmisher'], [])).toBe(false);
  });

  it('meets a type list when its type is any one of those listed', () => {
    // Its own type, alone or among others.
    expect(matchesUnitRequirements(spearmen, [], [spearmen.id])).toBe(true);
    expect(
      matchesUnitRequirements(spearmen, [], [otherType.id, spearmen.id]),
    ).toBe(true);

    // Another type only.
    expect(matchesUnitRequirements(spearmen, [], [otherType.id])).toBe(false);
  });

  it('reads the type by its id, whichever copy of the record it is handed', () => {
    // A separate copy of the same unit type, as an event would carry it.
    const copy: UnitType = { ...spearmen };

    expect(matchesUnitRequirements(copy, [], [spearmen.id])).toBe(true);
  });

  it('must meet both lists when both are given', () => {
    // The right trait and the right type.
    expect(matchesUnitRequirements(spearmen, ['phalanx'], [spearmen.id])).toBe(
      true,
    );
    // The right trait, the wrong type.
    expect(matchesUnitRequirements(spearmen, ['phalanx'], [otherType.id])).toBe(
      false,
    );
    // The right type, a missing trait.
    expect(matchesUnitRequirements(spearmen, ['javelin'], [spearmen.id])).toBe(
      false,
    );
  });
});
