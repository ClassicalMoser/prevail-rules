import { createEmptyGameState } from '@factories';
import {
  createGameStateWithEngagedUnits,
  createGameStateWithUnits,
  createReverseState,
  createTestUnit,
  placed,
} from '@testing';

import { canReverseUnit } from './canReverseUnit';

/**
 * A unit can reverse once it is alone on its hex. An engagement blocks it.
 * A unit that has left the board cannot be asked.
 *
 * TODO(misleading): the board is a grid of square spaces (§2.1.1), not hexes;
 * "alone in its space" would say it.
 */
describe('canReverseUnit function', () => {
  it('lets a unit alone in its space reverse', () => {
    // White's unit stands by itself at E-5: whatever fought it has gone.
    const unit = createTestUnit('white');
    const state = createGameStateWithUnits([placed(unit, 'E-5', 'north')]);
    const reverse = createReverseState(unit);

    // Nothing shares its space, so the reverse turns it (§7.5.5).
    expect(canReverseUnit(reverse, state)).toBe(true);
  });

  it('keeps the primary unit of an engagement from reversing', () => {
    // White engaged Black at E-5; both still stand there.
    const white = createTestUnit('white');
    const black = createTestUnit('black');
    const state = createGameStateWithEngagedUnits(white, black, 'E-5', 'north');
    const reverse = createReverseState(white);

    // Still sharing a space with an enemy, it stays as it is (§7.5.5).
    expect(canReverseUnit(reverse, state)).toBe(false);
  });

  it('keeps the secondary unit of an engagement from reversing', () => {
    // The same engagement; this time the unit to reverse is Black's, the
    // secondary.
    const white = createTestUnit('white');
    const black = createTestUnit('black');
    const state = createGameStateWithEngagedUnits(white, black, 'E-5', 'north');
    const reverse = createReverseState(black);

    // Either unit of an engagement is held by it.
    expect(canReverseUnit(reverse, state)).toBe(false);
  });

  it('throws when the reversing unit has left the board', () => {
    // A unit routed on its way out of a retreat is no longer anywhere, so
    // there is no hex to judge and no answer to give.
    const reverse = createReverseState(createTestUnit('white'));

    expect(() =>
      canReverseUnit(reverse, createEmptyGameState('standard')),
    ).toThrow('Unit not found on board');
  });
});
