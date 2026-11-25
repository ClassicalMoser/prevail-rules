import { tempCommandCards } from '@sampleValues';
import { createCardState, createOwnedCardState } from '@factories';

import { eachCardPresentOnce } from './eachCardPresentOnce';

// Stand-in cards from the sample deck. The check tells cards apart only by
// which card each is, so any distinct cards will do.
const [move, brace, screen, rampage, organize, recede, overrun, advance] =
  tempCommandCards;

// White's army and its hand just dealt, for the cases that judge Black's
// side: White's side is whole there, so any fault reported is Black's.
const whiteArmyCards = new Set([overrun, advance]);
const whiteDealt = createOwnedCardState({ inHand: [overrun, advance] });

/**
 * EachCardPresentOnce: eachCardPresentOnce.
 *
 * The cards an army brings are its hand for the whole battle (§3.1.2). They
 * move between their owner's places but never leave them, so every card each
 * army brought is in exactly one of its owner's places, and no other card is.
 */
describe('eachCardPresentOnce function', () => {
  it("accepts each army's cards just dealt into its hand", () => {
    // Each side holds every card its army brought, and nothing else.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move, brace] }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace]),
      whiteArmyCards,
      cardState,
    );

    // Every card is where a card may be, once.
    expect(validation).toStrictEqual({ result: true });
  });

  it("accepts a card in any of its owner's places, each card in one", () => {
    // Black's cards are spread over the hand, the card in play, and the
    // played, discard and burnt piles: a burnt card is gone from play but is
    // still one of the army's cards.
    const black = createOwnedCardState({
      burnt: [organize],
      discarded: [rampage],
      inHand: [move],
      inPlay: brace,
      played: [screen],
    });
    // White has chosen its card face down and not yet revealed it.
    const white = createOwnedCardState({
      awaitingPlay: overrun,
      inHand: [recede],
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace, screen, rampage, organize]),
      new Set([overrun, recede]),
      createCardState({ black, white }),
    );

    // Wherever each card lies, it lies in one place.
    expect(validation).toStrictEqual({ result: true });
  });

  it('counts each side against its own army, so both armies may bring the same card', () => {
    // Both armies brought a Move and a Brace: four cards, two on each side.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move, brace] }),
      white: createOwnedCardState({ inHand: [move, brace] }),
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace]),
      new Set([move, brace]),
      cardState,
    );

    // Neither side's copy is counted against the other's.
    expect(validation).toStrictEqual({ result: true });
  });

  it('refuses a card held twice in one hand', () => {
    // Black's army brought one Move, and its hand holds it twice.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move, move] }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move]),
      whiteArmyCards,
      cardState,
    );

    // One card recorded in two places.
    expect(validation).toStrictEqual({
      errorReason: 'Command card is present more than once',
      result: false,
    });
  });

  it('refuses a card both in hand and in play', () => {
    // The card in play has left the hand (§4.1.6), yet the hand still holds
    // it.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move], inPlay: move }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move]),
      whiteArmyCards,
      cardState,
    );

    // The card is met a second time when the card in play is read.
    expect(validation).toStrictEqual({
      errorReason: 'Command card is present more than once',
      result: false,
    });
  });

  it('refuses a card the army never brought, in place of one it did', () => {
    // Black's army brought a Move and a Brace; its hand holds the Move and a
    // Screen. Two cards for two, but the Screen was never Black's.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move, screen] }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace]),
      whiteArmyCards,
      cardState,
    );

    // No card joins a hand once the battle has begun (§3.1.2).
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected card',
      result: false,
    });
  });

  it('refuses a card face down that the army never brought', () => {
    // Black chose a Brace face down, but its army brought only a Move.
    const cardState = createCardState({
      black: createOwnedCardState({ awaitingPlay: brace, inHand: [move] }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move]),
      whiteArmyCards,
      cardState,
    );

    // The card face down is one of the army's places too.
    expect(validation).toStrictEqual({
      errorReason: 'Unexpected card',
      result: false,
    });
  });

  it('refuses an army whose card is in none of its places', () => {
    // Black's army brought a Move and a Brace; the Brace is nowhere.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move] }),
      white: whiteDealt,
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace]),
      whiteArmyCards,
      cardState,
    );

    // Cards only move between their owner's places, so a missing one was
    // lost from the record.
    expect(validation).toStrictEqual({
      errorReason: 'Expected cards not found',
      result: false,
    });
  });

  it("judges White's side once Black's holds", () => {
    // Black's side is whole; White's army brought one Move and its hand
    // holds it twice.
    const cardState = createCardState({
      black: createOwnedCardState({ inHand: [move, brace] }),
      white: createOwnedCardState({ inHand: [move, move] }),
    });

    const validation = eachCardPresentOnce(
      new Set([move, brace]),
      new Set([move]),
      cardState,
    );

    // White's fault is reported.
    expect(validation).toStrictEqual({
      errorReason: 'Command card is present more than once',
      result: false,
    });
  });
});
