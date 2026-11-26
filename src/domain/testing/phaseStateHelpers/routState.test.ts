import { createTestUnit } from '@testing/unitHelpers';

import { createRoutState } from './routState';

/** One unit leaving the battle, its owner yet to pay its Morale (§9.3). */
describe('createRoutState function', () => {
  it('opens a rout of that one unit for its player, unpaid', () => {
    const unit = createTestUnit('white');

    const rout = createRoutState('white', unit);

    expect(rout.substepType).toBe('rout');
    expect(rout.player).toBe('white');
    expect(rout.unitsToRout).toStrictEqual([unit]);
    // Its Morale is counted later, by the procedure that resolves the rout.
    expect(rout.numberToDiscard).toBe('pending');
    expect(rout.cardsChosen).toBe(false);
    expect(rout.completed).toBe(false);
  });
});
