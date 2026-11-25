import type { CommandCard } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createChooseCardEvent, createEmptyGameState } from '@factories';
import { getPlayCardsPhaseState } from '@queries';
import {
  createPlayCardsPhaseState,
  createTestCard,
  updateCardState,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
} from '@transforms/pureTransforms';

import { applyChooseCardEvent } from './applyChooseCardEvent';

/**
 * Play-cards `chooseCards`: the chosen command card leaves `inHand` and sits in `awaitingPlay`
 * until both sides pick; then the round step advances to `revealCards`.
 */
// TODO(misleading): the step does not advance to `revealCards`; it stays on
// `chooseCards`, and the expected engine asks for the reveal once both cards
// are in (see the case below). Settle by rewording this header.
describe('applyChooseCardEvent function', () => {
  /** PlayCards.chooseCards with the supplied hands and no card awaiting play yet. */
  function createGameStateInChooseCardsStep(
    blackHand: CommandCard[],
    whiteHand: CommandCard[],
  ): AuthoritativeGameState {
    // A new game's piles are empty, so no card is awaiting play yet.
    const state = createEmptyGameState('standard');
    const stateWithCards = updateCardState(state, {
      ...state.cardState,
      black: { ...state.cardState.black, inHand: blackHand },
      white: { ...state.cardState.white, inHand: whiteHand },
    });

    // Phase 1, both players choosing.
    const stateWithPhase = updatePhaseState(
      stateWithCards,
      createPlayCardsPhaseState(),
    );
    return stateWithPhase;
  }

  // Black holds two cards, white one; every card in one place.
  const blackFirst = createTestCard();
  const blackSecond = createTestCard();
  const whiteOnly = createTestCard();

  it('lays the chosen card face down, out of the hand, and leaves the other player alone', () => {
    const state = createGameStateInChooseCardsStep(
      [blackFirst, blackSecond],
      [whiteOnly],
    );

    const newState = applyChooseCardEvent(
      createChooseCardEvent({ card: blackFirst, player: 'black' }),
      state,
    );

    // Black's card waits face down for the reveal (§4.1.1)…
    expect(newState.cardState.black.inHand).toStrictEqual([blackSecond]);
    expect(newState.cardState.black.awaitingPlay).toBe(blackFirst);
    // …and white, choosing at the same time, is untouched.
    expect(newState.cardState.white.inHand).toStrictEqual([whiteOnly]);
    expect(newState.cardState.white.awaitingPlay).toBeNull();
  });

  it('given black then white each choose their only card, the step stays chooseCards for the reveal to be asked for', () => {
    const state = createGameStateInChooseCardsStep([blackFirst], [whiteOnly]);

    // Both players choose (§4.1.1), in either order.
    const afterBlack = applyChooseCardEvent(
      createChooseCardEvent({ card: blackFirst, player: 'black' }),
      state,
    );
    const afterSecond = applyChooseCardEvent(
      createChooseCardEvent({ card: whiteOnly, player: 'white' }),
      afterBlack,
    );

    // The step does not move: the expected engine sees both cards in and
    // asks for the reveal (§4.1.2).
    expect(getPlayCardsPhaseState(afterSecond).step).toBe('chooseCards');
  });

  it('applies projected black chooseCard onto the hidden slice, and stays on chooseCards once both are in', () => {
    // White's seat sees its own hand, and only how many cards black holds.
    const authoritative = createGameStateInChooseCardsStep(
      [blackFirst],
      [whiteOnly],
    );
    const whiteSeen = projectGameStateForVisibility(authoritative, 'whiteSeen');

    // Black's choice reaches white's seat face down.
    const afterBlack = applyChooseCardEvent(
      {
        card: 'hidden',
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'black',
      },
      whiteSeen,
    );

    // One hidden card has left black's hand to lie face down.
    expect(afterBlack.cardState.black.awaitingPlay).toBe('hidden');
    expect(afterBlack.cardState.black.inHand).toStrictEqual([]);

    // White's own choice is shown on its own seat.
    const afterWhite = applyChooseCardEvent(
      createChooseCardEvent({ card: whiteOnly, player: 'white' }),
      afterBlack,
    );

    // The step does not move; the reveal is asked for next.
    expect(afterWhite.cardState.white.awaitingPlay).toBe(whiteOnly);
    expect(getPlayCardsPhaseState(afterWhite).step).toBe('chooseCards');
  });

  it('refuses a face-down card on a record that can see the hand', () => {
    // The full record holds every card, so a choice it folds must name one.
    const state = createGameStateInChooseCardsStep([blackFirst], [whiteOnly]);

    expect(() =>
      applyChooseCardEvent(
        {
          card: 'hidden',
          choiceType: 'chooseCard',
          eventType: 'playerChoice',
          player: 'black',
        },
        state,
      ),
    ).toThrow('No hidden player under authoritative visibility');
  });

  it('refuses a named card for a hand the seat cannot see', () => {
    // White's seat sees only how many cards black holds, so a card named for
    // black is a choice that seat was never sent.
    const whiteSeen = projectGameStateForVisibility(
      createGameStateInChooseCardsStep([blackFirst], [whiteOnly]),
      'whiteSeen',
    );

    expect(() =>
      applyChooseCardEvent(
        createChooseCardEvent({ card: blackFirst, player: 'black' }),
        whiteSeen,
      ),
    ).toThrow('Player black is not owned under whiteSeen visibility');
  });

  it('given prior black hand snapshot, apply leaves input state object unchanged', () => {
    const state = createGameStateInChooseCardsStep(
      [blackFirst, blackSecond],
      [whiteOnly],
    );

    applyChooseCardEvent(
      createChooseCardEvent({ card: blackFirst, player: 'black' }),
      state,
    );

    // Original state should be unchanged
    expect(state.cardState.black.inHand).toStrictEqual([
      blackFirst,
      blackSecond,
    ]);
    expect(state.cardState.black.awaitingPlay).toBeNull();
  });
});
