import type { Coordinate, UnitFacing, UnitInstance, UnitType } from '@entities';
import { getOppositeFacing } from '@queries/facings';
import {
  createBoardWithEngagedUnits,
  createBoardWithUnits,
  createTestUnit,
  getUnitByTrait,
} from '@testing';
import type { Trait } from '@ruleValues';

import { canJoinLine } from './canJoinLine';

const coordinate: Coordinate = 'E-5';
const lineFacing: UnitFacing = 'north';
const oppositeFacing = getOppositeFacing(lineFacing);

/**
 * Board with one unit at the coordinate under test.
 */
function boardWithOccupant(unit: UnitInstance, facing: UnitFacing) {
  const board = createBoardWithUnits([
    {
      placement: { coordinate, facing },
      unit,
    },
  ]);
  return board;
}

/**
 * A space joins when it holds a friendly unit facing the line way or the
 * opposite, and meeting any trait or type filter. Engagement does not block
 * membership. Otherwise it does not join.
 */
describe(canJoinLine, () => {
  it('a friendly unit facing the line way joins', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = boardWithOccupant(unit, lineFacing);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      [],
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
      [],
      [],
    );

    expect(joined?.unit).toBe(unit);
  });

  it('an engaged friendly primary facing the line way joins', () => {
    const primary = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const secondary = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      lineFacing,
    );

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      [],
      [],
    );

    expect(joined?.unit).toBe(primary);
  });

  it('an engaged friendly secondary facing the opposite way joins', () => {
    // Secondary facing is opposite the primary. Primary faces the line way so
    // the black secondary faces south and still joins.
    const primary = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const secondary = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const board = createBoardWithEngagedUnits(
      primary,
      secondary,
      coordinate,
      lineFacing,
    );

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      [],
      [],
    );

    expect(joined?.unit).toBe(secondary);
  });

  it('an empty space does not join', () => {
    const board = createBoardWithUnits([]);

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      [],
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
      [],
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
      [],
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a friendly unit missing a required trait does not join', () => {
    const unit = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    // Require a trait this roster row does not have. Do not assume the default.
    const requiredTrait: Trait = unit.unitType.traits.includes('mounted')
      ? 'phalanx'
      : 'mounted';
    expect(unit.unitType.traits).not.toContain(requiredTrait);
    const board = boardWithOccupant(unit, lineFacing);
    const traitRequirements: Trait[] = [requiredTrait];

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      traitRequirements,
      [],
    );

    expect(joined).toBeUndefined();
  });

  it('a friendly unit of the wrong type does not join', () => {
    const requiredType = getUnitByTrait('mounted');
    const neighborType = getUnitByTrait('phalanx');
    // The case needs two different roster rows. Call that out; do not assume it.
    expect(neighborType.id).not.toBe(requiredType.id);
    const unit = createTestUnit('black', {
      instanceNumber: 1,
      unitType: neighborType,
    });
    const board = boardWithOccupant(unit, lineFacing);
    const unitTypeRequirements: UnitType[] = [requiredType];

    const joined = canJoinLine(
      board,
      coordinate,
      'black',
      lineFacing,
      oppositeFacing,
      [],
      unitTypeRequirements,
    );

    expect(joined).toBeUndefined();
  });
});
