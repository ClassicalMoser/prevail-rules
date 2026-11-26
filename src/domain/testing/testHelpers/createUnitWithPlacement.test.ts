import { createUnitWithPlacement } from './createUnitWithPlacement';

/** A stand-in unit with where it stands, for a spec to put on a board. */
describe('createUnitWithPlacement function', () => {
  it('stands a Black stand-in on E-5 facing north when asked for nothing', () => {
    const result = createUnitWithPlacement();
    expect(result.placement.coordinate).toBe('E-5');
    expect(result.placement.facing).toBe('north');
    expect(result.unit.playerSide).toBe('black');
  });

  it('stands the unit of the side asked for where it is asked', () => {
    const result = createUnitWithPlacement({
      coordinate: 'D-4',
      facing: 'south',
      playerSide: 'white',
    });
    expect(result.placement.coordinate).toBe('D-4');
    expect(result.placement.facing).toBe('south');
    expect(result.unit.playerSide).toBe('white');
  });

  it('chooses the unit by the stats and number a spec asks for', () => {
    const result = createUnitWithPlacement({
      playerSide: 'black',
      unitOptions: { attack: 2, instanceNumber: 2 },
    });
    expect(result.unit.unitType.stats.attack).toBe(2);
    expect(result.unit.instanceNumber).toBe(2);
  });
});
