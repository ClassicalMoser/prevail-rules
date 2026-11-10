import { createUnitWithPlacement } from './unitWithPlacement';
import { enemyCuttingOffRetreat } from './enemyCuttingOffRetreat';

/** The enemy that cuts a unit's retreat stands right behind it, facing it (§9.1.5). */
describe('enemyCuttingOffRetreat function', () => {
  it('stands a black unit on F-5 facing north behind a white unit on E-5 facing north', () => {
    // White faces north, so its back is to F-5.
    const white = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'white',
    });

    const enemy = enemyCuttingOffRetreat(white);

    // Facing north from F-5, black looks straight at white's back.
    expect(enemy.placement).toStrictEqual({
      coordinate: 'F-5',
      facing: 'north',
    });
    expect(enemy.unit.playerSide).toBe('black');
  });
});
