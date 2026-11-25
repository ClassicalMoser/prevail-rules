import { createGameState, createTestCommand, createTestUnit } from '@testing';
import { addUnitsToCommandedUnits } from '@transforms';

import { isCommandIssuable } from './isCommandIssuable';

/**
 * Whether anyone at all may take the order on the card: one eligible unit is
 * enough, since the printed number is a ceiling, not a quota (§4.3.2), and a
 * unit within range is a line of one (§4.3.5).
 */
describe('isCommandIssuable function', () => {
  it('is issuable with fewer eligible units than the order’s number', () => {
    // One black unit, under an order for up to two.
    const state = createGameState([['E-5', 'black']]);
    const upToTwo = createTestCommand({ number: 2, size: 'units' });

    // The number is a ceiling, so one unit is enough to give the order.
    expect(isCommandIssuable(upToTwo, 'black', state)).toBe(true);
  });

  it('is not issuable when no unit may take the order', () => {
    // Black's one unit has had its order this round.
    const state = addUnitsToCommandedUnits(
      createGameState([['E-5', 'black']]),
      [createTestUnit('black', { instanceNumber: 1 })],
    );
    const upToSix = createTestCommand({ number: 6, size: 'units' });

    // One order per unit per round (§4.3.6) leaves nobody to order.
    expect(isCommandIssuable(upToSix, 'black', state)).toBe(false);
  });

  it('is issuable as a lines order when one unit may anchor a line', () => {
    // One black unit, a line of one under a lines order.
    const state = createGameState([['E-5', 'black']]);
    const oneLine = createTestCommand({ number: 1, size: 'lines' });

    // A lone unit is a line of one (§4.3.5).
    expect(isCommandIssuable(oneLine, 'black', state)).toBe(true);
  });
});
