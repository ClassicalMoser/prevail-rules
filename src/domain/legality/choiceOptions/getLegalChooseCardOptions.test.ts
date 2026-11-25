import type { CommandCard } from '@entities';
import type { AuthoritativeGameState } from '@game';
import { createEmptyGameState, createOwnedCardState } from '@factories';
import {
  createMoveCommandersPhaseState,
  createPlayCardsPhaseState,
  createTestCard,
} from '@testing';
import {
  projectGameStateForVisibility,
  updatePhaseState,
  updatePlayerCardState,
} from '@transforms';

import { getLegalChooseCardOptions } from './getLegalChooseCardOptions';

const chooseCardBase = {
  choiceType: 'chooseCard' as const,
  eventType: 'playerChoice' as const,
};

// Stand-in cards, each in one place only: which card it is does not matter
// here, only whose hand holds it.
const blackCard = createTestCard();
const blackChosen = createTestCard();
const whiteCard = createTestCard();
const whiteSecondCard = createTestCard();
const whiteChosen = createTestCard();

/** One player's cards: what they still hold, and the card they have chosen, if any. */
interface Hand {
  inHand: CommandCard[];
  chosen: CommandCard | null;
}

/**
 * Phase 1 on its choosing step (§4.1.1), each player holding the hand given.
 * A card already chosen waits face down, out of the hand.
 */
function choosingCards(black: Hand, white: Hand): AuthoritativeGameState {
  // Both players' hands, and any card each has laid face down.
  const empty = createEmptyGameState('standard');
  const withBlack = updatePlayerCardState(
    empty,
    'black',
    createOwnedCardState({ awaitingPlay: black.chosen, inHand: black.inHand }),
  );
  const withBoth = updatePlayerCardState(
    withBlack,
    'white',
    createOwnedCardState({ awaitingPlay: white.chosen, inHand: white.inHand }),
  );

  // The first step of Phase 1.
  const choosing = updatePhaseState(withBoth, createPlayCardsPhaseState());
  return choosing;
}

/** Black with one card, white with two, neither having chosen yet. */
function bothStillChoosing(): AuthoritativeGameState {
  const state = choosingCards(
    { chosen: null, inHand: [blackCard] },
    { chosen: null, inHand: [whiteCard, whiteSecondCard] },
  );
  return state;
}

/**
 * GetLegalChooseCardOptions: pending owned players' in-hand cards during
 * playCards / chooseCards, including player-seen visibility.
 */
describe('getLegalChooseCardOptions function', () => {
  it('returns each in-hand card as a full ChooseCardEvent when both still choose', () => {
    const state = bothStillChoosing();
    const options = getLegalChooseCardOptions(state);

    // Three cards in all, each offered to the player holding it.
    expect(options).toHaveLength(3);
    expect(options.filter((o) => o.player === 'black')).toStrictEqual([
      { ...chooseCardBase, card: blackCard, player: 'black' },
    ]);
    expect(options.filter((o) => o.player === 'white')).toStrictEqual([
      { ...chooseCardBase, card: whiteCard, player: 'white' },
      { ...chooseCardBase, card: whiteSecondCard, player: 'white' },
    ]);
  });

  it('returns only the other player options when one has already chosen', () => {
    // Black has laid a card face down and still holds another; white has not
    // chosen.
    const state = choosingCards(
      { chosen: blackChosen, inHand: [blackCard] },
      { chosen: null, inHand: [whiteCard] },
    );

    // Black has made its choice for the round, so only white's card is offered.
    const options = getLegalChooseCardOptions(state);
    expect(options).toStrictEqual([
      { ...chooseCardBase, card: whiteCard, player: 'white' },
    ]);
  });

  it('returns empty when both players already have awaitingPlay set', () => {
    // Both have chosen, and each still holds a card.
    const state = choosingCards(
      { chosen: blackChosen, inHand: [blackCard] },
      { chosen: whiteChosen, inHand: [whiteCard] },
    );

    // Nobody is still choosing, so nothing is offered.
    expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
  });

  it('throws when asked outside the play cards phase, where nothing asks', () => {
    // The commanders are moving; the cards were chosen already.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createMoveCommandersPhaseState(),
    );

    expect(() => getLegalChooseCardOptions(state)).toThrow(
      'Expected playCards phase, got moveCommanders',
    );
  });

  it('throws when play cards is past the chooseCards step, where nothing asks', () => {
    // The cards are being compared for initiative.
    const state = updatePhaseState(
      createEmptyGameState('standard'),
      createPlayCardsPhaseState({ step: 'assignInitiative' }),
    );

    expect(() => getLegalChooseCardOptions(state)).toThrow(
      'Not on the chooseCards step: assignInitiative',
    );
  });

  it('throws on a visibility the game does not know', () => {
    // The exhaustive default, forced: no view of the game has this visibility.
    const state = bothStillChoosing();
    const unknownView = {
      ...state,
      // A value the type forbids, to reach the exhaustive default.
      cardState: { ...state.cardState, visibility: 'unknown' },
    } as never;

    // Today it fails only by accident, iterating the card state it was handed;
    // see the TODO(wrong) in `pendingOwnedPlayers`. The fix there names the
    // visibility, and this message changes with it.
    expect(() => getLegalChooseCardOptions(unknownView)).toThrow(
      'is not iterable',
    );
  });

  describe('player-seen visibility', () => {
    it('whiteSeen returns only white hand options while white is still choosing', () => {
      // White's seat sees its own hand and only the size of black's.
      const state = projectGameStateForVisibility(
        bothStillChoosing(),
        'whiteSeen',
      );

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        { ...chooseCardBase, card: whiteCard, player: 'white' },
        { ...chooseCardBase, card: whiteSecondCard, player: 'white' },
      ]);
    });

    it('blackSeen returns only black hand options while black is still choosing', () => {
      // Black's seat sees its own hand and only the size of white's.
      const state = projectGameStateForVisibility(
        bothStillChoosing(),
        'blackSeen',
      );

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        { ...chooseCardBase, card: blackCard, player: 'black' },
      ]);
    });

    it('spectator returns no options while both players are still choosing', () => {
      // A spectator sees neither hand.
      const state = projectGameStateForVisibility(
        bothStillChoosing(),
        'spectator',
      );

      expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
    });

    it('whiteSeen returns empty when white has already committed', () => {
      // White has chosen and still holds a card; black has not chosen.
      const state = projectGameStateForVisibility(
        choosingCards(
          { chosen: null, inHand: [blackCard] },
          { chosen: whiteChosen, inHand: [whiteCard] },
        ),
        'whiteSeen',
      );

      // White's own choice is made, and black's cannot be offered from here.
      expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
    });

    it('blackSeen returns empty once black has chosen', () => {
      // Black has chosen and still holds a card; white has not chosen.
      const state = projectGameStateForVisibility(
        choosingCards(
          { chosen: blackChosen, inHand: [blackCard] },
          { chosen: null, inHand: [whiteCard] },
        ),
        'blackSeen',
      );

      // Black's own choice is made, and white's cannot be offered from here.
      expect(getLegalChooseCardOptions(state)).toStrictEqual([]);
    });

    it("offers only white's cards on white's seat once black has chosen", () => {
      // Black's card lies face down: white's seat knows a card waits, not which.
      const state = projectGameStateForVisibility(
        choosingCards(
          { chosen: blackChosen, inHand: [blackCard] },
          { chosen: null, inHand: [whiteCard] },
        ),
        'whiteSeen',
      );

      expect(getLegalChooseCardOptions(state)).toStrictEqual([
        {
          ...chooseCardBase,
          card: whiteCard,
          player: 'white',
        },
      ]);
    });
  });
});
