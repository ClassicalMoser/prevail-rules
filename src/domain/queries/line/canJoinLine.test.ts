import type {
  Coordinate,
  Restrictions,
  UnitFacing,
  UnitInstance,
} from '@entities';
import { getOppositeFacing } from '@queries/facings';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  getUnitByTrait,
  placed,
} from '@testing';
import type { Trait } from '@ruleValues';

import { canJoinLine } from './canJoinLine';

const coordinate: Coordinate = 'E-5';
const lineFacing: UnitFacing = 'north';
const oppositeFacing = getOppositeFacing(lineFacing);
// Inspiration range is not asked of line members, so an unrestricted order
// with no range limit is enough for every case that is not about restrictions.
const unrestricted: Restrictions = {
  inspirationRangeRestriction: -1,
  restrictionType: 'none',
};

/**
 * Board with one unit at the coordinate under test.
 */
function boardWithOccupant(unit: UnitInstance, facing: UnitFacing) {
  const board = createBoardWithUnits([placed(unit, coordinate, facing)]);
  return board;
}

/**
 * A space joins when it holds a friendly unit facing the line way or the
 * opposite, meeting the order's trait or type filter, not yet commanded this
 * round (§4.3.6) and not engaged (§4.3.4, §4.3.5). Otherwise it does not join.
 */
describe('canJoinLine function', () => {
  it('a friendly unit facing the line way joins', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(unit, lineFacing);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined?.unit).toBe(unit);
  });

  it('a friendly unit facing the opposite way joins', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(unit, oppositeFacing);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined?.unit).toBe(unit);
  });

  it('an engaged friendly primary facing the line way does not join', () => {
    const primary = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const secondary = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    // Our unit has walked into the enemy: both stand in E-5 (§2.2.1).
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      lineFacing,
    );

    // An engaged unit cannot be ordered, so the line stops there (§4.3.5, A1).
    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('an engaged friendly secondary facing the opposite way does not join', () => {
    // The secondary faces opposite the primary: the black unit faces south.
    const primary = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const secondary = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      lineFacing,
    );

    // Facing the opposite way would qualify, but being engaged does not (§4.3.5, A1).
    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a unit already commanded this round does not join', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(unit, lineFacing);

    // One order per unit per round: it has been ordered already (§4.3.6).
    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [unit],
    );

    expect(joined).toBeUndefined();
  });

  it('an empty space does not join', () => {
    const board = createBoardWithUnits([]);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('an enemy at the space does not join', () => {
    const enemy = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(enemy, lineFacing);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a friendly unit facing neither way does not join', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(unit, 'east');

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unrestricted,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a friendly unit missing a required trait does not join', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    // Require a trait this roster row does not have. Do not assume the default.
    const requiredTrait: Trait = unit.unitType.traits.includes('cavalry')
      ? 'phalanx'
      : 'cavalry';
    expect(unit.unitType.traits).not.toContain(requiredTrait);
    const board = boardWithOccupant(unit, lineFacing);
    // The order allows only units with that trait (§4.3.4).
    const traitRestriction: Restrictions = {
      inspirationRangeRestriction: -1,
      restrictionType: 'trait',
      traitRestrictions: [requiredTrait],
    };

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      traitRestriction,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a friendly unit of the wrong type does not join', () => {
    const requiredType = getUnitByTrait('cavalry');
    const neighborType = getUnitByTrait('phalanx');
    // The case needs two different roster rows. Call that out; do not assume it.
    expect(neighborType.id).not.toBe(requiredType.id);
    const unit = createTestUnit('black', {
      instanceNumber: 1,
      unitType: neighborType,
    });
    const board = boardWithOccupant(unit, lineFacing);
    // The order allows only that unit type (§4.3.4).
    const unitTypeRestriction: Restrictions = {
      inspirationRangeRestriction: -1,
      restrictionType: 'unitType',
      unitRestrictions: [requiredType.id],
    };

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      unitTypeRestriction,
      [],
    );

    expect(joined).toBeUndefined();
  });
});
