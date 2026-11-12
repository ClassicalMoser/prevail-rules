import { cardsAtInitiative } from './cardsAtInitiative';

/**
 * A starter army must hold the same number of cards at every initiative
 * (§3.1.7), so it is built by taking that many sample cards at each value.
 */
describe('cardsAtInitiative function', () => {
  it('takes cards that all carry the initiative asked for', () => {
    // Three cards, every one at initiative 2.
    const cards = cardsAtInitiative(2, 3);

    expect(cards).toHaveLength(3);
    expect(cards.every((card) => card.initiative === 2)).toBe(true);
  });

  it('takes the same cards each time, so an army built from them is stable', () => {
    // Two calls with the same request give the same cards in the same order.
    expect(cardsAtInitiative(3, 2)).toStrictEqual(cardsAtInitiative(3, 2));
  });

  it('throws when the catalog holds fewer cards at that initiative than asked for', () => {
    // No catalog holds 99 cards at one initiative; a short catalog must not
    // quietly unbalance an army.
    expect(() => cardsAtInitiative(1, 99)).toThrow(
      'Need at least 99 sample cards at initiative 1',
    );
  });
});
