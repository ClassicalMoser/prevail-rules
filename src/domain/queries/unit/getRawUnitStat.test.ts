import { createEmptyGameState } from '@factories';
import { createTestUnit } from '@testing';

import { getRawUnitStat } from './getRawUnitStat';

/**
 * A unit's stat as the raw sum of its printed value and its modifiers, before
 * any floor (§7.1.4). Its job is to let a total that adds more — the attack
 * value, which adds support — be floored once, as a whole.
 *
 * The unit is a stand-in with an Attack of 2; the modifier is passed in, as a
 * commitment would be.
 */
describe('getRawUnitStat function', () => {
  const gameState = createEmptyGameState('standard');
  const unit = createTestUnit('black', { attack: 2 });

  it('adds the modifiers to the printed stat', () => {
    // 2 + 1.
    expect(
      getRawUnitStat(unit, 'attack', gameState, [{ type: 'attack', value: 1 }]),
    ).toBe(3);
  });

  it('may go below zero: the floor is the finished total’s, not this sum’s', () => {
    // 2 − 3. A later +2 of support would then make 1, as the raw arithmetic
    // says, not 2 from a floor taken too early.
    expect(
      getRawUnitStat(unit, 'attack', gameState, [
        { type: 'attack', value: -3 },
      ]),
    ).toBe(-1);
  });
});
