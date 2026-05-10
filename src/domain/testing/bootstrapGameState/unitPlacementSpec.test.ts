import {
  assignInstanceNumbers,
  getExplicitInstanceNumber,
  normalizeUnitPlacement,
} from './unitPlacementSpec';

/**
 * GetExplicitInstanceNumber: Short-hand unit placement specification for bootstrapping test scenarios.
 */
describe(getExplicitInstanceNumber, () => {
  it('given tuple spec, returns undefined', () => {
    expect(getExplicitInstanceNumber(['E-5', 'black'])).toBeUndefined();
  });

  it('given provided, returns instanceNumber for object spec', () => {
    expect(
      getExplicitInstanceNumber({
        coord: 'E-5',
        instanceNumber: 5,
        player: 'black',
      }),
    ).toBe(5);
  });

  it('given object spec without instanceNumber, returns undefined', () => {
    expect(
      getExplicitInstanceNumber({ coord: 'E-5', player: 'black' }),
    ).toBeUndefined();
  });
});

describe(normalizeUnitPlacement, () => {
  it('given normalize tuple syntax with default facing', () => {
    const result = normalizeUnitPlacement(['E-5', 'black'], 1);
    expect(result.coordinate).toBe('E-5');
    expect(result.facing).toBe('north');
    expect(result.unit.playerSide).toBe('black');
    expect(result.unit.instanceNumber).toBe(1);
  });

  it('given normalize tuple syntax with explicit facing', () => {
    const result = normalizeUnitPlacement(['E-5', 'white', 'south'], 1);
    expect(result.facing).toBe('south');
  });

  it('given normalize object syntax with unit options', () => {
    const result = normalizeUnitPlacement(
      { attack: 3, coord: 'E-6', player: 'white' },
      1,
    );
    expect(result.coordinate).toBe('E-6');
    expect(result.unit.unitType.stats.attack).toBe(3);
  });

  it('given use explicit instance number from object spec', () => {
    const result = normalizeUnitPlacement(
      { coord: 'E-5', instanceNumber: 99, player: 'black' },
      1,
    );
    expect(result.unit.instanceNumber).toBe(99);
  });
});

describe(assignInstanceNumbers, () => {
  it('given auto-assign sequential numbers when not specified', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      ['E-6', 'black'],
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(2);
  });

  it('given preserve explicit instance numbers', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 5, player: 'black' },
      { coord: 'E-6', instanceNumber: 10, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(5);
    expect(result[1].instanceNumber).toBe(10);
  });

  it('given allow duplicate explicit numbers', () => {
    const result = assignInstanceNumbers([
      { coord: 'E-5', instanceNumber: 1, player: 'black' },
      { coord: 'E-6', instanceNumber: 1, player: 'white' },
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(1);
  });

  it('given continue auto-assign after explicit', () => {
    const result = assignInstanceNumbers([
      ['E-5', 'black'],
      { coord: 'E-6', instanceNumber: 99, player: 'white' },
      ['E-7', 'black'],
    ]);
    expect(result[0].instanceNumber).toBe(1);
    expect(result[1].instanceNumber).toBe(99);
    expect(result[2].instanceNumber).toBe(2);
  });
});
