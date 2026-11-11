import { createTestUnit } from '@testing';

import { createOpenedRoutState } from './createOpenedRoutState';

/**
 * A routed unit leaves the battle and its owner pays Morale for it (§9.3). The
 * amount is worked out by `resolveRout` once the rout opens.
 */
describe('createOpenedRoutState function', () => {
  it('opens a rout for the units leaving, owing a discard not yet counted or chosen', () => {
    const unit = createTestUnit('white', { attack: 2 });

    expect(createOpenedRoutState('white', [unit])).toStrictEqual({
      cardsChosen: false,
      completed: false,
      numberToDiscard: 'pending',
      player: 'white',
      substepType: 'rout',
      unitsToRout: [unit],
    });
  });
});
