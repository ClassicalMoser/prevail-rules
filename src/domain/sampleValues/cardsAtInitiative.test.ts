import { cardsAtInitiative } from './cardsAtInitiative';

describe('cardsAtInitiative function', () => {
  it('takes cards that all carry the initiative asked for', () => {
    const cards = cardsAtInitiative(2, 3);

    expect(cards).toHaveLength(3);
    expect(cards.every((card) => card.initiative === 2)).toBe(true);
  });

  it('takes the same cards each time, so an army built from them is stable', () => {
    expect(cardsAtInitiative(3, 2)).toStrictEqual(cardsAtInitiative(3, 2));
  });

  it('throws when the catalog holds fewer cards at that initiative than asked for', () => {
    expect(() => cardsAtInitiative(1, 99)).toThrow(
      'Need at least 99 sample cards at initiative 1',
    );
  });
});
