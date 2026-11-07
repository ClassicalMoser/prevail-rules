import { createRoutState, createTestUnit } from '@testing';

import { isAwaitingRoutDiscard } from './isAwaitingRoutDiscard';

describe('isAwaitingRoutDiscard function', () => {
  it('owes a discard once the penalty is known and the cards are not chosen', () => {
    const unit = createTestUnit('white', { attack: 2 });
    // `resolveRout` has set the count, so the choice is next.
    const rout = createRoutState('white', unit, { numberToDiscard: 2 });

    expect(isAwaitingRoutDiscard(rout)).toBe(true);
  });

  it('owes nothing while the penalty is still unknown', () => {
    const unit = createTestUnit('white', { attack: 2 });
    // The rout is open but `resolveRout` has not run, so nothing can be chosen.
    const rout = createRoutState('white', unit);

    expect(isAwaitingRoutDiscard(rout)).toBe(false);
  });

  it('owes nothing once the cards are chosen', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', unit, {
      cardsChosen: true,
      numberToDiscard: 2,
    });

    expect(isAwaitingRoutDiscard(rout)).toBe(false);
  });

  it('owes nothing once the rout is finished', () => {
    const unit = createTestUnit('white', { attack: 2 });
    const rout = createRoutState('white', unit, {
      completed: true,
      numberToDiscard: 2,
    });

    expect(isAwaitingRoutDiscard(rout)).toBe(false);
  });
});
