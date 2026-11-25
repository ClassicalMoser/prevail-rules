import { createAttackApplyState, createEmptyGameState } from '@factories';
import { createMeleeResolutionState, createTestUnit } from '@testing';

import { getMeleeAppliesInResolutionOrder } from './getMeleeAppliesInResolutionOrder';

/**
 * The two units' results take effect one after the other (§7.5.6):
 * the first player strikes first, so the second player's unit suffers first.
 */
describe('getMeleeAppliesInResolutionOrder function', () => {
  it("the second player's unit comes first, then the first player's", () => {
    // White holds the initiative, as an empty game starts, so white's unit is
    // the first player's. Neither blow reached a threshold; only the order
    // matters here.
    const state = createEmptyGameState('standard');
    const white = createAttackApplyState(createTestUnit('white'), {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
    const black = createAttackApplyState(createTestUnit('black'), {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
    const melee = createMeleeResolutionState(state, {
      attackOnFirstPlayerApplyState: white,
      attackOnSecondPlayerApplyState: black,
    });

    // Black's unit, the second player's, takes white's blow first.
    expect(getMeleeAppliesInResolutionOrder(melee)).toStrictEqual([
      black,
      white,
    ]);
  });

  it('an apply not yet written is left out', () => {
    // The blows have not been counted, so neither unit has results yet.
    const state = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(state, {
      attackOnFirstPlayerApplyState: 'pending',
      attackOnSecondPlayerApplyState: 'pending',
    });

    // Nothing has been resolved against either unit yet.
    expect(getMeleeAppliesInResolutionOrder(melee)).toStrictEqual([]);
  });
});
