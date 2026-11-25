import { tempCommandCards } from '@sampleValues';
import { createOwnedCardState } from './createOwnedCardState';

describe('createOwnedCardState function', () => {
  it('leaves every pile empty when no pile is named', () => {
    const piles = createOwnedCardState();

    expect(piles).toStrictEqual({
      awaitingPlay: null,
      burnt: [],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    });
  });

  it('sets the named pile and leaves the other five empty', () => {
    const card = tempCommandCards[0];

    const piles = createOwnedCardState({ burnt: [card] });

    expect(piles).toStrictEqual({
      awaitingPlay: null,
      burnt: [card],
      discarded: [],
      inHand: [],
      inPlay: null,
      played: [],
    });
  });

  it('sets several named piles at once', () => {
    const held = tempCommandCards[0];
    const spent = tempCommandCards[1];

    const piles = createOwnedCardState({
      awaitingPlay: held,
      inHand: [held],
      played: [spent],
    });

    expect(piles).toStrictEqual({
      awaitingPlay: held,
      burnt: [],
      discarded: [],
      inHand: [held],
      inPlay: null,
      played: [spent],
    });
  });
});
