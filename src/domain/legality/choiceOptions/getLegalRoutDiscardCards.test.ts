import type { CommandCard, PlayerSide } from '@entities';
import type { AuthoritativeGameState, RoutState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createCleanupPhaseStateWithRallyRout,
  createPlayCardsPhaseState,
  createRoutState,
  createTestCard,
  createTestUnit,
  withRoutOwing,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { getLegalRoutDiscardCards } from './getLegalRoutDiscardCards';

// Stand-in cards, each in one hand only; which card does not matter here.
const firstCard = createTestCard();
const secondCard = createTestCard();
const thirdCard = createTestCard();

/** A new game with the given player holding the given hand. */
function holding(
  player: PlayerSide,
  hand: CommandCard[],
): AuthoritativeGameState {
  const withHand = updatePlayerCardState(
    createEmptyGameState('standard'),
    player,
    createOwnedCardState({ inHand: hand }),
  );
  return withHand;
}

/** Cleanup on the player's rally, with this rout open on it. */
function onRallyWithRout(
  state: AuthoritativeGameState,
  rout: RoutState,
): AuthoritativeGameState {
  const cleanup = updatePhaseState(
    state,
    createCleanupPhaseStateWithRallyRout(state, rout),
  );
  return cleanup;
}

/**
 * GetLegalRoutDiscardCards: atomic eligible hand card IDs + required count when
 * cleanup resolveRally awaits a rout discard.
 *
 * A routed unit's owner discards cards equal to its Morale, chosen freely from
 * their hand (§9.3.2). The offer names who pays, how many, and which cards
 * this view can see to choose from.
 */
describe('getLegalRoutDiscardCards function', () => {
  it('returns eligible hand card IDs and the required discard count', () => {
    // White's unit routed at its rally's support check and costs two cards.
    const state = withRoutOwing(
      holding('white', [firstCard, secondCard, thirdCard]),
      'white',
      2,
    );

    // Any of white's three cards may go.
    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [firstCard.id, secondCard.id, thirdCard.id],
      numberToDiscard: 2,
      player: 'white',
    });
  });

  // TODO(misleading): the title says the card list is empty, but the case
  // asserts every card in hand. Settled by retitling to what the code does (a
  // zero penalty still lists the hand), or by deciding that a Morale-0 rout
  // owes no discard choice at all (§9.3.2: "Morale 0 costs nothing").
  it('returns an empty card ID list when numberToDiscard is 0 but still reports the count', () => {
    // A Morale-0 unit routed: it costs nothing.
    const state = withRoutOwing(
      holding('white', [firstCard, secondCard, thirdCard]),
      'white',
      0,
    );

    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [firstCard.id, secondCard.id, thirdCard.id],
      numberToDiscard: 0,
      player: 'white',
    });
  });

  it('throws when no rout is awaiting a discard, where nothing asks', () => {
    // The players are still choosing their cards.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState(),
    );

    expect(() => getLegalRoutDiscardCards(state)).toThrow(
      'No rout is awaiting a discard',
    );
  });

  it('throws when the cards are already chosen, since the discard is no longer owed', () => {
    // White has paid for its routed unit.
    const routing = createTestUnit('white');
    const state = onRallyWithRout(
      holding('white', [firstCard]),
      createRoutState('white', routing, {
        cardsChosen: true,
        numberToDiscard: 1,
      }),
    );

    expect(() => getLegalRoutDiscardCards(state)).toThrow(
      'No rout is awaiting a discard',
    );
  });

  it('throws while the rout has not yet counted what it costs, since no discard is owed yet', () => {
    // White's unit has routed, and its Morale is still to be counted.
    const routing = createTestUnit('white');
    const state = onRallyWithRout(
      holding('white', [firstCard]),
      createRoutState('white', routing),
    );

    // Not yet owed: the same refusal as no rout at all.
    expect(() => getLegalRoutDiscardCards(state)).toThrow(
      'No rout is awaiting a discard',
    );
  });

  it('still returns available cards when the hand is smaller than numberToDiscard', () => {
    // White owes two cards and holds one; whether that loses is not asked here.
    const state = withRoutOwing(holding('white', [firstCard]), 'white', 2);

    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [firstCard.id],
      numberToDiscard: 2,
      player: 'white',
    });
  });

  it('whiteSeen returns white hand atoms when white must discard', () => {
    // White's seat sees its own hand.
    const state = projectGameStateForVisibility(
      withRoutOwing(holding('white', [firstCard, secondCard]), 'white', 1),
      'whiteSeen',
    );

    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [firstCard.id, secondCard.id],
      numberToDiscard: 1,
      player: 'white',
    });
  });

  it("whiteSeen answers black's count with no cards when black must discard, since white cannot see black's hand", () => {
    // Black owes a card; white holds the initiative, so black rallies second.
    const state = projectGameStateForVisibility(
      withRoutOwing(holding('black', [firstCard]), 'black', 1),
      'whiteSeen',
    );

    // A hidden hand is an ordinary state for a seated client: white sees
    // that black must discard one card, and none to choose from.
    expect(getLegalRoutDiscardCards(state)).toStrictEqual({
      cardIds: [],
      numberToDiscard: 1,
      player: 'black',
    });
  });
});
