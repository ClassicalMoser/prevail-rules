import { createUnitWithPlacement } from './unitWithPlacement';
import { enemyBlockingStraightBack } from './enemyBlockingStraightBack';

/**
 * The enemy that bars a unit's straight step back without cutting its
 * retreat stands right behind it with its back to it (§9.1.5, §9.1.7).
 */
describe('enemyBlockingStraightBack function', () => {
  it('stands a black unit on F-5 facing south behind a white unit on E-5 facing north', () => {
    // White faces north, so its back is to F-5.
    const white = createUnitWithPlacement({
      coordinate: 'E-5',
      facing: 'north',
      playerSide: 'white',
    });

    const enemy = enemyBlockingStraightBack(white);

    // Facing south from F-5, black has its back to white.
    expect(enemy.placement).toStrictEqual({
      coordinate: 'F-5',
      facing: 'south',
    });
    expect(enemy.unit.playerSide).toBe('black');
  });
});
