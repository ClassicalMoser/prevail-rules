import type { UnitWithPlacement } from '@entities';
import {
  coordinatesOfSegment,
  createBoardWithFacingRow,
  createBoardWithUnits,
  createTestUnit,
  getUnitByTrait,
} from '@testing';
import type { Trait } from '@ruleValues';

import { getLineSegmentContainingUnit } from './getLineSegmentContainingUnit';

/**
 * The segment grows left and right on the perpendicular of the unit's facing.
 * A gap, an enemy, a wrong facing, or a missed requirement ends that side.
 * Length is not capped here.
 */
describe(getLineSegmentContainingUnit, () => {
  it('a lone unit is a segment of one', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5'],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5']);
  });

  it('two units facing north, side by side, are one segment', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6'],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'E-6']);
  });

  it('units on both sides keep left-to-right order', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-4', 'E-5', 'E-6'],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-4', 'E-5', 'E-6']);
  });

  it('two units facing opposite ways stay in the segment', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const board = createBoardWithUnits([
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'south' }, unit: second },
    ]);
    const anchor: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: first,
    };

    const segment = getLineSegmentContainingUnit(board, anchor, [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'E-6']);
  });

  it('an empty space ends the segment', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'E-6', 'E-8'],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'E-6']);
  });

  it('an enemy ends the segment', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const enemy = createTestUnit('white', { attack: 3, instanceNumber: 1 });
    const beyond = createTestUnit('black', { attack: 3, instanceNumber: 3 });
    const board = createBoardWithUnits([
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'north' }, unit: second },
      { placement: { coordinate: 'E-7', facing: 'north' }, unit: enemy },
      { placement: { coordinate: 'E-8', facing: 'north' }, unit: beyond },
    ]);
    const anchor: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: first,
    };

    const segment = getLineSegmentContainingUnit(board, anchor, [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'E-6']);
  });

  it('a unit facing east ends a segment of units facing north', () => {
    const first = createTestUnit('black', { attack: 3, instanceNumber: 1 });
    const second = createTestUnit('black', { attack: 3, instanceNumber: 2 });
    const turned = createTestUnit('black', { attack: 3, instanceNumber: 3 });
    const board = createBoardWithUnits([
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'north' }, unit: second },
      { placement: { coordinate: 'E-7', facing: 'east' }, unit: turned },
    ]);
    const anchor: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: first,
    };

    const segment = getLineSegmentContainingUnit(board, anchor, [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'E-6']);
  });

  it('a mounted requirement stops at the first unit without that trait', () => {
    const requiredTrait: Trait = 'mounted';
    const withTrait = getUnitByTrait(requiredTrait);
    const withoutTrait = getUnitByTrait('phalanx');
    // The gap unit must lack the required trait. Call that out; do not assume it.
    expect(withoutTrait.traits).not.toContain(requiredTrait);
    expect(withoutTrait.id).not.toBe(withTrait.id);
    const first = createTestUnit('black', {
      instanceNumber: 1,
      unitType: withTrait,
    });
    const second = createTestUnit('black', {
      instanceNumber: 2,
      unitType: withoutTrait,
    });
    const third = createTestUnit('black', {
      instanceNumber: 3,
      unitType: withTrait,
    });
    const board = createBoardWithUnits([
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'north' }, unit: second },
      { placement: { coordinate: 'E-7', facing: 'north' }, unit: third },
    ]);
    const anchor: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: first,
    };

    const segment = getLineSegmentContainingUnit(
      board,
      anchor,
      [requiredTrait],
      [],
    );

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5']);
  });

  it('a unit-type requirement stops at the first other type', () => {
    const requiredType = getUnitByTrait('mounted');
    const otherType = getUnitByTrait('phalanx');
    // The case needs two different roster rows. Call that out; do not assume it.
    expect(otherType.id).not.toBe(requiredType.id);
    const first = createTestUnit('black', {
      instanceNumber: 1,
      unitType: requiredType,
    });
    const second = createTestUnit('black', {
      instanceNumber: 2,
      unitType: otherType,
    });
    const board = createBoardWithUnits([
      { placement: { coordinate: 'E-5', facing: 'north' }, unit: first },
      { placement: { coordinate: 'E-6', facing: 'north' }, unit: second },
    ]);
    const anchor: UnitWithPlacement = {
      placement: { coordinate: 'E-5', facing: 'north' },
      unit: first,
    };

    const segment = getLineSegmentContainingUnit(
      board,
      anchor,
      [],
      [requiredType],
    );

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5']);
  });

  it('a unit on the north edge, facing north, is a segment of one', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['A-5'],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('A-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['A-5']);
  });

  it('two units facing east, one rank apart, are one segment', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['E-5', 'F-5'],
      facing: 'east',
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['E-5', 'F-5']);
  });

  it('two units facing north-east, one step north-west apart, are one segment', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: ['D-4', 'E-5'],
      facing: 'northEast',
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toStrictEqual(['D-4', 'E-5']);
  });

  it('a row of ten is still one uncapped segment', () => {
    const { board, unitAt } = createBoardWithFacingRow({
      coordinates: [
        'E-1',
        'E-2',
        'E-3',
        'E-4',
        'E-5',
        'E-6',
        'E-7',
        'E-8',
        'E-9',
        'E-10',
      ],
    });

    const segment = getLineSegmentContainingUnit(board, unitAt('E-5'), [], []);

    expect(coordinatesOfSegment(segment)).toHaveLength(10);
  });
});
