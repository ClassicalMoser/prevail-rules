import { createAttackApplyState, createEmptyGameState } from '@factories';
import { createMeleeResolutionState, createTestUnit } from '@testing';

import { getMeleeAppliesInResolutionOrder } from './getMeleeAppliesInResolutionOrder';

/**
 * The two units' results take effect one after the other (§7.5.6):
 * the first player strikes first, so the second player's unit suffers first.
 */
describe('getMeleeAppliesInResolutionOrder function', () => {
  it("the second player's unit comes first, then the first player's", () => {
    const state = createEmptyGameState('standard');
    // Black holds initiative here, so black's unit is the first player's.
    const black = createAttackApplyState(createTestUnit('black'), {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
    const white = createAttackApplyState(createTestUnit('white'), {
      unitRetreated: false,
      unitReversed: false,
      unitRouted: false,
    });
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: black,
      secondPlayerAttackApplyState: white,
    });

    const inOrder = getMeleeAppliesInResolutionOrder(melee);

    // White's unit, the second player's, is hit first by black's attack.
    expect(inOrder).toStrictEqual([white, black]);
  });

  it('an apply not yet written is left out', () => {
    const state = createEmptyGameState('standard');
    const melee = createMeleeResolutionState(state, {
      firstPlayerAttackApplyState: 'pending',
      secondPlayerAttackApplyState: 'pending',
    });

    // Nothing has been resolved against either unit yet.
    expect(getMeleeAppliesInResolutionOrder(melee)).toStrictEqual([]);
  });
});
