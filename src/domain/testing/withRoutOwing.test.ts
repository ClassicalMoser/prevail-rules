import { createEmptyGameState } from '@factories';
import { findRoutLocation } from '@queries';

import { withRoutOwing } from './withRoutOwing';

/** A spec about paying a rout's discard needs the rout open and its cost known. */
describe('withRoutOwing function', () => {
  it('puts the game on the player’s rally, with a rout owing that many cards', () => {
    // White, holding the initiative, rallies first and owes two cards.
    const state = withRoutOwing(createEmptyGameState('standard'), 'white', 2);

    // The rout is on White's rally, its cost known and its cards unchosen.
    expect(findRoutLocation(state, 'white')?.routState).toMatchObject({
      cardsChosen: false,
      numberToDiscard: 2,
      player: 'white',
    });
  });
});
