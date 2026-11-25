import { tempCommandCards } from '@sampleValues';
import { createOwnedCardState } from './createOwnedCardState';

/**
 * A player's own cards exist in six places: the hand, the card chosen face down,
 * the card in play, and the played, discarded and burnt piles. A card is in
 * exactly one of them at a time. A side starts a game with all six empty, so
 * a caller names only the piles it means to fill.
 */
describe('createOwnedCardState function', () => {
  it('leaves every pile empty when no pile is named', () => {
    // Nothing named: the piles a player holds before any card is dealt.
    const piles = createOwnedCardState({});

    // All six empty, the two single places holding no card at all.
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
    // One card burnt, gone from the game for good (§10.3.2).
    const card = tempCommandCards[0];

    const piles = createOwnedCardState({ burnt: [card] });

    // The burnt pile holds it; nothing else was named, so nothing else holds
    // a card.
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
    // Four different cards, since a card can only be in one place: one chosen
    // face down this round, two still in hand, and one played in an earlier
    // round.
    const chosen = tempCommandCards[0];
    const held = tempCommandCards[1];
    const alsoHeld = tempCommandCards[2];
    const spent = tempCommandCards[3];

    // Only the three places that hold a card are named.
    const piles = createOwnedCardState({
      awaitingPlay: chosen,
      inHand: [held, alsoHeld],
      played: [spent],
    });

    // Each card is where it was put, and the places not named stay empty.
    expect(piles).toStrictEqual({
      awaitingPlay: chosen,
      burnt: [],
      discarded: [],
      inHand: [held, alsoHeld],
      inPlay: null,
      played: [spent],
    });
  });
});
